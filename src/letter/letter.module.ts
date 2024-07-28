import { forwardRef, Module } from '@nestjs/common';
import { ChatModule } from 'src/chat/chat.module';
import { PrismaModule } from 'src/shared/prisma/prisma.module';
import { LetterGenerationBot } from './bots/letter.bot';
import { LetterController } from './letter.controller';
import { LetterService } from './letter.service';

@Module({
  imports: [PrismaModule, forwardRef(() => ChatModule)],
  controllers: [LetterController],
  providers: [LetterService, LetterGenerationBot],
  exports: [LetterService, LetterGenerationBot],
})
export class LetterModule {}
