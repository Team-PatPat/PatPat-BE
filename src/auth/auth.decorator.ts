import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Payload } from './auth.dto';

/**
 * @author oognuyh
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();

    return request.user as Payload;
  },
);

import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
