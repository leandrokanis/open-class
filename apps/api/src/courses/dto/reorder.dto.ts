import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID, ArrayNotEmpty } from 'class-validator';

export class ReorderDto {
  @ApiProperty({ type: [String], description: 'IDs na nova ordem (deve conter todos os IDs existentes)' })
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  ids!: string[];
}
