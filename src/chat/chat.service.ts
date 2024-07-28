import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Message, MessageRole, MessageStatus } from '@prisma/client';
import { randomUUID } from 'crypto';
import { from, map, mergeMap, switchMap } from 'rxjs';
import { CounselorService } from 'src/counselor/counselor.service';
import { LetterService } from 'src/letter/letter.service';
import { Page, Pageable } from 'src/shared/model/page.model';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { HyperClovaXClient } from './hyperclovax.client';

/**
 * @author oognuyh
 */
@Injectable()
export class ChatService {
  constructor(
    private readonly client: HyperClovaXClient,
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
    private readonly counselorService: CounselorService,
    @Inject(forwardRef(() => LetterService))
    private readonly letterService: LetterService,
  ) {}

  /**
   * Finds a chat of an user by the given counselor.
   *
   * @param userId An user identifier.
   * @param counselorId A counselor identifier.
   * @returns A chat or null.
   */
  async findChatByCounselorId(userId: string, counselorId: string) {
    if (!counselorId) {
      throw new BadRequestException(`'counselor' is missing.`);
    }

    const user = await this.userService.findUserByUserId(userId);
    if (!user) {
      throw new NotFoundException(`User not found.`);
    }

    const counselor =
      await this.counselorService.findCounselorByCounselorId(counselorId);
    if (!counselor) {
      throw new NotFoundException(`Counselor not found.`);
    }

    return this.prismaService.chat.findFirst({
      where: {
        AND: {
          userId,
          counselorId,
        },
      },
      include: {
        counselor: true,
        messages: true,
      },
    });
  }

  /**
   * Finds or creates a chat of an user by the given counselor.
   *
   * @param userId An user identifier.
   * @param counselorId A counselor identifier to chat.
   * @returns An existing chat or a new one.
   */
  async findOrCreateChatByCounselorId(userId: string, counselorId: string) {
    let chat = await this.findChatByCounselorId(userId, counselorId);
    if (!chat) {
      chat = await this.prismaService.chat.create({
        data: {
          id: randomUUID(),
          counselorId,
          userId,
        },
        include: {
          counselor: true,
          messages: true,
        },
      });
    }

    return chat;
  }

  /**
   * 사용자와 상담사간의 메세지 조회.
   * 만약, 상담사가 존재하지 않으면 상담사와 챗 생성 후 빈 목록 반환.
   *
   * @param userId 사용자 고유번호
   * @param counselorId 상담사 고유번호
   * @param pageable 페이징 정보
   * @returns 메세지 목록
   */
  async findMessagesByCounselorId(
    userId: string,
    counselorId: string,
    pageable: Pageable,
  ) {
    const chat = await this.findOrCreateChatByCounselorId(userId, counselorId);

    const messages = await this.prismaService.message.findMany({
      where: {
        chatId: chat.id,
      },
      skip: (pageable.page - 1) * pageable.size,
      take: pageable.size,
      orderBy: {
        createdAt: 'desc',
      },
    });
    const total = await this.prismaService.message.count({
      where: {
        chatId: chat.id,
      },
    });

    return new Page<Message>(messages, total, pageable.page, pageable.size);
  }

  /**
   * Sends a message to a counselor and stream the response to the user.
   *
   * @param userId A sender identifier.
   * @param counselorId A counselor identifier.
   * @param message A message to send.
   * @returns A response
   */
  sendMessageWithStream(userId: string, counselorId: string, message: string) {
    if (!message) {
      throw new BadRequestException(`'message' is missing.`);
    }

    return this.sendMessage(userId, counselorId, message).pipe(
      switchMap((message) => {
        return from(message.content.split('').concat('[DONE]')).pipe(
          map((token) => {
            return {
              id: message.id,
              chatId: message.chatId,
              role: message.role,
              status: message.status,
              content: token,
              createdAt: message.createdAt,
              updatedAt: message.updatedAt,
            };
          }),
        );
      }),
    );
  }

  /**
   * 마지막으로 고민 상담이 완료된 메세지 조회.
   *
   * @param chatId 챗 고유번호
   * @returns 메세지 또는 null
   */
  findLastCompletedMessageByChatId(chatId: string) {
    return this.prismaService.message.findFirst({
      where: {
        chatId,
        status: MessageStatus.COMPLETED,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        chat: true,
      },
    });
  }

