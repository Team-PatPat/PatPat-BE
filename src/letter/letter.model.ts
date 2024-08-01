import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsString } from 'class-validator';

export class GenerateLetterRequest {
  @ApiProperty({
    description: '생성할 상담사 고유번호',
  })
  @IsString()
  counselorId: string;
}

export class UpdateLetterRequest {
  @ApiProperty({
    description: '생성할 상담사 고유번호',
  })
  @IsBoolean()
  isLiked: boolean;
}

export class LetterResponse {
  @ApiProperty({
    description: '고유번호',
  })
  id: string;

  @ApiProperty({
    description: '내용',
  })
  content: string;

  @ApiProperty({
    description: '푸터',
    nullable: true,
  })
  footer: string | null;

  @ApiProperty({
    description: '사용자 고유번호',
  })
  userId: string;

  @ApiProperty({
    description: '생성일자',
  })
  createdAt: Date;

  @ApiPropertyOptional({
    description: '수정일자',
  })
  updatedAt?: Date;
}
