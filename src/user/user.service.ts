import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User, Vendor } from '@prisma/client';
import { randomUUID } from 'crypto';
import { firstValueFrom } from 'rxjs';
import { Page, Pageable } from 'src/shared/model/page.model';
import { PrismaService } from 'src/shared/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async findUsers(pageable: Pageable): Promise<Page<User>> {
    const users = await this.prismaService.user.findMany({
      skip: (pageable.page - 1) * pageable.size,
      take: pageable.size,
    });
    const total = await this.prismaService.user.count();

    return new Page<User>(users, total, pageable.page, pageable.size);
  }

  findUserByUserId(userId: string): Promise<User> {
    return this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
    });
  }

  findUserByEmail(email: string): Promise<User> {
    return this.prismaService.user.findUnique({
      where: {
        email,
      },
    });
  }

  async updateUserAsNotNew(userId: string) {
    const user = await this.findUserByUserId(userId);
    if (!user) {
      throw new NotFoundException(`User not found.`);
    }

    return this.prismaService.user.update({
      where: {
        id: user.id,
      },
      data: {
        isNew: false,
      },
    });
  }

  /**
   * 사용자 정보 변경.
   *
   * @param userId 변경할 사용자 고유번호
   * @param name  변경할 사용자명
   * @param mbti 변경할 MBTI
   */
  async updateUserByUserId(
    userId: string,
    name: string | null,
    mbti: string | null,
  ) {
    const user = await this.findUserByUserId(userId);
    if (!user) {
      throw new NotFoundException(`User not found.`);
    }

    return this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        name,
        mbti,
      },
    });
  }

  /**
   * Signs up.
   *
   * @param name A name
   * @param email  An email
   * @param vendor  A social oauth vendor
   * @returns An user
   */
  async signUp(
    name: string,
    email: string,
    vendor: Vendor,
    avatarUrl?: string,
    vendorUserId?: string,
  ): Promise<User> {
    const existingUser = await this.prismaService.user.findUnique({
      where: {
        email: email,
      },
    });

    if (
      existingUser &&
      (existingUser.vendor === 'LOCAL' || existingUser.vendor !== vendor)
    ) {
      throw new BadRequestException(`User already signed up.`);
    }

    return this.prismaService.user.create({
      data: {
        id: randomUUID(),
        email,
        name,
        vendor,
        avatarUrl,
        vendorUserId,
      },
    });
  }

  async deleteUser(userId: string) {
    const user = await this.findUserByUserId(userId);

    if (!user) {
      throw new NotFoundException(`User not found.`);
    }

    if (user.vendor === 'KAKAO') {
      const response = await firstValueFrom(
        this.httpService.post(
          `	https://kapi.kakao.com/v1/user/unlink`,
          {
            target_id_type: 'user_id',
            target_id: user.vendorUserId,
          },
          {
            headers: {
              Authorization: `KakaoAK ${this.configService.get('KAKAO_ADMIN_KEY')}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
        ),
      );

      if (response.status >= 400) {
        throw new InternalServerErrorException(`Failed to unlink from Kakao.`);
      }
    }

    this.prismaService.$transaction(async (tx) => {
      await tx.message.deleteMany({
        where: {
          chat: {
            userId: user.id,
          },
        },
      });

      await tx.chat.deleteMany({
        where: {
          userId: user.id,
        },
      });

      await tx.letter.deleteMany({
        where: {
          userId: user.id,
        },
      });

      await tx.user.delete({
        where: {
          id: user.id,
        },
      });
    });
  }
}
