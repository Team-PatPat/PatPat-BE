import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { CurrentUser } from 'src/auth/auth.decorator';
import { Payload } from 'src/auth/auth.dto';
import { Pageable } from 'src/shared/model/page.model';
import {
  GenerateLetterRequest,
  LetterResponse,
  UpdateLetterRequest,
} from './letter.model';
import { LetterService } from './letter.service';

@ApiTags('Letters')
@ApiBearerAuth()
@ApiCookieAuth('access_token')
@Controller('/api/v1/letters')
export class LetterController {
  constructor(private readonly letterService: LetterService) {}

  @Get()
  @ApiExtraModels(LetterResponse)
  @ApiQuery({ name: 'isLiked', required: false, type: Boolean })
  @ApiOperation({ summary: '편지 목록 조회' })
  @ApiResponse({
    status: 200,
    description: 'OK.',
    schema: {
      properties: {
        totalElements: {
          type: 'number',
          description: '전체 항목 수',
        },
        currentPage: {
          type: 'number',
          description: '현재 페이지 번호',
        },
        content: {
          type: 'array',
          items: { $ref: getSchemaPath(LetterResponse) },
        },
      },
    },
  })
  findLetters(
    @CurrentUser() currentUser: Payload,
    @Query() pageable: Pageable,
    @Query('isLiked') isLiked?: boolean,
  ) {
    return this.letterService.findLettersByUserId(
      currentUser.id,
      isLiked,
      pageable,
    );
  }

  @Post()
  @ApiExtraModels(LetterResponse)
  @ApiOperation({ summary: '편지 생성' })
  @ApiResponse({
    status: 200,
    description: 'OK.',
    schema: {
      properties: {
        totalElements: {
          type: 'number',
          description: '전체 항목 수',
        },
        currentPage: {
          type: 'number',
          description: '현재 페이지 번호',
        },
        content: {
          type: 'array',
          items: { $ref: getSchemaPath(LetterResponse) },
        },
      },
    },
  })
  generateLetter(
    @CurrentUser() currentUser: Payload,
    @Body() request: GenerateLetterRequest,
  ) {
    return this.letterService.generateLetter(
      currentUser.id,
      currentUser.name,
      request.counselorId,
    );
  }

  @Put('/:letterId')
  @ApiOperation({ summary: '편지 수정' })
  @ApiOkResponse({ type: LetterResponse })
  async updateLetter(
    @CurrentUser() currentUser: Payload,
    @Param('letterId') letterId: string,
    @Body() request: UpdateLetterRequest,
  ) {
    return this.letterService.updateLetter(
      currentUser.id,
      letterId,
      request.isLiked,
    );
  }

  @Delete()
  @ApiOperation({ summary: '편지 전체 삭제' })
  @ApiResponse({
    status: 200,
    description: 'OK.',
  })
  async deleteLetters(
    @CurrentUser() currentUser: Payload,
    @Query() counselorId: string,
  ) {
    await this.letterService.deleteLettersByCounselorId(
      currentUser.id,
      counselorId,
    );
  }
}
