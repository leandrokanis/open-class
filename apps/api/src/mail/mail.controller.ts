import {
  Controller, Get, Post, Req, UseGuards,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse, ApiCookieAuth, ApiBearerAuth,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles, Role } from '../common';
import { MailService } from './mail.service';
import { MailConfigResponseDto } from './dto/mail-config-response.dto';
import { TestMailResponseDto } from './dto/test-mail-response.dto';

@ApiTags('mail')
@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Get('config')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiCookieAuth('access_token')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter status da configuração SMTP (admin)' })
  @ApiResponse({ status: 200, description: 'Status da configuração SMTP.', type: MailConfigResponseDto })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({ status: 403, description: 'Sem permissão.' })
  getConfig(): MailConfigResponseDto {
    return this.mailService.getStatus();
  }

  @Post('test')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiCookieAuth('access_token')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Enviar e-mail de teste para o admin autenticado (admin)' })
  @ApiResponse({ status: 201, description: 'Resultado do envio do e-mail de teste.', type: TestMailResponseDto })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({ status: 403, description: 'Sem permissão.' })
  async sendTest(@Req() req: Request): Promise<TestMailResponseDto> {
    const user = req.user as { id: string; email: string; role: string };
    const to = user.email;

    try {
      await this.mailService.sendTestEmail(to);
      return { success: true, message: 'E-mail de teste enviado com sucesso.', sentTo: to };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Falha ao enviar e-mail de teste.';
      return { success: false, message, sentTo: to };
    }
  }
}
