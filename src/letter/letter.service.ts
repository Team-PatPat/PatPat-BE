import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Message, MessageStatus } from '@prisma/client';
import { randomUUID } from 'crypto';
import { ChatService } from 'src/chat/chat.service';
import { Page, Pageable } from 'src/shared/model/page.model';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { LetterGenerationBot } from './bots/letter.bot';
import { LetterResponse } from './letter.model';

@Injectable()
export class LetterService {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject(forwardRef(() => LetterGenerationBot))
    private readonly bot: LetterGenerationBot,
    @Inject(forwardRef(() => ChatService))
    private readonly chatService: ChatService,
  ) {}

  /**
   * Finds an user's letters.
   */
  async findLettersByUserId(
    userId: string,
    isLiked: boolean,
    pageable: Pageable,
  ) {
    if (!userId) {
      throw new BadRequestException(`'userId' is missing.`);
    }

    const messages = await this.prismaService.letter.findMany({
      where: {
        userId,
        isLiked,
      },
      skip: (pageable.page - 1) * pageable.size,
      take: pageable.size,
      orderBy: {
        createdAt: 'desc',
      },
    });
    const total = await this.prismaService.letter.count({
      where: {
        userId,
      },
    });

    return new Page<LetterResponse>(
      messages,
      total,
      pageable.page,
      pageable.size,
    );
  }

  async findLastLetterByCounselorId(userId: string, counselorId: string) {
    if (!userId) {
      throw new BadRequestException(`'userId' is missing.`);
    }
    if (!counselorId) {
      throw new BadRequestException(`'counselorId' is missing.`);
    }

    return this.prismaService.letter.findFirst({
      where: {
        userId,
        counselorId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async updateLetter(userId: string, letterId: string, isLiked: boolean) {
    if (!userId) {
      throw new BadRequestException(`'userId' is missing.`);
    }
    if (!letterId) {
      throw new BadRequestException(`'letterId' is missing.`);
    }

    const letter = await this.prismaService.letter.findUnique({
      where: {
        id: letterId,
      },
    });

    if (!letter) {
      throw new NotFoundException(`Letter not found.`);
    }

    return this.prismaService.letter.update({
      where: {
        id: letter.id,
      },
      data: {
        isLiked,
      },
    });
  }

  async deleteLettersByCounselorId(userId: string, counselorId: string) {
    if (!userId) {
      throw new BadRequestException(`'userId' is missing.`);
    }
    if (!counselorId) {
      throw new BadRequestException(`'counselorId' is missing.`);
    }

    await this.prismaService.letter.deleteMany({
      where: {
        userId,
        counselorId,
      },
    });
  }

  async generateLetter(
    userId: string,
    name: string,
    counselorId: string,
  ): Promise<LetterResponse> {
    const chat = await this.chatService.findChatByCounselorId(
      userId,
      counselorId,
    );
    if (!chat) {
      throw new NotFoundException(`Chat not found.`);
    }

    const numOfCompleted = await this.prismaService.message.count({
      where: {
        chat: {
          userId,
          counselorId,
        },
        status: MessageStatus.COMPLETED,
      },
      take: 2,
      orderBy: {
        createdAt: 'desc',
      },
    });

    let messages: Message[] = [];

    if (numOfCompleted < 2) {
      messages = await this.prismaService.message.findMany({
        where: {
          chat: {
            userId,
            counselorId,
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } else {
      const completedMessages = await this.prismaService.message.findMany({
        where: {
          chat: {
            userId,
            counselorId,
          },
          status: MessageStatus.COMPLETED,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 2,
      });

      const previousCompletedMessage = completedMessages.at(1);

      messages = await this.prismaService.message.findMany({
        where: {
          chat: {
            userId,
            counselorId,
          },
          createdAt: {
            gt: previousCompletedMessage.createdAt,
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    if (messages.length > 0) {
      await this.prismaService.message.update({
        where: {
          id: messages.at(0).id,
        },
        data: {
          status: MessageStatus.COMPLETED,
        },
      });
    }

    const letter = await this.bot.generate(userId, name, counselorId, messages);

    return this.prismaService.letter.create({
      data: {
        id: randomUUID(),
        userId,
        counselorId,
        content: letter.content,
        footer: letter.footer,
        createdAt: new Date(),
      },
    });
  }
}
