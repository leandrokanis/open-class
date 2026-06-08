import {
  Controller, Get, Patch, Post, Delete, Body, UseGuards, Req,
  UseInterceptors, UploadedFile, HttpCode, HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags, ApiCookieAuth, ApiBearerAuth, ApiOperation, ApiResponse, ApiConsumes, ApiBody,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProfileService } from './profile.service';
import { UploadService } from '../common/upload/upload.service';
import { ProfileResponseDto } from './dto/profile-response.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

type AuthRequest = Request & { user: { id: string } };

@ApiTags('profile')
@ApiCookieAuth('access_token')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users/me')
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
    private readonly uploadService: UploadService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Retorna o perfil do usuário autenticado' })
  @ApiResponse({ status: 200, description: 'Perfil do usuário.', type: ProfileResponseDto })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  getProfile(@Req() req: AuthRequest): Promise<ProfileResponseDto> {
    return this.profileService.getProfile(req.user.id);
  }

  @Patch()
  @ApiOperation({ summary: 'Atualiza nome e/ou bio do usuário autenticado' })
  @ApiResponse({ status: 200, description: 'Perfil atualizado.', type: ProfileResponseDto })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  updateProfile(
    @Req() req: AuthRequest,
    @Body() dto: UpdateProfileDto,
  ): Promise<ProfileResponseDto> {
    return this.profileService.updateProfile(req.user.id, dto);
  }

  @Post('avatar')
  @ApiOperation({ summary: 'Envia ou substitui o avatar do usuário autenticado' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { avatar: { type: 'string', format: 'binary' } },
    },
  })
  @ApiResponse({ status: 200, description: 'Avatar atualizado.', type: ProfileResponseDto })
  @ApiResponse({ status: 400, description: 'Arquivo inválido (formato ou tamanho).' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @UseInterceptors(FileInterceptor('avatar', new UploadService().imageMulterOptions('avatars')))
  setAvatar(
    @Req() req: AuthRequest,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ProfileResponseDto> {
    return this.profileService.setAvatar(req.user.id, file);
  }

  @Delete('avatar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove o avatar do usuário autenticado' })
  @ApiResponse({ status: 200, description: 'Avatar removido.', type: ProfileResponseDto })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  removeAvatar(@Req() req: AuthRequest): Promise<ProfileResponseDto> {
    return this.profileService.removeAvatar(req.user.id);
  }

}