  /**
   * 마지막으로 고민 상담이 완료된 메세지 이후 아직 완료되지 않은 메세지 목록 조회.
   * 만약 마지막 고민 완료 메세지가 없다면, 최대 20개까지 반환.
   *
   * @param chatId 챗 고유번호
   * @returns 고민 중인 메세지 목록
   */
  async findPendingMessagesByChatId(chatId: string) {
    const lastCompletedMessage =
      await this.findLastCompletedMessageByChatId(chatId);

    if (!!lastCompletedMessage) {
      return this.prismaService.message.findMany({
        where: {
          chatId,
          createdAt: {
            gt: lastCompletedMessage.createdAt,
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 20,
      });
    }

    return this.prismaService.message.findMany({
      where: {
        chatId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
    });
  }

  /**
   * 상담사에게 메세지 전송.
   *
   * @param userId 발신자 고유번호
   * @param counselorId 상담사 고유번호
   * @param input 전송할 입력
   * @returns 상담사 답변
   */
  sendMessage(userId: string, counselorId: string, input: string) {
    if (!input) {
      throw new BadRequestException(`'input' is missing.`);
    }

    return from(this.findChatByCounselorId(userId, counselorId)).pipe(
      switchMap((chat) => {
        if (!chat) {
          throw new NotFoundException(`Chat not found.`);
        }

        return from(
          this.prismaService.message.create({
            data: {
              role: MessageRole.USER,
              content: input,
              chatId: chat.id,
              status: MessageStatus.PENDING,
            },
            include: {
              chat: true,
            },
          }),
        )
          .pipe(
            mergeMap(async () => {
              const messages = await this.findPendingMessagesByChatId(chat.id);

              return messages;
            }),
          )
          .pipe(
            switchMap((messages) =>
              from(this.userService.findUserByUserId(userId)).pipe(
                mergeMap((user) =>
                  from(
                    this.letterService.findLastLetterByCounselorId(
                      userId,
                      counselorId,
                    ),
                  ).pipe(
                    mergeMap((letter) =>
                      this.client
                        .chatCompletion(
                          chat.counselor.prompt
                            .replaceAll('{닉네임}', user.name)
                            .replaceAll(
                              '{편지}',
                              letter?.content || '이전 편지가 존재하지 않음.',
                            ),
                          messages.map((message) => ({
                            ...message,
                            content:
                              message.role === MessageRole.ASSISTANT
                                ? `[${message.type}]${message.content}`
                                : message.content,
                          })),
                          chat.counselor.taskId,
                        )
                        // Message Status Extractor
                        .pipe(
                          switchMap((response) => {
                            const [prefix, type] = response.message.content
                              .replace(/^[^:]+:\s*/, '')
                              .match(/\[([가-힣]+)\]/) || ['[일반]', '일반'];

                            return from(
                              this.prismaService.message.create({
                                data: {
                                  chatId: chat.id,
                                  status: MessageStatus.PENDING,
                                  content: response.message.content.replace(
                                    prefix,
                                    '',
                                  ),
                                  type,
                                  role: MessageRole.ASSISTANT,
                                },
                              }),
                            ).pipe(
                              mergeMap(async (message) => {
                                message.status =
                                  type === '종료'
                                    ? MessageStatus.COMPLETED
                                    : MessageStatus.PENDING;

                                return this.prismaService.message.update({
                                  where: {
                                    id: message.id,
                                  },
                                  data: {
                                    status: message.status,
                                  },
                                });
                              }),
                            );
                          }),
                        ),
                    ),
                  ),
                ),
              ),
            ),
          );
      }),
    );
  }

  /**
   * Deletes messages between the user and the counselor.
   *
   * @param userId The user identifier to own.
   * @param counselorId The counselor identifier to delete.
   * @returns
   */
  async deleteMessagesByCounselorId(userId: string, counselorId: string) {
    const chat = await this.findChatByCounselorId(userId, counselorId);
    if (!chat) {
      throw new NotFoundException('Chat not found.');
    }

    await this.prismaService.message.deleteMany({
      where: {
        chatId: chat.id,
      },
    });
  }
}
