import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { map, Observable } from 'rxjs';
import { MessageResponse } from './chat.model';

export interface HyperClovaXChatCompletionResponse {
  message: {
    role: string;
    content: string;
  };
  inputLength: number;
  outputLength: number;
  stopReason: string;
  seed: number;
}

export interface HyperClovaXChatCompletionStreamEvent {
  id: string;
  event: 'token' | 'result' | 'signal';
  data: HyperClovaXChatCompletionResponse;
}

@Injectable()
export class HyperClovaXClient {
  X_NCP_CLOVASTUDIO_API_KEY = this.configService.getOrThrow<string>(
    'X_NCP_CLOVASTUDIO_API_KEY',
  );
  X_NCP_APIGW_API_KEY = this.configService.getOrThrow<string>(
    'X_NCP_APIGW_API_KEY',
  );
  HYPERCLOVAX_URL: string;
  HYPERCLOVAX_OPTIONS = {
    topP: 0.8,
    topK: 0,
    maxTokens: 512,
    temperature: 0.3,
    repeatPenalty: 5.0,
    stopBefore: [],
    includeAiFilters: false,
    seed: 0,
  };

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    const url = this.configService.getOrThrow<string>('HYPERCLOVAX_URL');

    this.HYPERCLOVAX_URL = `${url.endsWith('/') ? url : url + '/'}`;
  }

  generateMessage(
    messages: Pick<MessageResponse, 'role' | 'content' | 'createdAt'>[],
    taskId?: string | null,
  ) {
    const endpoint = `${this.HYPERCLOVAX_URL}${!!taskId ? 'v2/tasks/' + taskId + '/chat-completions' : 'v1/chat-completions/HCX-003'}`;

    return this.httpService
      .post(
        endpoint,
        {
          messages:
            messages
              ?.sort((x, y) => x.createdAt?.getTime() - y.createdAt?.getTime())
              .map((message) => ({
                role: message.role.toLocaleLowerCase(),
                content: message.content,
              })) || [],
          ...this.HYPERCLOVAX_OPTIONS,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-NCP-CLOVASTUDIO-API-KEY': this.X_NCP_CLOVASTUDIO_API_KEY,
            'X-NCP-APIGW-API-KEY': this.X_NCP_APIGW_API_KEY,
            'Cache-Control': 'no-cache', // 캐시 방지 헤더 추가
          },
        },
      )
      .pipe(
        map((response) => {
          console.error('[Generated]');
          console.info(
            (
              messages
                ?.sort(
                  (x, y) => x.createdAt?.getTime() - y.createdAt?.getTime(),
                )
                .map((message) => ({
                  role: message.role.toLocaleLowerCase(),
                  content: message.content,
                })) || []
            )
              .map((message) => message.content)
              .join('\n'),
          );
          console.warn(response.data?.result.message.content);
          console.error('= '.repeat(30));

          return response.data;
        }),
      )
      .pipe(map((data) => data.result));
  }

  chatCompletion(
    prompt: string,
    messages: MessageResponse[],
    taskId?: string | null,
  ): Observable<HyperClovaXChatCompletionResponse> {
    const endpoint = `${this.HYPERCLOVAX_URL}${!!taskId ? 'v2/tasks/' + taskId + '/chat-completions' : 'v1/chat-completions/HCX-003'}`;

    return this.httpService
      .post(
        endpoint,
        {
          messages: [
            ...(prompt
              ? [
                  {
                    role: 'system',
                    content: prompt,
                  },
                ]
              : []),
            ...(messages
              ?.sort((x, y) => x.createdAt.getTime() - y.createdAt.getTime())
              .map((message) => ({
                role: message.role.toLocaleLowerCase(),
                content: message.content,
              })) || []),
          ],
          ...this.HYPERCLOVAX_OPTIONS,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-NCP-CLOVASTUDIO-API-KEY': this.X_NCP_CLOVASTUDIO_API_KEY,
            'X-NCP-APIGW-API-KEY': this.X_NCP_APIGW_API_KEY,
          },
        },
      )
      .pipe(
        map((response) => {
          console.error('[Generated]');
          console.info(
            [
              ...(prompt
                ? [
                    {
                      role: 'system',
                      content: prompt,
                    },
                  ]
                : []),
              ...(messages
                ?.sort((x, y) => x.createdAt.getTime() - y.createdAt.getTime())
                .map((message) => ({
                  role: message.role.toLocaleLowerCase(),
                  content: message.content,
                })) || []),
            ]
              .map((message) => message.content)
              .join('\n'),
          );
          console.warn(response.data?.result?.message.content);
          console.error('= '.repeat(30));

          return response;
        }),
      )
      .pipe(map((response) => response.data))
      .pipe(map((data) => data.result));
  }
}
