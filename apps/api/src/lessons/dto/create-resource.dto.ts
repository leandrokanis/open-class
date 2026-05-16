import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength, IsUrl } from 'class-validator';

export class CreateResourceDto {
  @ApiProperty({ example: 'Documentação oficial TypeScript' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title!: string;

  @ApiProperty({ example: 'https://www.typescriptlang.org/docs/' })
  @IsUrl({}, { message: 'url deve ser uma URL válida.' })
  url!: string;
}
