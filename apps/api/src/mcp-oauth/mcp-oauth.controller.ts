import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Req,
  Res,
  HttpCode,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import { McpOAuthService } from './mcp-oauth.service';
import { RegisterClientDto } from './dto/register-client.dto';
import { RegisterClientResponseDto } from './dto/register-client-response.dto';
import { TokenResponseDto } from './dto/token-response.dto';
import { UsersRepository } from '../users/users.repository';

@ApiTags('oauth')
@Controller('oauth')
export class McpOAuthController {
  constructor(
    private readonly oauthService: McpOAuthService,
    private readonly usersRepo: UsersRepository,
  ) {}

  @Post('register')
  @HttpCode(201)
  @ApiOperation({ summary: 'Dynamic client registration (RFC 7591)' })
  @ApiBody({ type: RegisterClientDto })
  @ApiResponse({ status: 201, type: RegisterClientResponseDto, description: 'Client registered' })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  async register(@Body() dto: RegisterClientDto): Promise<RegisterClientResponseDto> {
    return this.oauthService.registerClient(dto);
  }

  @Get('authorize')
  @ApiOperation({ summary: 'Authorization endpoint — renders consent screen' })
  @ApiResponse({ status: 200, description: 'HTML consent page' })
  @ApiResponse({ status: 400, description: 'Invalid client or redirect_uri' })
  async authorize(
    @Query('client_id') clientId: string,
    @Query('redirect_uri') redirectUri: string,
    @Query('response_type') responseType: string,
    @Query('scope') scope = 'mcp',
    @Query('state') state = '',
    @Req() req: Request,
    @Res() res: Response,
  ) {
    if (!clientId || !redirectUri) {
      throw new BadRequestException('client_id and redirect_uri are required');
    }

    const client = await this.oauthService.getClientInfo(clientId);
    if (!client) {
      throw new BadRequestException('invalid_client');
    }
    const registeredUris: string[] = client.redirectUris as string[];
    if (!registeredUris.includes(redirectUri)) {
      throw new BadRequestException('invalid_redirect_uri');
    }

    const cookieToken: string | undefined = req.cookies?.['access_token'];
    const isLoggedIn = cookieToken ? this.verifyJwt(cookieToken) : false;

    if (isLoggedIn) {
      res.send(this.renderConsentForm(client.clientName, clientId, redirectUri, scope, state, false));
    } else {
      res.send(this.renderConsentForm(client.clientName, clientId, redirectUri, scope, state, true));
    }
  }

  @Post('authorize')
  @HttpCode(302)
  @ApiOperation({ summary: 'Submit consent — issues auth code or denies access' })
  @ApiResponse({ status: 302, description: 'Redirect with code or error' })
  async authorizeSubmit(
    @Body() body: Record<string, string>,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const { client_id, redirect_uri, scope = 'mcp', state = '', approved, email, password } = body;

    const redirectBase = `${redirect_uri}?${state ? `state=${encodeURIComponent(state)}&` : ''}`;

    if (approved !== 'true') {
      return res.redirect(`${redirectBase}error=access_denied`);
    }

    let userId: string | undefined;
    const cookieToken: string | undefined = req.cookies?.['access_token'];
    const payload = cookieToken ? this.verifyJwt(cookieToken) : null;

    if (payload) {
      userId = payload.sub as string;
    } else if (email && password) {
      const user = await this.usersRepo.findByEmail(email);
      if (!user || !user.passwordHash || !user.isActive) {
        const client = await this.oauthService.getClientInfo(client_id);
        return res.send(
          this.renderConsentForm(
            client?.clientName ?? client_id,
            client_id,
            redirect_uri,
            scope,
            state,
            true,
            'Credenciais inválidas',
          ),
        );
      }
      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        const client = await this.oauthService.getClientInfo(client_id);
        return res.send(
          this.renderConsentForm(
            client?.clientName ?? client_id,
            client_id,
            redirect_uri,
            scope,
            state,
            true,
            'Credenciais inválidas',
          ),
        );
      }
      userId = user.id;
    } else {
      return res.redirect(`${redirectBase}error=access_denied`);
    }

