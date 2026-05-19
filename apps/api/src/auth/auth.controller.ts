import {
  Controller, Post, Get, Body, Res, Req, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  ApiTags, ApiOperation, ApiResponse, ApiCookieAuth, ApiBearerAuth, ApiBody,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import {
  RegisterResponseDto,
  LoginResponseDto,
  MeResponseDto,
  MessageResponseDto,
} from './dto/auth-response.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import type { User } from '@open-class/db';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Criar conta com e-mail e senha' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'Conta criada.', type: RegisterResponseDto })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 409, description: 'E-mail já cadastrado.' })
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<RegisterResponseDto> {
    const user = await this.authService.register(dto, res);
    return {
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl ?? null,
        createdAt: user.createdAt,
      },
    };
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Autenticar com e-mail e senha' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Autenticado. Cookie access_token setado.', type: LoginResponseDto })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas.' })
  @ApiResponse({ status: 403, description: 'Conta desativada.' })
  login(
    @Req() req: Request & { user: User },
    @Res({ passthrough: true }) res: Response,
  ): LoginResponseDto {
    const { id, email, role, avatarUrl, name } = req.user;
    const token = this.authService.issueToken(id, email, role, res);
    return {
      data: {
        id,
        name: name ?? '',
        email,
        role,
        avatarUrl: avatarUrl ?? null,
        createdAt: req.user.createdAt,
        access_token: token,
      },
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiCookieAuth('access_token')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Retorna o usuário autenticado' })
  @ApiResponse({ status: 200, description: 'Dados do usuário.', type: MeResponseDto })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  async me(
    @Req() req: Request & { user: { id: string; email: string; role: string } },
  ): Promise<MeResponseDto> {
    const user = await this.authService.getMe(req.user.id);
    return {
      data: {
        id: user?.id ?? req.user.id,
        email: user?.email ?? req.user.email,
        role: user?.role ?? req.user.role,
        name: user?.name ?? '',
        avatarUrl: user?.avatarUrl ?? null,
      },
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiCookieAuth('access_token')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Encerrar sessão' })
  @ApiResponse({ status: 204, description: 'Cookie removido.' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token');
  }

  @Throttle({ default: { limit: 5, ttl: 15 * 60 * 1000 } })
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Solicitar link de recuperação de senha por e-mail' })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({ status: 200, description: 'E-mail enviado (resposta genérica para evitar enumeração de usuários).', type: MessageResponseDto })
  @ApiResponse({ status: 429, description: 'Muitas tentativas. Aguarde 15 minutos.' })
  async forgotPassword(@Body() dto: ForgotPasswordDto): Promise<MessageResponseDto> {
    await this.authService.forgotPassword(dto.email);
    return { data: { message: 'Se o e-mail existir, um link foi enviado.' } };
  }

  @Throttle({ default: { limit: 5, ttl: 15 * 60 * 1000 } })
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Redefinir senha com token recebido por e-mail' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({ status: 200, description: 'Senha redefinida com sucesso.', type: MessageResponseDto })
  @ApiResponse({ status: 400, description: 'Token inválido, expirado ou já utilizado.' })
  @ApiResponse({ status: 429, description: 'Muitas tentativas. Aguarde 15 minutos.' })
  async resetPassword(@Body() dto: ResetPasswordDto): Promise<MessageResponseDto> {
    await this.authService.resetPassword(dto.token, dto.password);
    return { data: { message: 'Senha redefinida com sucesso.' } };
  }

  @UseGuards(GoogleAuthGuard)
  @Get('google')
  @ApiOperation({ summary: 'Iniciar login com Google OAuth (redireciona para o Google)' })
  @ApiResponse({ status: 302, description: 'Redirect para Google consent screen.' })
  googleLogin() {
    // Passport redireciona — sem body
  }

  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  @ApiOperation({ summary: 'Callback OAuth do Google (uso interno)' })
  @ApiResponse({ status: 302, description: 'Redirect para o frontend com cookie setado.' })
  async googleCallback(
    @Req() req: Request & { user: User },
    @Res() res: Response,
  ) {
    const frontendUrl = (process.env.FRONTEND_URL ?? 'http://localhost:3000').split(',')[0].trim();
    try {
      this.authService.issueToken(req.user.id, req.user.email, req.user.role, res);
      res.redirect(frontendUrl);
    } catch {
      res.redirect(`${frontendUrl}/login?error=oauth_failed`);
    }
  }
}
