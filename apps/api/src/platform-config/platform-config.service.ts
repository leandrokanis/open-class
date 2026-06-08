import { Injectable, BadRequestException } from '@nestjs/common';
import { PLATFORM_CONFIG_KEYS } from './platform-config.keys';
import { PlatformConfigRepository } from './platform-config.repository';
import { PlatformConfigResponseDto } from './dto/platform-config-response.dto';
import type { UpdatePlatformConfigDto } from './dto/update-platform-config.dto';
import { UploadService } from '../common/upload/upload.service';

@Injectable()
export class PlatformConfigService {
  constructor(
    private readonly repo: PlatformConfigRepository,
    private readonly uploadService: UploadService,
  ) {}

  async getEffective(): Promise<PlatformConfigResponseDto> {
    const rows = await this.repo.findAll();
    const dbMap: Record<string, string> = {};
    for (const row of rows) {
      dbMap[row.key] = row.value;
    }

    const result = {} as PlatformConfigResponseDto;
    for (const entry of PLATFORM_CONFIG_KEYS) {
      const envValue = process.env[entry.envVar];
      const dbValue = dbMap[entry.dbKey];
      // env var wins; empty (or absent) values fall back to the default so a
      // blank field never renders as empty on screen (RF07/CA06).
      const effective =
        envValue !== undefined && envValue !== ''
          ? envValue
          : dbValue !== undefined && dbValue !== ''
            ? dbValue
            : entry.defaultValue;
      (result as unknown as Record<string, string>)[entry.apiKey] = effective;
    }
    return result;
  }

  async update(dto: UpdatePlatformConfigDto): Promise<PlatformConfigResponseDto> {
    const dtoAsRecord = dto as Record<string, string | undefined>;
    for (const entry of PLATFORM_CONFIG_KEYS) {
      if (dtoAsRecord[entry.apiKey] !== undefined) {
        await this.repo.upsert(entry.dbKey, dtoAsRecord[entry.apiKey] as string);
      }
    }
    return this.getEffective();
  }

  async updateLogo(file: Express.Multer.File): Promise<PlatformConfigResponseDto> {
    if (!file) throw new BadRequestException('Arquivo de logo não enviado.');
    const url = this.uploadService.publicUrl('logos', file.filename);
    await this.repo.upsert('logo_url', url);
    return this.getEffective();
  }
}
