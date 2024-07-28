import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CounselorResponse {
  @ApiProperty({
    description: '고유번호',
  })
  id: string;

  @ApiProperty({
    description: '이름',
  })
  name: string;

  @ApiPropertyOptional({
    description: '설명',
  })
  description?: string;

  @ApiProperty({
    description: '정렬 순서',
  })
  order: number;

  @ApiProperty({
    description: '태그 목록',
  })
  tags: string[];

  @ApiPropertyOptional({
    description: '튜닝 고유번호',
  })
  taskId?: string;

  @ApiProperty({
    description: '생성일자',
  })
  createdAt: Date;

  @ApiPropertyOptional({
    description: '수정일자',
  })
  updatedAt?: Date;
}
