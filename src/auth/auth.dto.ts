import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Vendor } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export interface KakaoProfileResponse {
  id: string;
  connectedAt: string;

  kakao_account: {
    profile_needs_agreement: false;
    profile: {
      nickname: string;

      thumbnailImageUrl: string;

      profileImageUrl: string;

      isDefaultImage: boolean;

      isDefaultNickname: boolean;
    };

    hasEmail: boolean;

    emailNeedsAgreement: boolean;

    isEmailValid: boolean;

    isEmailVerified: boolean;

    email: string;

    hasAgeRange: boolean;

    ageRangeNeedsAgreement: boolean;

    ageRange: string;

    hasBirthday: boolean;

    birthdayNeedsAgreement: boolean;

    birthday: string;

    birthdayType: string;

    hasGender: boolean;

    genderNeedsAgreement: boolean;

    gender: string;
  };
}

export interface NaverProfileResponse {
  resultcode: string;

  message: string;

  response: {
    id: string;

    email: string;

    nickname: string;

    profileImage: string;

    age: string;

    gender: string;

    name: string;

    birthday: string;

    birthyear: string;

    mobile: string;
  };
}

export class LogInRequest {
  @ApiProperty({
    type: 'enum',
    enum: Vendor,
    description: '소셜 로그인 공급업체명',
  })
  @IsNotEmpty()
  @IsEnum(Vendor)
  vendor: Vendor;

  @ApiProperty({
    description: '인증 코드',
  })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiPropertyOptional({
    description: '이메일',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  email?: string;

  @ApiPropertyOptional({
    description: '비밀번호',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  password?: string;
}

export class TokenResponse {
  @ApiProperty({
    description: '접근 토큰',
  })
  accessToken: string;

  @ApiProperty({
    description: '갱신 토큰',
  })
  refreshToken: string;
}

export interface Payload {
  id: string;

  name: string;

  email: string;

  avatarUrl?: string | null;

  iat: number;

  exp: number;
}
