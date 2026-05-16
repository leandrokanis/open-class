import { Injectable, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, type Profile } from 'passport-google-oauth20';
import type { VerifyCallback } from 'passport-google-oauth20';
import { AuthService } from '../auth.service';
import type { AuthConfig } from '../auth.config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private authService: AuthService,
    @Inject('AUTH_CONFIG') config: AuthConfig,
  ) {
    super({
      clientID: config.googleClientId!,
      clientSecret: config.googleClientSecret!,
      callbackURL: config.googleCallbackUrl ?? 'http://localhost:3001/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  async validate(_accessToken: string, _refreshToken: string, profile: Profile, done: VerifyCallback) {
    try {
      const user = await this.authService.findOrCreateGoogleUser(profile);
      done(null, user);
    } catch (err) {
      done(err as Error, undefined);
    }
  }
}
