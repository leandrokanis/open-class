import { ApiProperty } from '@nestjs/swagger';

export class LogoUploadDto {
  @ApiProperty({ type: 'string', format: 'binary', description: 'Imagem do logo (JPEG, PNG ou WebP, máx 2 MB)' })
  logo!: unknown;
}
