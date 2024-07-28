import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { CounselorModule } from './counselor/counselor.module';
import { LetterModule } from './letter/letter.module';
import { PrismaModule } from './shared/prisma/prisma.module';
import { UserModule } from './user/user.module';

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
export class AppModule {}
