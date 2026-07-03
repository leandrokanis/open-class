import {
  Controller, Post, Get, Patch, Delete, Put,
  Param, Body, Req, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse, ApiCookieAuth, ApiBearerAuth, ApiParam,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { LessonsService } from './lessons.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { ReorderLessonsDto } from './dto/reorder-lessons.dto';
import { VisibilityDto } from '../courses/dto/visibility.dto';
import { MoveLessonDto } from './dto/move-lesson.dto';
import {
  LessonResponseDto, LessonListResponseDto, LessonWithResourcesResponseDto, ExtraUnlocksResponseDto,
} from './dto/lesson-response.dto';
import { ReorderResponseDto } from '../modules/dto/module-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles, Role } from '../common';

@ApiTags('lessons')
@Controller()
export class LessonsController {
  constructor(private readonly service: LessonsService) {}

  @Post('modules/:moduleId/lessons')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Instrutor, Role.Admin)
  @ApiCookieAuth('access_token')
  @ApiBearerAuth()
  @ApiParam({ name: 'moduleId', description: 'ID do módulo', type: String })
  @ApiOperation({ summary: 'Criar aula em um módulo' })
  @ApiResponse({ status: 201, description: 'Aula criada.', type: LessonResponseDto })
  @ApiResponse({ status: 422, description: 'URL do YouTube inválida ou vídeo não encontrado.' })
  @ApiResponse({ status: 503, description: 'YouTube API indisponível.' })
  async create(
    @Param('moduleId') moduleId: string,
    @Body() dto: CreateLessonDto,
    @Req() req: Request & { user: { id: string; role: string } },
  ) {
    const data = await this.service.create(moduleId, dto, req.user.id, req.user.role);
    return { data };
  }

  @Get('modules/:moduleId/lessons')
  @ApiParam({ name: 'moduleId', description: 'ID do módulo', type: String })
  @ApiOperation({ summary: 'Listar aulas de um módulo' })
  @ApiResponse({ status: 200, description: 'Lista de aulas.', type: LessonListResponseDto })
  async findByModule(
    @Param('moduleId') moduleId: string,
    @Req() req: Request & { user?: { role: string } },
  ) {
    const data = await this.service.findByModule(moduleId, req.user?.role);
    return { data };
  }

  @Get('lessons/:id')
  @ApiParam({ name: 'id', description: 'ID da aula', type: String })
  @ApiOperation({ summary: 'Detalhes de uma aula (inclui recursos)' })
  @ApiResponse({ status: 200, description: 'Detalhes da aula.', type: LessonWithResourcesResponseDto })
  @ApiResponse({ status: 403, description: 'Aula extra ainda bloqueada para o aluno.' })
  @ApiResponse({ status: 404, description: 'Aula não encontrada.' })
  async findById(
    @Param('id') id: string,
    @Req() req: Request & { user?: { id: string; role: string } },
  ) {
    const data = await this.service.findById(id, req.user?.role, req.user?.id);
    return { data };
  }

  @Patch('lessons/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Instrutor, Role.Admin)
  @ApiCookieAuth('access_token')
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'ID da aula', type: String })
  @ApiOperation({ summary: 'Atualizar aula' })
  @ApiResponse({ status: 200, description: 'Aula atualizada.', type: LessonResponseDto })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateLessonDto,
    @Req() req: Request & { user: { id: string; role: string } },
  ) {
    const data = await this.service.update(id, dto, req.user.id, req.user.role);
    return { data };
  }

  @Patch('lessons/:id/move')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Instrutor, Role.Admin)
  @ApiCookieAuth('access_token')
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'ID da aula', type: String })
  @ApiOperation({ summary: 'Mover aula para outro módulo (cross-section)' })
  @ApiResponse({ status: 200, description: 'Aula movida.', type: LessonResponseDto })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 403, description: 'Sem acesso ao curso.' })
  @ApiResponse({ status: 404, description: 'Aula ou módulo não encontrado.' })
  async move(
    @Param('id') id: string,
    @Body() dto: MoveLessonDto,
    @Req() req: Request & { user: { id: string; role: string } },
  ) {
    const data = await this.service.move(id, dto, req.user.id, req.user.role);
    return { data };
  }

  @Patch('lessons/:id/visibility')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Instrutor, Role.Admin)
  @ApiCookieAuth('access_token')
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'ID da aula', type: String })
  @ApiOperation({ summary: 'Alterar visibilidade da aula' })
  @ApiResponse({ status: 200, description: 'Visibilidade atualizada.', type: LessonResponseDto })
  async setVisibility(
    @Param('id') id: string,
    @Body() dto: VisibilityDto,
    @Req() req: Request & { user: { id: string; role: string } },
  ) {
    const data = await this.service.setVisibility(id, dto.visibility, req.user.id, req.user.role);
    return { data };
  }

  @Delete('lessons/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Instrutor, Role.Admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiCookieAuth('access_token')
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'ID da aula', type: String })
  @ApiOperation({ summary: 'Deletar aula' })
  @ApiResponse({ status: 204, description: 'Aula deletada.' })
  async delete(
    @Param('id') id: string,
    @Req() req: Request & { user: { id: string; role: string } },
  ) {
    await this.service.delete(id, req.user.id, req.user.role);
  }

  @Get('modules/:moduleId/extra-unlocks')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Instrutor, Role.Admin)
  @ApiCookieAuth('access_token')
  @ApiBearerAuth()
  @ApiParam({ name: 'moduleId', description: 'ID do módulo', type: String })
  @ApiOperation({ summary: 'Contar alunos que já desbloquearam as aulas extras do módulo' })
  @ApiResponse({ status: 200, description: 'Contagem de desbloqueios.', type: ExtraUnlocksResponseDto })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({ status: 403, description: 'Sem acesso ao curso.' })
  @ApiResponse({ status: 404, description: 'Módulo não encontrado.' })
  async extraUnlocks(
    @Param('moduleId') moduleId: string,
    @Req() req: Request & { user: { id: string; role: string } },
  ) {
    const data = await this.service.extraUnlocksCount(moduleId, req.user.id, req.user.role);
    return { data };
  }

  @Put('modules/:moduleId/lessons/reorder')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Instrutor, Role.Admin)
  @ApiCookieAuth('access_token')
  @ApiBearerAuth()
  @ApiParam({ name: 'moduleId', description: 'ID do módulo', type: String })
  @ApiOperation({ summary: 'Reordenar aulas de um módulo' })
  @ApiResponse({ status: 200, description: 'Aulas reordenadas.', type: ReorderResponseDto })
  @ApiResponse({ status: 422, description: 'IDs não correspondem ao conjunto atual de aulas.' })
  async reorder(
    @Param('moduleId') moduleId: string,
    @Body() dto: ReorderLessonsDto,
    @Req() req: Request & { user: { id: string; role: string } },
  ) {
    const data = await this.service.reorder(moduleId, dto.ids, req.user.id, req.user.role);
    return { data };
  }
}
