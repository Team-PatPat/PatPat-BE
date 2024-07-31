import {
  Injectable,
  Logger,
  MiddlewareConsumer,
  Module,
  NestMiddleware,
  NestModule,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as cookie from 'cookie';
import { NextFunction, Request, Response } from 'express';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { CounselorModule } from './counselor/counselor.module';
import { LetterModule } from './letter/letter.module';
import { PrismaModule } from './shared/prisma/prisma.module';
import { UserModule } from './user/user.module';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(request: Request, response: Response, next: NextFunction): void {
    const { ip, method, originalUrl, params, query } = request;

    // 응답이 끝났을 때
    const { statusCode } = response;

    const originalSend = response.send;

    response.send = function (body: any) {
      response.send = originalSend;
      response.send(body);

      this.logger.log(
        `[${method}]${originalUrl}`,
        JSON.stringify(
          {
            ip,
            statusCode,
            headers: request.headers,
            cookie: request.headers.cookie
              ? cookie.parse(request.headers.cookie)
              : null,
            params,
            query,
            request: request.body,
            response: body,
          },
          null,
          4,
        ),
      );
    }.bind(this);

    next();
  }
}

@Module({
  imports: [
    CounselorModule,
    ChatModule,
    AuthModule,
    UserModule,
    PrismaModule,
    LetterModule,
    ConfigModule.forRoot({ isGlobal: true }),
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
