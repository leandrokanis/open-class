import { Injectable, NotImplementedException, ExecutionContext, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  private readonly logger = new Logger(GoogleAuthGuard.name);

  canActivate(context: ExecutionContext) {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      throw new NotImplementedException('Google OAuth is not configured');
    }
    return super.canActivate(context);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      this.logger.error('Google OAuth error', JSON.stringify({ err: err?.message, code: err?.code, info }));
      throw err || new Error('Google authentication failed');
    }
    return user;
  }
}
