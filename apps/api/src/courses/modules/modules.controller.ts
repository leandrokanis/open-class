import {
  Controller, Post, Patch, Delete, Body, Param, Query,
  UseGuards, Req, HttpCode, HttpStatus,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse, ApiCookieAuth, ApiBearerAuth, ApiQuery, ApiParam,
} from '@nestjs/swagger';
import { ModuleDataDto } from '../dto/responses.dto';
import type { Request } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles, Role } from '../../common';
import { ModulesService } from './modules.service';
import { CreateModuleDto } from '../dto/create-module.dto';
import { UpdateModuleDto } from '../dto/update-module.dto';
import { ReorderDto } from '../dto/reorder.dto';
import { VisibilityDto } from '../dto/visibility.dto';

type AuthRequest = Request & { user: { id: string; email: string; role: string } };

@ApiTags('modules')
@ApiCookieAuth('access_token')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.Instrutor, Role.Admin)
@Controller('courses/:courseId/modules')
export class ModulesController {
  constructor(private readonly modulesService: ModulesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar módulo no curso' })
  @ApiParam({ name: 'courseId', description: 'UUID do curso' })
  @ApiResponse({ status: 201, description: 'Módulo criado.', type: ModuleDataDto })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({ status: 403, description: 'Sem acesso ao curso.' })
  @ApiResponse({ status: 404, description: 'Curso não encontrado.' })
  async create(
    @Req() req: AuthRequest,
    @Param('courseId') courseId: string,
    @Body() dto: CreateModuleDto,
  ) {
    return { data: await this.modulesService.create(courseId, req.user, dto) };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Editar módulo' })
  @ApiParam({ name: 'courseId', description: 'UUID do curso' })
  @ApiParam({ name: 'id', description: 'UUID do módulo' })
  @ApiResponse({ status: 200, description: 'Módulo atualizado.', type: ModuleDataDto })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({ status: 403, description: 'Sem acesso ao curso.' })
  @ApiResponse({ status: 404, description: 'Módulo não encontrado.' })
  async update(
    @Req() req: AuthRequest,
    @Param('courseId') courseId: string,
    @Param('id') id: string,
    @Body() dto: UpdateModuleDto,
  ) {
    return { data: await this.modulesService.update(courseId, id, req.user, dto) };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Excluir módulo' })
  @ApiParam({ name: 'courseId', description: 'UUID do curso' })
  @ApiParam({ name: 'id', description: 'UUID do módulo' })
  @ApiQuery({ name: 'force', required: false, type: Boolean, description: 'Excluir com aulas em cascade' })
  @ApiResponse({ status: 204, description: 'Módulo excluído.' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({ status: 403, description: 'Sem acesso ao curso.' })
  @ApiResponse({ status: 404, description: 'Módulo não encontrado.' })
  @ApiResponse({ status: 409, description: 'Módulo possui aulas. Use ?force=true.' })
  async remove(
    @Req() req: AuthRequest,
    @Param('courseId') courseId: string,
    @Param('id') id: string,
    @Query('force') force?: string,
  ) {
    await this.modulesService.remove(courseId, id, req.user, force === 'true');
  }

  @Post('reorder')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reordenar módulos do curso' })
  @ApiParam({ name: 'courseId', description: 'UUID do curso' })
  @ApiResponse({ status: 200, description: 'Módulos reordenados.', type: ModuleDataDto })
  @ApiResponse({ status: 400, description: 'Lista de IDs inválida ou incompleta.' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({ status: 403, description: 'Sem acesso ao curso.' })
  async reorder(
    @Req() req: AuthRequest,
    @Param('courseId') courseId: string,
    @Body() dto: ReorderDto,
  ) {
    return { data: await this.modulesService.reorder(courseId, req.user, dto.ids) };
  }

  @Patch(':id/visibility')
  @ApiOperation({ summary: 'Alterar visibilidade do módulo' })
  @ApiParam({ name: 'courseId', description: 'UUID do curso' })
  @ApiParam({ name: 'id', description: 'UUID do módulo' })
  @ApiResponse({ status: 200, description: 'Visibilidade atualizada.', type: ModuleDataDto })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({ status: 403, description: 'Sem acesso ao curso.' })
  @ApiResponse({ status: 404, description: 'Módulo não encontrado.' })
  async setVisibility(
    @Req() req: AuthRequest,
    @Param('courseId') courseId: string,
    @Param('id') id: string,
    @Body() dto: VisibilityDto,
  ) {
    return { data: await this.modulesService.setVisibility(courseId, id, req.user, dto.visibility) };
  }
}
