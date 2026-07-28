import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserDataInitializerService } from './user-data-initializer.service';

@Module({
  providers: [UserService, UserDataInitializerService],
  exports: [UserService],
})
export class UserModule {}
