import { Controller, Get } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCookieAuth,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Counselor } from '@prisma/client';
import { CounselorResponse } from './counselor.model';
import { CounselorService } from './counselor.service';

/**
 * @author oognuyh
 */
@ApiTags('Counsel')
@ApiBearerAuth()
@ApiCookieAuth('access_token')
@Controller('/api/v1/counselors')
export class CounselorController {
  constructor(private readonly counselorService: CounselorService) {}

  @Get()
  @ApiOperation({
    summary: '상담사 목록 조회',
  })
  @ApiOkResponse({
    description: 'OK.',
    type: CounselorResponse,
  })
  @ApiBadRequestResponse({ description: 'Invalid request.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error.' })
  findConselors(): Promise<Counselor[]> {
    return this.counselorService.findCounselors();
  }
}
