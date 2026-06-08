import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { UploadService } from '../common/upload/upload.service';

@Module({
  controllers: [UsersController, ProfileController],
  providers: [UsersService, UsersRepository, ProfileService, UploadService],
  exports: [UsersService, UsersRepository, ProfileService],
})
export class UsersModule {}
