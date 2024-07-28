import { HttpModule } from '@nestjs/axios';
import { forwardRef, Module } from '@nestjs/common';
import { CounselorModule } from 'src/counselor/counselor.module';
import { LetterModule } from 'src/letter/letter.module';
import { PrismaModule } from 'src/shared/prisma/prisma.module';
import { UserModule } from 'src/user/user.module';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { HyperClovaXClient } from './hyperclovax.client';

@Module({
  imports: [
    HttpModule,
    PrismaModule,
    UserModule,
    forwardRef(() => LetterModule),
    CounselorModule,
  ],
  controllers: [ChatController],
  providers: [ChatService, HyperClovaXClient],
  exports: [ChatService, HyperClovaXClient],
})
export class ChatModule {}
