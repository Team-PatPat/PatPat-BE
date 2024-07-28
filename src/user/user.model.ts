import {
  ApiHideProperty,
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import { Vendor } from '@prisma/client';
import { IsOptional } from 'class-validator';
import { randomUUID } from 'crypto';
import { ChatResponse } from 'src/chat/chat.model';

export class CreateUserRequest {
  id = randomUUID();

  name: string;

  email: string;

  vender: Vendor;
}

export class UpdateUserRequest {
  @ApiHideProperty()
  userId?: string;

  @ApiPropertyOptional({
    description: '변경할 이름',
  })
  @IsOptional()
  name: string | null;

  @ApiPropertyOptional({
    description: '변경할 MBTI',
  })
  @IsOptional()
  mbti: string | null;
}

export class UserResponse {
  @ApiProperty({
    description: '고유번호',
  })
  id: string;

  @ApiProperty({
    description: '이름(닉네임)',
    nullable: true,
  })
  name: string | null;

  @ApiProperty({
    description: '이메일',
  })
  email: string;

  @ApiProperty({
    description: '고유번호',
    nullable: true,
  })
  mbti: string | null;

  @ApiProperty({
    description: '소셜 로그인 공급업체',
    type: 'enum',
    enum: Vendor,
  })
  vendor: Vendor;

  @ApiProperty({
    description: '아바타 주소',
    nullable: true,
  })
  avatarUrl?: string;

  @ApiProperty({
    description: '보유한 챗 목록',
    isArray: true,
    type: ChatResponse,
  })
  chats: ChatResponse[];

  @ApiProperty({
    description: '생성일자',
  })
  createdAt: Date;

  @ApiPropertyOptional({
    description: '수정일자',
    nullable: true,
  })
  updatedAt?: Date;
}
