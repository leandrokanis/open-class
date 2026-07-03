import {
  Controller, Post, Get, Patch, Put, Param, Body, Req, UseGuards,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse, ApiCookieAuth, ApiBearerAuth, ApiParam,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { CohortsService } from './cohorts.service';
import { CreateCohortDto } from './dto/create-cohort.dto';
import { UpdateCohortDto } from './dto/update-cohort.dto';
import { SetScheduleDto } from './dto/set-schedule.dto';
import {
  CohortResponseDto, CohortListResponseDto, CohortWithScheduleResponseDto, CohortProgressResponseDto,
} from './dto/cohort-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles, Role } from '../common';

interface AuthUser { id: string; role: string; }

@ApiTags('cohorts')
@ApiCookieAuth('access_token')
@ApiBearerAuth()
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.Instrutor, Role.Admin)
export class CohortsController {
  constructor(private readonly service: CohortsService) {}

  @Post('courses/:courseId/cohorts')
  @ApiParam({ name: 'courseId', description: 'ID do curso', type: String })
  @ApiOperation({ summary: 'Criar turma para um curso' })
  @ApiResponse({ status: 201, description: 'Turma criada.', type: CohortResponseDto })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({ status: 403, description: 'Sem acesso ao curso.' })
  @ApiResponse({ status: 404, description: 'Curso não encontrado.' })
  @ApiResponse({ status: 422, description: 'Período de inscrições inválido.' })
  async create(
    @Param('courseId') courseId: string,
    @Body() dto: CreateCohortDto,
    @Req() req: Request & { user: AuthUser },
  ) {
    const data = await this.service.create(courseId, dto, req.user.id, req.user.role);
    return { data };
  }

  @Get('courses/:courseId/cohorts')
  @ApiParam({ name: 'courseId', description: 'ID do curso', type: String })
  @ApiOperation({ summary: 'Listar turmas de um curso (instrutor dono)' })
  @ApiResponse({ status: 200, description: 'Turmas do curso.', type: CohortListResponseDto })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({ status: 403, description: 'Sem acesso ao curso.' })
  async listByCourse(
    @Param('courseId') courseId: string,
    @Req() req: Request & { user: AuthUser },
  ) {
    const data = await this.service.listByCourse(courseId, req.user.id, req.user.role);
    return { data };
  }

  @Get('cohorts/:id')
  @ApiParam({ name: 'id', description: 'ID da turma', type: String })
  @ApiOperation({ summary: 'Detalhes da turma com cronograma' })
  @ApiResponse({ status: 200, description: 'Turma com cronograma.', type: CohortWithScheduleResponseDto })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({ status: 403, description: 'Sem acesso ao curso.' })
  @ApiResponse({ status: 404, description: 'Turma não encontrada.' })
  async findById(
    @Param('id') id: string,
    @Req() req: Request & { user: AuthUser },
  ) {
    const data = await this.service.findById(id, req.user.id, req.user.role);
    return { data };
  }

  @Get('cohorts/:id/progress')
  @ApiParam({ name: 'id', description: 'ID da turma', type: String })
  @ApiOperation({ summary: 'Painel de progresso da turma: resumo, alunos e módulos' })
  @ApiResponse({ status: 200, description: 'Progresso agregado da turma.', type: CohortProgressResponseDto })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({ status: 403, description: 'Sem acesso ao curso.' })
  @ApiResponse({ status: 404, description: 'Turma não encontrada.' })
  async getProgress(
    @Param('id') id: string,
    @Req() req: Request & { user: AuthUser },
  ) {
    const data = await this.service.getProgress(id, req.user.id, req.user.role);
    return { data };
  }

  @Patch('cohorts/:id')
  @ApiParam({ name: 'id', description: 'ID da turma', type: String })
  @ApiOperation({ summary: 'Atualizar turma (nome, período, vagas)' })
  @ApiResponse({ status: 200, description: 'Turma atualizada.', type: CohortResponseDto })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({ status: 403, description: 'Sem acesso ao curso.' })
  @ApiResponse({ status: 404, description: 'Turma não encontrada.' })
  @ApiResponse({ status: 422, description: 'Período de inscrições inválido.' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCohortDto,
    @Req() req: Request & { user: AuthUser },
  ) {
    const data = await this.service.update(id, dto, req.user.id, req.user.role);
    return { data };
  }

  @Patch('cohorts/:id/close')
  @ApiParam({ name: 'id', description: 'ID da turma', type: String })
  @ApiOperation({ summary: 'Encerrar turma manualmente (idempotente)' })
  @ApiResponse({ status: 200, description: 'Turma encerrada.', type: CohortResponseDto })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({ status: 403, description: 'Sem acesso ao curso.' })
  @ApiResponse({ status: 404, description: 'Turma não encontrada.' })
  async close(
    @Param('id') id: string,
    @Req() req: Request & { user: AuthUser },
  ) {
    const data = await this.service.close(id, req.user.id, req.user.role);
    return { data };
  }

  @Put('cohorts/:id/schedule')
  @ApiParam({ name: 'id', description: 'ID da turma', type: String })
  @ApiOperation({ summary: 'Definir cronograma de liberação dos módulos da turma' })
  @ApiResponse({ status: 200, description: 'Cronograma atualizado.', type: CohortWithScheduleResponseDto })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({ status: 403, description: 'Sem acesso ao curso.' })
  @ApiResponse({ status: 404, description: 'Turma não encontrada.' })
  @ApiResponse({ status: 422, description: 'Módulo não pertence ao curso da turma.' })
  async setSchedule(
    @Param('id') id: string,
    @Body() dto: SetScheduleDto,
    @Req() req: Request & { user: AuthUser },
  ) {
    const data = await this.service.setSchedule(id, dto.entries, req.user.id, req.user.role);
    return { data };
  }
}
