import { Body, Controller, HttpCode, Post, Req, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { Public } from './auth.decorator';
import { LogInRequest, TokenResponse } from './auth.dto';
import { AuthService } from './auth.service';

@ApiTags('Auth')
@Controller('/api/v1')
export class AuthController {
  private ACCESS_TOKEN_EXPIRATION = this.configService.get<number>(
    'ACCESS_TOKEN_EXPIRATION',
  );
  private REFRESH_TOKEN_EXPIRATION = this.configService.get<number>(
    'REFRESH_TOKEN_EXPIRATION',
  );

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @HttpCode(200)
  @Post('/login')
  @ApiOperation({ summary: '로그인' })
  @ApiOkResponse({
    description: 'OK.',
    type: TokenResponse,
  })
  @ApiBadRequestResponse({ description: 'Invalid request.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error.' })
  async logIn(@Body() request: LogInRequest, @Res() response: Response) {
    const tokens = await this.authService.logIn(
      request.vendor,
      request.code,
      request.email,
      request.password,
    );

    response.cookie('access_token', tokens.accessToken, {
      httpOnly: true,
      secure: false,
      maxAge: this.ACCESS_TOKEN_EXPIRATION,
    });

    response.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: false,
      maxAge: this.REFRESH_TOKEN_EXPIRATION,
    });

    return response.json(tokens);
  }

  @Public()
  @Post('/refresh')
  @ApiOperation({ summary: '토큰 갱신' })
  @ApiCreatedResponse({
    description: 'Created.',
    type: TokenResponse,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error.' })
  async regenerateTokens(@Req() request: Request, @Res() response: Response) {
    const refreshToken =
      request.cookies['refresh_token'] || request.body?.refreshToken;

    const tokens =
      await this.authService.regenerateTokensByRefreshToken(refreshToken);

    response.cookie('access_token', tokens.accessToken, {
      httpOnly: true,
      secure: false,
      maxAge: this.ACCESS_TOKEN_EXPIRATION,
    });

    response.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: false,
      maxAge: this.REFRESH_TOKEN_EXPIRATION,
    });

    return response.json(tokens);
  }

  @HttpCode(200)
  @Post('/logout')
  @ApiOperation({ summary: '로그아웃' })
  @ApiOkResponse({
    description: 'OK.',
    type: TokenResponse,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error.' })
  async logOut(@Res() response: Response) {
    response.clearCookie('access_token');
    response.clearCookie('refresh_token');

    return response.send();
  }
}
