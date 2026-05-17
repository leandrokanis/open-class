import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID } from 'class-validator';

export class ReorderCategoriesDto {
  @ApiProperty({ type: [String], format: 'uuid', description: 'Lista completa de IDs na nova ordem' })
  @IsArray()
  @IsUUID('4', { each: true })
  ids!: string[];
}
