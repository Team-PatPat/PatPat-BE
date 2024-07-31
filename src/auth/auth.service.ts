import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User, Vendor } from '@prisma/client';
import { AxiosError } from 'axios';
import * as bcrypt from 'bcrypt';
import { firstValueFrom } from 'rxjs';
import { UserService } from 'src/user/user.service';
import { objectToCamel } from 'ts-case-convert';
import {
  KakaoProfileResponse,
  NaverProfileResponse,
  Payload,
  TokenResponse,
} from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly userService: UserService,
  ) {}

  private generateAccessToken(payload: {
    id: string;
    email: string;
    name: string;
    avatarUrl?: string;
  }) {
    return this.jwtService.sign(payload);
  }

  private generateRefreshToken(payload: { id: string }) {
    return this.jwtService.sign(payload, {
      expiresIn: this.configService.get('REFRESH_TOKEN_EXPIRATION') || '7d',
    });
  }

  /**
   * Generates access and refresh tokens.
   *
   * @returns Access & refresh tokens
   */
  generateTokens(command: {
    id: string;
    email: string;
    name: string;
    avatarUrl?: string;
  }) {
    const accessToken = this.generateAccessToken({
      id: command.id,
      email: command.email,
      name: command.name,
      avatarUrl: command.avatarUrl,
    });
    const refreshToken = this.generateRefreshToken({ id: command.id });

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Verifies a token.
   *
   * @param token A token to verify.
   * @returns A payload in the token if valid.
   */
  async verifyToken(token: string) {
    return this.jwtService.verifyAsync(token);
  }

  async regenerateTokensByRefreshToken(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException(`Invalid token.`);
    }

    const payload = (await this.verifyToken(refreshToken)) as Pick<
      Payload,
      'id'
    >;

    const existingUser = await this.userService.findUserByUserId(payload.id);
    if (!existingUser) {
      throw new UnauthorizedException(`Invalid token.`);
    }

    return this.generateTokens({
      id: existingUser.id,
      name: existingUser.name,
      email: existingUser.email,
      avatarUrl: existingUser.avatarUrl,
    });
  }

  async logIn(
    vendor: Vendor,
    code: string,
    email?: string,
    password?: string,
  ): Promise<TokenResponse & User> {
    let profile: Pick<
      User,
      'name' | 'email' | 'avatarUrl' | 'vendor' | 'vendorUserId'
    > = {
      name: null,
      email: null,
      avatarUrl: null,
      vendor: null,
      vendorUserId: null,
    };

    if (vendor === Vendor.KAKAO) {
      try {
        const response = await firstValueFrom(
          this.httpService.get<KakaoProfileResponse>(
            `https://kapi.kakao.com/v2/user/me`,
            {
              headers: {
                Authorization: `Bearer ${code}`,
              },
            },
          ),
        );

        if (response.status !== 200) {
          console.error(response.data);

          throw new Error(`Failed to log in to Kakao.`);
        }

        const _profile = objectToCamel(response.data);

        profile = {
          email: _profile.kakaoAccount.email,
          name: null,
          avatarUrl: _profile.kakaoAccount.profile.profileImageUrl,
          vendor: Vendor.KAKAO,
          vendorUserId: `${_profile.id}`,
        };
      } catch (e: unknown) {
        if (e instanceof AxiosError) {
          throw new BadRequestException(e.message);
        }

        console.warn(e);
        throw new BadRequestException(`Failed to log in to Kakao.`);
      }
    } else if (vendor === Vendor.NAVER) {
      try {
        const response = await firstValueFrom(
          this.httpService.get<NaverProfileResponse>(
            `https://openapi.naver.com/v1/nid/me`,
            {
              headers: {
                Authorization: `Bearer ${code}`,
              },
            },
          ),
        );

        if (response.status !== 200) {
          console.error(response.data);

          throw new Error(`Failed to log in to Naver.`);
        }

        const _profile = objectToCamel(response.data);

        profile = {
          email: _profile.response.email,
          name: null,
          avatarUrl: _profile.response.profileImage,
          vendor: Vendor.NAVER,
          vendorUserId: _profile.response.id,
        };
      } catch (e: unknown) {
        if (e instanceof AxiosError) {
          console.warn(e.response.data);
          throw new BadRequestException(e.message);
        }
        throw new BadRequestException(`Failed to log in to Naver.`);
      }
    } else if (vendor === 'LOCAL') {
      if (!email || !password) {
        throw new BadRequestException(`Invalid email or password.`);
      }

      const existingUser = await this.userService.findUserByEmail(email);

      if (existingUser.vendor !== 'LOCAL') {
        throw new BadRequestException(
          `Invalid login request. Check your login vendor.`,
        );
      }

      const isMatched = bcrypt.compareSync(password, existingUser.password);
      if (!isMatched) {
        throw new BadRequestException(`Invalid email or password.`);
      }

      return {
        ...existingUser,
        ...this.generateTokens({
          id: existingUser.id,
          name: existingUser.name,
          email: existingUser.email,
          avatarUrl: existingUser.avatarUrl,
        }),
      };
    } else {
      throw new BadRequestException(`The ${vendor} is not supported yet.`);
    }

    let existingUser = await this.userService.findUserByEmail(profile.email);

    if (!existingUser) {
      existingUser = await this.userService.signUp(
        profile.name,
        profile.email,
        profile.vendor,
        profile.avatarUrl,
        profile.vendorUserId,
      );
    }

    await this.userService.updateUserAsNotNew(existingUser.id);

    return {
      ...existingUser,
      ...this.generateTokens({
        id: existingUser.id,
        name: existingUser.name,
        email: existingUser.email,
        avatarUrl: existingUser.avatarUrl,
      }),
    };
  }
}
