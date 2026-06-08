import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { UploadService } from '../common/upload/upload.service';
import type { ProfileResponseDto } from './dto/profile-response.dto';

@Injectable()
export class ProfileService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly uploadService: UploadService,
  ) {}

  async updateProfile(userId: string, data: { name?: string; bio?: string }): Promise<ProfileResponseDto> {
    const user = await this.usersRepository.updateProfile(userId, data);
    return this.toDto(user);
  }

  async getProfile(userId: string): Promise<ProfileResponseDto> {
    const user = await this.usersRepository.findById(userId);
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return this.toDto(user);
  }

  async setAvatar(userId: string, file: Express.Multer.File): Promise<ProfileResponseDto> {
    if (!file) throw new BadRequestException('Arquivo de avatar obrigatório.');

    const user = await this.usersRepository.findById(userId);
    if (!user) throw new NotFoundException('Usuário não encontrado');

    if (user.avatarUrl) await this.uploadService.deleteByUrl(user.avatarUrl);

    const newUrl = this.uploadService.avatarUrl(file.filename);
    const updated = await this.usersRepository.updateAvatarUrl(userId, newUrl);
    return this.toDto(updated);
  }

  async removeAvatar(userId: string): Promise<ProfileResponseDto> {
    const user = await this.usersRepository.findById(userId);
    if (!user) throw new NotFoundException('Usuário não encontrado');

    if (user.avatarUrl) await this.uploadService.deleteByUrl(user.avatarUrl);

    const updated = await this.usersRepository.updateAvatarUrl(userId, null);
    return this.toDto(updated);
  }

  private toDto(user: {
    id: string;
    name: string;
    email: string;
    role: string;
    bio?: string | null;
    avatarUrl?: string | null;
    passwordHash?: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): ProfileResponseDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      bio: user.bio ?? null,
      avatarUrl: user.avatarUrl ?? null,
      hasPassword: user.passwordHash != null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
