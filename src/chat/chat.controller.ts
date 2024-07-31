import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  Param,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiCookieAuth,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiProduces,
  ApiTags,
  ApiUnauthorizedResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { AxiosError } from 'axios';
import { Request, Response } from 'express';
import { CurrentUser } from 'src/auth/auth.decorator';
import { Payload } from 'src/auth/auth.dto';
import { Pageable } from 'src/shared/model/page.model';
import {
  ChatResponse,
  MessageResponse,
  SendMessageRequest,
} from './chat.model';
import { ChatService } from './chat.service';

@ApiTags('Chat')
@ApiBearerAuth()
@ApiCookieAuth('access_token')
@Controller('/api/v1/chats')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('/:counselorId')
  @ApiOperation({
    summary:
      '선택된 상담사와 연결된 사용자의 챗 정보 조회. 존재하지 않을 시, 생성 후 반환.',
  })
  @ApiOkResponse({
    description: 'OK.',
    type: ChatResponse,
  })
  @ApiBadRequestResponse({
    description: 'Invalid request.',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal Server Error.',
  })
  findChatByCounselorId(
    @Param('counselorId')
    counselorId: string,
    @CurrentUser() currentUser: Payload,
  ) {
    return this.chatService.findOrCreateChatByCounselorId(
      currentUser.id,
      counselorId,
    );
  }
  @Get('/:counselorId/messages')
  @ApiOperation({
    summary: '선택된 상담사와 연결된 사용자의 챗 메세지 조회.',
  })
  @ApiOkResponse({
    description: 'OK.',
    type: ChatResponse,
  })
  @ApiBadRequestResponse({
    description: 'Invalid request.',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal Server Error.',
  })
  findMessagesByCounselorId(
    @Param('counselorId')
    counselorId: string,
    @Query() pageable: Pageable,
    @CurrentUser() currentUser: Payload,
  ) {
    return this.chatService.findMessagesByCounselorId(
      currentUser.id,
      counselorId,
      pageable,
    );
  }

  @HttpCode(200)
  @Post('/:counselorId/messages')
  @ApiConsumes('application/json')
  @ApiProduces('application/json', 'text/event-stream')
  @ApiOperation({
    summary: '상담사에게 메세지 전송.',
  })
  @ApiOkResponse({
    description: 'OK.',
    content: {
      'text/event-stream': {
        example: `
data: {"id":"de12d691-b536-4100-9663-89c0e1951c32","chatId":"6f66d25c-8f88-46e4-adf1-8930d78dee15","role":"ASSISTANT","status":"PENDING","content":"안","createdAt":"2024-07-24T17:16:01.042Z","updatedAt":"2024-07-24T17:16:01.042Z"}

data: {"id":"de12d691-b536-4100-9663-89c0e1951c32","chatId":"6f66d25c-8f88-46e4-adf1-8930d78dee15","role":"ASSISTANT","status":"PENDING","content":"녕","createdAt":"2024-07-24T17:16:01.042Z","updatedAt":"2024-07-24T17:16:01.042Z"}

data: {"id":"de12d691-b536-4100-9663-89c0e1951c32","chatId":"6f66d25c-8f88-46e4-adf1-8930d78dee15","role":"ASSISTANT","status":"PENDING","content":"하","createdAt":"2024-07-24T17:16:01.042Z","updatedAt":"2024-07-24T17:16:01.042Z"}

data: {"id":"de12d691-b536-4100-9663-89c0e1951c32","chatId":"6f66d25c-8f88-46e4-adf1-8930d78dee15","role":"ASSISTANT","status":"PENDING","content":"세","createdAt":"2024-07-24T17:16:01.042Z","updatedAt":"2024-07-24T17:16:01.042Z"}

data: {"id":"de12d691-b536-4100-9663-89c0e1951c32","chatId":"6f66d25c-8f88-46e4-adf1-8930d78dee15","role":"ASSISTANT","status":"PENDING","content":"요","createdAt":"2024-07-24T17:16:01.042Z","updatedAt":"2024-07-24T17:16:01.042Z"}

data: {"id":"de12d691-b536-4100-9663-89c0e1951c32","chatId":"6f66d25c-8f88-46e4-adf1-8930d78dee15","role":"ASSISTANT","status":"PENDING","content":"!","createdAt":"2024-07-24T17:16:01.042Z","updatedAt":"2024-07-24T17:16:01.042Z"}

data: {"id":"de12d691-b536-4100-9663-89c0e1951c32","chatId":"6f66d25c-8f88-46e4-adf1-8930d78dee15","role":"ASSISTANT","status":"PENDING","content":" ","createdAt":"2024-07-24T17:16:01.042Z","updatedAt":"2024-07-24T17:16:01.042Z"}

data: {"id":"de12d691-b536-4100-9663-89c0e1951c32","chatId":"6f66d25c-8f88-46e4-adf1-8930d78dee15","role":"ASSISTANT","status":"PENDING","content":"무","createdAt":"2024-07-24T17:16:01.042Z","updatedAt":"2024-07-24T17:16:01.042Z"}

data: {"id":"de12d691-b536-4100-9663-89c0e1951c32","chatId":"6f66d25c-8f88-46e4-adf1-8930d78dee15","role":"ASSISTANT","status":"PENDING","content":"엇","createdAt":"2024-07-24T17:16:01.042Z","updatedAt":"2024-07-24T17:16:01.042Z"}

data: {"id":"de12d691-b536-4100-9663-89c0e1951c32","chatId":"6f66d25c-8f88-46e4-adf1-8930d78dee15","role":"ASSISTANT","status":"PENDING","content":"을","createdAt":"2024-07-24T17:16:01.042Z","updatedAt":"2024-07-24T17:16:01.042Z"}

data: {"id":"de12d691-b536-4100-9663-89c0e1951c32","chatId":"6f66d25c-8f88-46e4-adf1-8930d78dee15","role":"ASSISTANT","status":"PENDING","content":" ","createdAt":"2024-07-24T17:16:01.042Z","updatedAt":"2024-07-24T17:16:01.042Z"}

data: {"id":"de12d691-b536-4100-9663-89c0e1951c32","chatId":"6f66d25c-8f88-46e4-adf1-8930d78dee15","role":"ASSISTANT","status":"PENDING","content":"도","createdAt":"2024-07-24T17:16:01.042Z","updatedAt":"2024-07-24T17:16:01.042Z"}

data: {"id":"de12d691-b536-4100-9663-89c0e1951c32","chatId":"6f66d25c-8f88-46e4-adf1-8930d78dee15","role":"ASSISTANT","status":"PENDING","content":"와","createdAt":"2024-07-24T17:16:01.042Z","updatedAt":"2024-07-24T17:16:01.042Z"}

data: {"id":"de12d691-b536-4100-9663-89c0e1951c32","chatId":"6f66d25c-8f88-46e4-adf1-8930d78dee15","role":"ASSISTANT","status":"PENDING","content":"드","createdAt":"2024-07-24T17:16:01.042Z","updatedAt":"2024-07-24T17:16:01.042Z"}

data: {"id":"de12d691-b536-4100-9663-89c0e1951c32","chatId":"6f66d25c-8f88-46e4-adf1-8930d78dee15","role":"ASSISTANT","status":"PENDING","content":"릴","createdAt":"2024-07-24T17:16:01.042Z","updatedAt":"2024-07-24T17:16:01.042Z"}

data: {"id":"de12d691-b536-4100-9663-89c0e1951c32","chatId":"6f66d25c-8f88-46e4-adf1-8930d78dee15","role":"ASSISTANT","status":"PENDING","content":"까","createdAt":"2024-07-24T17:16:01.042Z","updatedAt":"2024-07-24T17:16:01.042Z"}

data: {"id":"de12d691-b536-4100-9663-89c0e1951c32","chatId":"6f66d25c-8f88-46e4-adf1-8930d78dee15","role":"ASSISTANT","status":"PENDING","content":"요","createdAt":"2024-07-24T17:16:01.042Z","updatedAt":"2024-07-24T17:16:01.042Z"}

data: {"id":"de12d691-b536-4100-9663-89c0e1951c32","chatId":"6f66d25c-8f88-46e4-adf1-8930d78dee15","role":"ASSISTANT","status":"PENDING","content":"?","createdAt":"2024-07-24T17:16:01.042Z","updatedAt":"2024-07-24T17:16:01.042Z"}

data: {"id":"de12d691-b536-4100-9663-89c0e1951c32","chatId":"6f66d25c-8f88-46e4-adf1-8930d78dee15","role":"ASSISTANT","status":"PENDING","content":"[DONE]","createdAt":"2024-07-24T17:16:01.042Z","updatedAt":"2024-07-24T17:16:01.042Z"}

        `,
        schema: {
          type: 'string',
        },
      },
      'application/json': {
        example: {
          id: 'd3032e07-48f6-40d7-ad55-a2b75ae41022',
          chatId: 'ed32a958-7cbd-4dc0-a196-a71ff4552b8a',
          role: 'ASSISTANT',
          status: 'PENDING',
          type: '일반',
          content:
            '단순이 아이가!!!! 니 무슨 일 있나? 퍼뜩 기운 내그래이!!!!!!',
          createdAt: '2024-07-31T16:25:15.472Z',
          updatedAt: '2024-07-31T16:25:15.492Z',
        },
        schema: {
          type: 'object',
          $ref: getSchemaPath(MessageResponse),
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid request.',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized.',
  })
  @ApiNotFoundResponse({
    description: 'Not found.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal Server Error.',
  })
  sendMessage(
    @Param('counselorId') counselorId: string,
    @Body() request: SendMessageRequest,
    @Req() req: Request,
    @Res() res: Response,
    @CurrentUser() currentUser: Payload,
  ) {
    if (req.headers['accept'] === 'text/event-stream') {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      res.flushHeaders();

      this.chatService
        .sendMessageWithStream(
          currentUser.id,
          counselorId,
          request.message,
          request.isGreeting,
        )
        .subscribe({
          next: (data) => {
            res.write(`data: ${JSON.stringify(data)}\n\n`);
          },
          error: (error) => {
            res.write(`data: ${error}\n\n`);
            res.end();
          },
          complete: () => {
            res.end();
          },
        });
    } else {
      this.chatService
        .sendMessage(
          currentUser.id,
          counselorId,
          request.message,
          request.isGreeting,
        )
        .subscribe({
          next: (data) => {
            res.json(data);
          },
          error: (error: Error) => {
            res
              .status(error instanceof HttpException ? error.getStatus() : 500)
              .send({
                error:
                  error instanceof HttpException
                    ? error.message
                    : 'Internal Server Error',
                statusCode:
                  error instanceof HttpException ? error.getStatus() : 500,
                message:
                  error instanceof AxiosError
                    ? `[${error.response.data['status']['code']}] ${error.response.data['status']['message']}`
                    : error.message || 'Internal server error occurs.',
              });
          },
        });
    }
  }

  @Delete('/:counselorId/messages')
  @ApiOperation({
    summary: '상담사와 주고 받은 전체 메세지 삭제.',
  })
  @ApiOkResponse({
    description: 'OK.',
  })
  @ApiBadRequestResponse({
    description: 'Invalid request.',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized.',
  })
  @ApiNotFoundResponse({
    description: 'Not found.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal Server Error.',
  })
  deleteMessagesByCounselorId(
    @Param('counselorId')
    counselorId: string,
    @CurrentUser() currentUser: Payload,
  ) {
    return this.chatService.deleteMessagesByCounselorId(
      currentUser.id,
      counselorId,
    );
  }
}
