import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaModule } from 'src/shared/prisma/prisma.module';
import { UserController } from './user.controller';

@Module({
  imports: [PrismaModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
