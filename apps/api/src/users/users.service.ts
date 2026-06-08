import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { t } from '../i18n/translate';
import type { Role } from '../common';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  findByEmail(email: string) {
    return this.usersRepository.findByEmail(email);
  }

  findById(id: string) {
    return this.usersRepository.findById(id);
  }

  findAll() {
    return this.usersRepository.findAll();
  }

  async updateUserRole(userId: string, role: Role) {
    const user = await this.usersRepository.findById(userId);
    if (!user) throw new NotFoundException(t('users.not_found'));
    return this.usersRepository.updateRole(userId, role);
  }

  async setActiveStatus(userId: string, requestingUserId: string, isActive: boolean) {
    if (userId === requestingUserId) {
      throw new BadRequestException(t('users.cannot_change_own_status'));
    }
    const user = await this.usersRepository.findById(userId);
    if (!user) throw new NotFoundException(t('users.not_found'));
    return this.usersRepository.setActiveStatus(userId, isActive);
  }
}
