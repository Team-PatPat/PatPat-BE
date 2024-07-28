import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import * as cookie from 'cookie';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Payload } from './auth.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          const cookies = cookie.parse(req.headers.cookie || '');

          return (
            cookies['access_token'] ||
            req.headers.authorization?.replaceAll('Bearer ', '')
          );
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('TOKEN_SECRET_KEY'),
    });
  }

  async validate(payload: Payload) {
    return payload;
  }
}
