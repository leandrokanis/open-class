export interface AuthConfig {
  jwtSecret: string;
  jwtExpiresIn: string;
  googleClientId?: string;
  googleClientSecret?: string;
  googleCallbackUrl?: string;
}
