import { Body, Controller, Delete, Get, Put, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiExtraModels,
  ApiOperation,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { User } from '@prisma/client';
import { CurrentUser, Public } from 'src/auth/auth.decorator';
import { Payload } from 'src/auth/auth.dto';
import { Page, Pageable } from 'src/shared/model/page.model';
import { UpdateUserRequest, UserResponse } from './user.model';
import { UserService } from './user.service';

@ApiBearerAuth()
@ApiTags('Users')
@Controller('/api/v1/users')
@ApiCookieAuth('access_token')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Public()
  @ApiExtraModels(UserResponse)
  @ApiOperation({ summary: '사용자 목록 조회' })
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
          items: { $ref: getSchemaPath(UserResponse) },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid request.' })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  findUsers(@Query() pageable: Pageable): Promise<Page<User>> {
    return this.userService.findUsers(pageable);
  }

  @Get('/me')
  @ApiOperation({ summary: '현재 사용자 정보 조회' })
  @ApiResponse({
    status: 200,
    description: 'OK.',
    type: UserResponse,
  })
  @ApiResponse({ status: 401, description: 'Invalid request.' })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  getMe(@CurrentUser() currentUser: Payload) {
    return this.userService.findUserByUserId(currentUser.id);
  }

  @Put('/me')
  @ApiOperation({ summary: '현재 사용자 정보 변경' })
  @ApiResponse({
    status: 200,
    description: 'OK.',
    type: UserResponse,
  })
  @ApiResponse({ status: 401, description: 'Invalid request.' })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  updateUser(
    @CurrentUser() currentUser: Payload,
    @Body() request: UpdateUserRequest,
  ) {
    return this.userService.updateUserByUserId(
      currentUser.id,
      request.name,
      request.mbti,
    );
  }

  @Delete('/me')
  @ApiOperation({ summary: '현재 사용자 탈퇴' })
  @ApiResponse({ status: 200, description: 'OK.' })
  @ApiResponse({ status: 401, description: 'Invalid request.' })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  async deleteUser(@CurrentUser() currentUser: Payload) {
    await this.userService.deleteUser(currentUser.id);
  }
}
