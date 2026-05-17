import {
  Controller, Get, Patch, Param, Body, UseGuards, ParseUUIDPipe, Req,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse, ApiCookieAuth, ApiBearerAuth, ApiProperty, ApiParam,
} from '@nestjs/swagger';
import { IsEnum, IsBoolean } from 'class-validator';
import type { Request } from 'express';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles, Role } from '../common';

type AuthRequest = Request & { user: { id: string } };

class UpdateRoleDto {
  @ApiProperty({ enum: Role, example: Role.Instrutor })
  @IsEnum(Role)
  role!: Role;
}

class UpdateStatusDto {
  @ApiProperty({ example: false, description: 'Status de ativação da conta' })
  @IsBoolean()
  isActive!: boolean;
}

@ApiTags('users')
@ApiCookieAuth('access_token')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.Admin)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os usuários (admin)' })
  @ApiResponse({ status: 200, description: 'Lista de usuários.' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({ status: 403, description: 'Papel insuficiente.' })
  findAll() {
    return this.usersService.findAll();
  }

  @Patch(':id/role')
  @ApiOperation({ summary: 'Alterar papel de um usuário (admin)' })
  @ApiParam({ name: 'id', description: 'UUID do usuário', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Papel atualizado.' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({ status: 403, description: 'Papel insuficiente.' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  updateRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRoleDto,
  ) {
    return this.usersService.updateUserRole(id, dto.role);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Ativar ou desativar conta de usuário (admin)' })
  @ApiParam({ name: 'id', description: 'UUID do usuário', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Status atualizado.' })
  @ApiResponse({ status: 400, description: 'Não é possível desativar a própria conta.' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({ status: 403, description: 'Papel insuficiente.' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  setStatus(
    @Req() req: AuthRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.usersService.setActiveStatus(id, req.user.id, dto.isActive);
  }
}
