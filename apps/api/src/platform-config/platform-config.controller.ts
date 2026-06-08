import {
  Controller, Get, Patch, Post, Body, UseGuards,
  UseInterceptors, UploadedFile, HttpCode, HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags, ApiOperation, ApiResponse, ApiCookieAuth, ApiBearerAuth, ApiConsumes, ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles, Role } from '../common';
import { UploadService } from '../common/upload/upload.service';
import { PlatformConfigService } from './platform-config.service';
import { PlatformConfigResponseDto } from './dto/platform-config-response.dto';
import { UpdatePlatformConfigDto } from './dto/update-platform-config.dto';
import { LogoUploadDto } from './dto/logo-upload.dto';

@ApiTags('platform-config')
@Controller('platform-config')
export class PlatformConfigController {
  constructor(private readonly service: PlatformConfigService) {}

  @Get()
  @ApiOperation({ summary: 'Obter configurações da plataforma' })
  @ApiResponse({ status: 200, type: PlatformConfigResponseDto })
  getConfig(): Promise<PlatformConfigResponseDto> {
    return this.service.getEffective();
  }

  @Patch()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiCookieAuth('access_token')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar configurações da plataforma (admin)' })
  @ApiResponse({ status: 200, type: PlatformConfigResponseDto })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({ status: 403, description: 'Sem permissão.' })
  updateConfig(@Body() dto: UpdatePlatformConfigDto): Promise<PlatformConfigResponseDto> {
    return this.service.update(dto);
  }

  @Post('logo')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiCookieAuth('access_token')
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload do logo da plataforma (admin)' })
  @ApiBody({ type: LogoUploadDto })
  @ApiResponse({ status: 200, type: PlatformConfigResponseDto })
  @ApiResponse({ status: 400, description: 'Arquivo inválido (formato ou tamanho).' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({ status: 403, description: 'Sem permissão.' })
  @UseInterceptors(FileInterceptor('logo', new UploadService().imageMulterOptions('logos')))
  uploadLogo(@UploadedFile() file: Express.Multer.File): Promise<PlatformConfigResponseDto> {
    return this.service.updateLogo(file);
  }
}
