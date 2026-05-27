import axios from 'axios';

interface AuthManagerOptions {
  apiUrl: string;
  email: string;
  password: string;
}

export class AuthManager {
  private token: string | null = null;

  constructor(private readonly opts: AuthManagerOptions) {}

  async getToken(): Promise<string> {
    if (this.token) return this.token;
    return this.login();
  }

  invalidateToken(): void {
    this.token = null;
  }

  private async login(): Promise<string> {
    try {
      const res = await axios.post(`${this.opts.apiUrl}/api/auth/login`, {
        email: this.opts.email,
        password: this.opts.password,
      });
      this.token = res.data.data.access_token as string;
      return this.token;
    } catch {
      throw new Error('MCP Server: falha ao autenticar na API Open Class');
    }
  }
}
