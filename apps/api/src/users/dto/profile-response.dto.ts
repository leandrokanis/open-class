import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProfileResponseDto {
  @ApiProperty({ description: 'UUID do usuário', format: 'uuid' })
  id!: string;

  @ApiProperty({ description: 'Nome de exibição' })
  name!: string;

  @ApiProperty({ description: 'E-mail de login' })
  email!: string;

  @ApiProperty({ description: 'Papel do usuário', enum: ['aluno', 'instrutor', 'admin'] })
  role!: string;

  @ApiPropertyOptional({ description: 'Biografia do usuário', nullable: true })
  bio!: string | null;

  @ApiPropertyOptional({ description: 'URL pública do avatar', nullable: true })
  avatarUrl!: string | null;

  @ApiProperty({ description: 'true se a conta possui senha local (false = só Google)' })
  hasPassword!: boolean;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
