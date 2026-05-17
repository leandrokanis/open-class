import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
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
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return this.usersRepository.updateRole(userId, role);
  }

  async setActiveStatus(userId: string, requestingUserId: string, isActive: boolean) {
    if (userId === requestingUserId) {
      throw new BadRequestException('Não é possível alterar o status da própria conta');
    }
    const user = await this.usersRepository.findById(userId);
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return this.usersRepository.setActiveStatus(userId, isActive);
  }
}
