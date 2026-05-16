import { DynamicModule, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { UsersModule } from '../users/users.module';
import { MailModule } from '../mail/mail.module';
import type { AuthConfig } from './auth.config';

@Module({})
export class AuthModule {
  static register(config: AuthConfig): DynamicModule {
    const providers = [
      { provide: 'AUTH_CONFIG', useValue: config },
      AuthService,
      LocalStrategy,
      JwtStrategy,
    ];

    if (config.googleClientId && config.googleClientSecret) {
      providers.push(GoogleStrategy as never);
    }

    return {
      module: AuthModule,
      imports: [
        UsersModule,
        MailModule,
        PassportModule,
        JwtModule.register({
          secret: config.jwtSecret,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          signOptions: { expiresIn: config.jwtExpiresIn as any },
        }),
      ],
      controllers: [AuthController],
      providers,
      exports: [AuthService],
    };
  }
}