    try {
      const code = await this.oauthService.createAuthorizationCode(
        client_id,
        redirect_uri,
        userId,
        scope,
      );
      return res.redirect(`${redirectBase}code=${encodeURIComponent(code)}`);
    } catch {
      return res.redirect(`${redirectBase}error=server_error`);
    }
  }

  @Post('token')
  @HttpCode(200)
  @ApiOperation({ summary: 'Token endpoint — exchange authorization code for access token' })
  @ApiResponse({ status: 200, type: TokenResponseDto, description: 'Access token issued' })
  @ApiResponse({ status: 400, description: 'Invalid request or unsupported grant type' })
  @ApiResponse({ status: 401, description: 'Invalid client or grant' })
  async token(
    @Body() body: Record<string, string>,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    let clientId = body.client_id;
    let clientSecret = body.client_secret;

    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Basic ')) {
      const decoded = Buffer.from(authHeader.slice(6), 'base64').toString();
      const [id, secret] = decoded.split(':');
      clientId = clientId || id;
      clientSecret = clientSecret || secret;
    }

    if (body.grant_type !== 'authorization_code') {
      return res.status(400).json({ error: 'unsupported_grant_type' });
    }

    try {
      const result = await this.oauthService.exchangeCodeForToken({
        grant_type: body.grant_type,
        code: body.code,
        redirect_uri: body.redirect_uri,
        client_id: clientId,
        client_secret: clientSecret,
      });
      return res.json(result);
    } catch (err) {
      if (err instanceof UnauthorizedException) {
        return res.status(401).json({ error: err.message });
      }
      return res.status(400).json({ error: 'invalid_request' });
    }
  }

  private verifyJwt(token: string): any | null {
    try {
      const secret = process.env.JWT_SECRET ?? 'dev-secret-change-in-production';
      return jwt.verify(token, secret) as any;
    } catch {
      return null;
    }
  }

  private renderConsentForm(
    clientName: string,
    clientId: string,
    redirectUri: string,
    scope: string,
    state: string,
    showLogin: boolean,
    errorMsg?: string,
  ): string {
    const loginFields = showLogin
      ? `
        <div class="field">
          <label>E-mail</label>
          <input type="email" name="email" required placeholder="Digite seu e-mail" />
        </div>
        <div class="field">
          <label>Senha</label>
          <input type="password" name="password" required placeholder="Digite sua senha" />
        </div>`
      : '';

    const error = errorMsg
      ? `<p class="error">${errorMsg}</p>`
      : '';

    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Autorizar acesso — Open Class</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 440px; margin: 80px auto; padding: 0 16px; color: #1a1a1a; }
    h1 { font-size: 1.25rem; margin-bottom: 4px; }
    .sub { color: #555; font-size: 0.9rem; margin-bottom: 24px; }
    .field { margin-bottom: 16px; }
    label { display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 4px; }
    input { width: 100%; box-sizing: border-box; padding: 8px 10px; border: 1px solid #ccc; border-radius: 6px; font-size: 0.95rem; }
    .actions { display: flex; gap: 10px; margin-top: 24px; }
    button { flex: 1; padding: 10px; border: none; border-radius: 6px; font-size: 0.95rem; cursor: pointer; }
    .allow { background: #6366f1; color: #fff; }
    .deny { background: #f3f4f6; color: #374151; }
    .error { color: #dc2626; font-size: 0.875rem; }
  </style>
</head>
<body>
  <h1>Autorizar acesso</h1>
  <p class="sub"><strong>${clientName}</strong> quer acessar o Open Class MCP em seu nome.</p>
  ${error}
  <form method="POST" action="/oauth/authorize">
    <input type="hidden" name="client_id" value="${clientId}" />
    <input type="hidden" name="redirect_uri" value="${redirectUri}" />
    <input type="hidden" name="scope" value="${scope}" />
    <input type="hidden" name="state" value="${state}" />
    ${loginFields}
    <div class="actions">
      <button type="submit" name="approved" value="true" class="allow">Permitir</button>
      <button type="submit" name="approved" value="false" class="deny">Negar</button>
    </div>
  </form>
</body>
</html>`;
  }
}
