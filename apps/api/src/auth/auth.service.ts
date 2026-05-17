import {
  Injectable,
  ConflictException,
  ForbiddenException,
  UnauthorizedException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import type { Response } from 'express';
import type { Profile } from 'passport-google-oauth20';
import { UsersRepository } from '../users/users.repository';
import { MailService } from '../mail/mail.service';
import type { RegisterDto } from './dto/register.dto';
import type { AuthConfig } from './auth.config';

const BCRYPT_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    @Inject('AUTH_CONFIG') private readonly config: AuthConfig,
  ) {}

  async register(dto: RegisterDto, res: Response) {
    if (process.env.ALLOW_REGISTRATION === 'false') {
      throw new ForbiddenException('Registro de novas contas está desativado');
    }

    const existing = await this.usersRepository.findByEmail(dto.email);
    if (existing) throw new ConflictException('E-mail já cadastrado');

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const user = await this.usersRepository.create({
      name: dto.name,
      email: dto.email,
      passwordHash,
    });

    this.issueToken(user.id, user.email, user.role, res);
    return user;
  }

  async validateUser(email: string, password: string) {
    const user = await this.usersRepository.findByEmail(email);
    if (!user) return null;
    if (!user.isActive) throw new ForbiddenException('Conta desativada');
    if (!user.passwordHash) return null;

    const valid = await bcrypt.compare(password, user.passwordHash);
    return valid ? user : null;
  }

  login(user: { id: string; email: string; role: string }, res: Response) {
    this.issueToken(user.id, user.email, user.role, res);
    return { id: user.id, email: user.email, role: user.role };
  }

  issueToken(userId: string, email: string, role: string, res: Response): string {
    const token = this.jwtService.sign({ sub: userId, email, role });
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 100 * 365 * 24 * 60 * 60 * 1000,
    });
    return token;
  }

  async forgotPassword(email: string) {
    const user = await this.usersRepository.findByEmail(email);
    if (!user) return;

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await this.usersRepository.createPasswordResetToken(user.id, tokenHash, expiresAt);

    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/reset-password?token=${rawToken}`;
    await this.mailService.sendPasswordReset(email, resetUrl);
  }

  async resetPassword(rawToken: string, newPassword: string) {
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const record = await this.usersRepository.findValidPasswordResetToken(tokenHash);

    if (!record) throw new BadRequestException('Token inválido, expirado ou já utilizado');

    const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    await this.usersRepository.updatePasswordHash(record.userId, passwordHash);
    await this.usersRepository.markPasswordResetTokenUsed(record.id);
  }

  async findOrCreateGoogleUser(profile: Profile) {
    const email = profile.emails?.[0]?.value;
    const googleId = profile.id;
    const name = profile.displayName;
    const avatarUrl = profile.photos?.[0]?.value;

    const byGoogleId = await this.usersRepository.findByGoogleId(googleId);
    if (byGoogleId) {
      if (!byGoogleId.isActive) throw new ForbiddenException('Conta desativada');
      return byGoogleId;
    }

    if (email) {
      const byEmail = await this.usersRepository.findByEmail(email);
      if (byEmail) {
        if (!byEmail.isActive) throw new ForbiddenException('Conta desativada');
        return this.usersRepository.linkGoogleId(byEmail.id, googleId, avatarUrl);
      }

      if (process.env.ALLOW_REGISTRATION === 'false') {
        throw new ForbiddenException('Registro de novas contas está desativado');
      }

      return this.usersRepository.create({ name: name ?? email, email, googleId, avatarUrl });
    }

    throw new UnauthorizedException('Google não retornou e-mail');
  }
}
