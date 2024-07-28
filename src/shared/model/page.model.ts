import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class Pageable {
  @ApiPropertyOptional({
    description: '조회할 페이지',
    default: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: '항목 수',
    default: 20,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  size?: number = 20;
}

export class Page<T> {
  @ApiProperty({
    description: '전체 항목 수',
  })
  totalElements: number;

  @ApiProperty({
    description: '전체 페이지 수',
  })
  totalPages: number;

  @ApiProperty({
    description: '현재 페이지 번호',
  })
  currentPage: number;

  @ApiProperty({
    description: '페이지당 항목 수',
  })
  size: number;

  @ApiProperty({
    description: '항목',
    isArray: true,
  })
  data: T[];

  constructor(
    data: T[],
    totalElements: number,
    currentPage: number,
    size: number,
  ) {
    this.data = data;
    this.totalElements = totalElements;
    this.currentPage = currentPage;
    this.totalPages = Math.ceil(totalElements / size);
  }
}
