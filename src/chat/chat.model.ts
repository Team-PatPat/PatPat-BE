import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MessageRole, MessageStatus } from '@prisma/client';
import { IsBoolean, IsNotEmpty, IsOptional } from 'class-validator';
import { CounselorResponse } from 'src/counselor/counselor.model';

export class CreateChatRequest {
  @IsNotEmpty()
  @ApiProperty({
    description: '상담사 고유번호',
  })
  counselorId: string;
}

export class SendMessageRequest {
  @IsNotEmpty()
  @ApiProperty({
    description: '전송할 메세지',
  })
  message: string;

  @ApiPropertyOptional({
    description: '환영 요청 여부',
    nullable: true,
  })
  @IsOptional()
  @IsBoolean()
  isGreeting?: boolean;
}

export class MessageResponse {
  @ApiProperty({
    description: '고유번호',
  })
  id: string;

  @ApiProperty({
    description: '챗 고유번호',
  })
  chatId: string;

  @ApiProperty({
    description: '메세지 역할',
    type: 'enum',
    enum: MessageRole,
  })
  role: MessageRole;

  @ApiProperty({
    description: '메세지 상태. 즉, 고민 해결 여부',
    type: 'enum',
    enum: MessageStatus,
  })
  status: MessageStatus;

  @ApiProperty({
    description: '내용',
  })
  content: string;

  @ApiProperty({
    description: '생성일자',
  })
  createdAt: Date;

  @ApiPropertyOptional({
    description: '수정일자',
  })
  updatedAt?: Date;
}

export class ChatResponse {
  @ApiProperty({
    description: '고유번호',
  })
  id: string;

  @ApiProperty({
    description: '상담사',
  })
  counselor: CounselorResponse;

  @ApiProperty({
    description: '대화 내용',
    isArray: true,
    type: MessageResponse,
  })
  messages: MessageResponse[];

  @ApiPropertyOptional({
    description: '설명',
  })
  description?: string;

  @ApiProperty({
    description: '생성일자',
  })
  createdAt: Date;

  @ApiPropertyOptional({
    description: '수정일자',
  })
  updatedAt?: Date;
}
