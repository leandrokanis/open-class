import {
  Injectable,
  ConflictException,
  ForbiddenException,
  UnauthorizedException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { I18nContext } from 'nestjs-i18n';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import type { Response, CookieOptions } from 'express';
import type { Profile } from 'passport-google-oauth20';
import { UsersRepository } from '../users/users.repository';
import { MailService } from '../mail/mail.service';
import { t } from '../i18n/translate';
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
      throw new ForbiddenException(t('auth.registration_disabled'));
    }

    const existing = await this.usersRepository.findByEmail(dto.email);
    if (existing) throw new ConflictException(t('auth.email_taken'));

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
    if (!user.isActive) throw new ForbiddenException(t('auth.account_disabled'));
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
    const cookieOpts: CookieOptions = {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === 'true',
      sameSite: 'lax',
      maxAge: 100 * 365 * 24 * 60 * 60 * 1000,
    };
    if (process.env.COOKIE_DOMAIN) cookieOpts.domain = process.env.COOKIE_DOMAIN;
    res.cookie('access_token', token, cookieOpts);
    return token;
  }

  async getMe(id: string) {
    return this.usersRepository.findById(id);
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
    await this.mailService.sendPasswordReset(email, resetUrl, I18nContext.current()?.lang);
  }

  async resetPassword(rawToken: string, newPassword: string) {
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const record = await this.usersRepository.findValidPasswordResetToken(tokenHash);

    if (!record) throw new BadRequestException(t('auth.invalid_reset_token'));

    const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    await this.usersRepository.updatePasswordHash(record.userId, passwordHash);
    await this.usersRepository.markPasswordResetTokenUsed(record.id);
  }

  async changePassword(
    userId: string,
    dto: { currentPassword?: string; newPassword: string },
    lang?: string,
  ): Promise<void> {
    const user = await this.usersRepository.findById(userId);
    if (!user) throw new BadRequestException('Usuário não encontrado');

    if (user.passwordHash) {
      if (!dto.currentPassword) {
        throw new BadRequestException('Senha atual obrigatória para trocar a senha.');
      }
      const valid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
      if (!valid) throw new UnauthorizedException('Senha atual incorreta.');
    }

    const newHash = await bcrypt.hash(dto.newPassword, BCRYPT_ROUNDS);
    await this.usersRepository.updatePasswordHash(userId, newHash);
    await this.mailService.sendPasswordChanged(user.email, lang);
  }

  async findOrCreateGoogleUser(profile: Profile) {
    const email = profile.emails?.[0]?.value;
    const googleId = profile.id;
    const name = profile.displayName;
    const avatarUrl = profile.photos?.[0]?.value;

    const byGoogleId = await this.usersRepository.findByGoogleId(googleId);
    if (byGoogleId) {
      if (!byGoogleId.isActive) throw new ForbiddenException(t('auth.account_disabled'));
      return byGoogleId;
    }

    if (email) {
      const byEmail = await this.usersRepository.findByEmail(email);
      if (byEmail) {
        if (!byEmail.isActive) throw new ForbiddenException(t('auth.account_disabled'));
        return this.usersRepository.linkGoogleId(byEmail.id, googleId, avatarUrl);
      }

      if (process.env.ALLOW_REGISTRATION === 'false') {
        throw new ForbiddenException(t('auth.registration_disabled'));
      }

      return this.usersRepository.create({ name: name ?? email, email, googleId, avatarUrl });
    }

    throw new UnauthorizedException(t('auth.google_no_email'));
  }
}
