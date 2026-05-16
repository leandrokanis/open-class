import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  id!: string;

  @ApiProperty({ example: 'Maria Silva' })
  name!: string;

  @ApiProperty({ example: 'maria@example.com' })
  email!: string;

  @ApiProperty({ example: 'aluno', enum: ['aluno', 'instrutor', 'admin'] })
  role!: string;

  @ApiProperty({ example: null, nullable: true, type: String })
  avatarUrl!: string | null;

  @ApiProperty({ example: '2026-05-16T18:00:00.000Z' })
  createdAt!: Date;
}

export class RegisterResponseDto {
  @ApiProperty({ type: UserDto })
  data!: UserDto;
}

export class LoginUserDto extends UserDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  access_token!: string;
}

export class LoginResponseDto {
  @ApiProperty({ type: LoginUserDto })
  data!: LoginUserDto;
}

export class MeDataDto {
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  id!: string;

  @ApiProperty({ example: 'maria@example.com' })
  email!: string;

  @ApiProperty({ example: 'aluno', enum: ['aluno', 'instrutor', 'admin'] })
  role!: string;
}

export class MeResponseDto {
  @ApiProperty({ type: MeDataDto })
  data!: MeDataDto;
}

class MessageDataDto {
  @ApiProperty({ example: 'Se o e-mail existir, um link foi enviado.' })
  message!: string;
}

export class MessageResponseDto {
  @ApiProperty({ type: MessageDataDto })
  data!: MessageDataDto;
}
