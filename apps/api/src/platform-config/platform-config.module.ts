import { Module } from '@nestjs/common';
import { DatabaseModule } from '../db/database.module';
import { CommonModule } from '../common';
import { PlatformConfigController } from './platform-config.controller';
import { PlatformConfigService } from './platform-config.service';
import { PlatformConfigRepository } from './platform-config.repository';

@Module({
  imports: [DatabaseModule, CommonModule],
  controllers: [PlatformConfigController],
  providers: [PlatformConfigService, PlatformConfigRepository],
})
export class PlatformConfigModule {}
