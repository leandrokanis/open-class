import {
  Controller, Get, Post, Put, Body, Param, Query, Req, UseGuards,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse, ApiCookieAuth, ApiBearerAuth, ApiQuery, ApiParam,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { ProgressService } from './progress.service';
import { MarkLessonDto } from './dto/mark-lesson.dto';
import { RecentActivityItemDto } from './dto/recent-activity.dto';
import { ExtrasStatusResponseDto, CelebrationResponseDto } from './dto/extras-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles, Role } from '../common';
interface AuthUser { id: string; email: string; role: string; }

@ApiTags('progress')
@ApiCookieAuth('access_token')
@ApiBearerAuth()
@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Put('lessons/:lessonId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Aluno, Role.Instrutor, Role.Admin)
  @ApiOperation({ summary: 'Marcar aula como concluída / não concluída (aluno)' })
  @ApiResponse({ status: 200, description: 'Progresso atualizado.' })
  @ApiResponse({ status: 400, description: 'Corpo inválido.' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({ status: 403, description: 'Não matriculado no curso.' })
  @ApiResponse({ status: 404, description: 'Aula não encontrada.' })
  markLesson(
    @Req() req: Request & { user: AuthUser },
    @Param('lessonId') lessonId: string,
    @Body() body: MarkLessonDto,
  ) {
    return this.progressService.markLesson(req.user.id, lessonId, body.isCompleted, req.user.role);
  }

  @Get('courses/:courseId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Aluno, Role.Instrutor, Role.Admin)
  @ApiOperation({ summary: 'Percentual de conclusão do curso (aluno)' })
  @ApiResponse({ status: 200, description: 'Estatísticas de progresso do curso.' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({ status: 403, description: 'Não matriculado no curso.' })
  @ApiResponse({ status: 404, description: 'Curso não encontrado.' })
  getCourseProgress(
    @Req() req: Request & { user: AuthUser },
    @Param('courseId') courseId: string,
  ) {
    return this.progressService.getCourseProgress(req.user.id, courseId, req.user.role);
  }

  @Get('courses/:courseId/lessons')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Aluno, Role.Instrutor, Role.Admin)
  @ApiOperation({ summary: 'IDs das aulas concluídas no curso (aluno)' })
  @ApiResponse({ status: 200, description: 'Lista de IDs de aulas concluídas.' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({ status: 403, description: 'Não matriculado no curso.' })
  getCompletedLessons(
    @Req() req: Request & { user: AuthUser },
    @Param('courseId') courseId: string,
  ) {
    return this.progressService.getCompletedLessonIds(req.user.id, courseId, req.user.role).then(
      (completedLessonIds) => ({ completedLessonIds }),
    );
  }

  @Get('courses/:courseId/last-accessed')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Aluno, Role.Instrutor, Role.Admin)
  @ApiOperation({ summary: 'Última aula acessada no curso (aluno)' })
  @ApiResponse({ status: 200, description: 'Última aula acessada ou null.' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({ status: 403, description: 'Não matriculado no curso.' })
  @ApiResponse({ status: 404, description: 'Curso não encontrado.' })
  getLastAccessed(
    @Req() req: Request & { user: AuthUser },
    @Param('courseId') courseId: string,
  ) {
    return this.progressService.getLastAccessed(req.user.id, courseId, req.user.role);
  }

  @Get('courses/:courseId/extras')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Aluno, Role.Instrutor, Role.Admin)
  @ApiParam({ name: 'courseId', description: 'ID do curso', type: String })
  @ApiOperation({ summary: 'Status das aulas extras por módulo (aluno)' })
  @ApiResponse({ status: 200, description: 'Status por módulo: hasExtras, unlocked, celebrated.', type: ExtrasStatusResponseDto })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({ status: 403, description: 'Não matriculado no curso.' })
  async getExtrasStatus(
    @Req() req: Request & { user: AuthUser },
    @Param('courseId') courseId: string,
  ) {
    const data = await this.progressService.getExtrasStatus(req.user.id, courseId, req.user.role);
    return { data };
  }

  @Post('modules/:moduleId/extras-celebration')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Aluno, Role.Instrutor, Role.Admin)
  @ApiParam({ name: 'moduleId', description: 'ID do módulo', type: String })
  @ApiOperation({ summary: 'Registrar celebração de desbloqueio das extras (uma vez por módulo)' })
  @ApiResponse({ status: 201, description: 'Celebração registrada (idempotente).', type: CelebrationResponseDto })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({ status: 403, description: 'Não matriculado no curso.' })
  @ApiResponse({ status: 404, description: 'Módulo não encontrado.' })
  async celebrateExtras(
    @Req() req: Request & { user: AuthUser },
    @Param('moduleId') moduleId: string,
  ) {
    const data = await this.progressService.celebrateExtras(req.user.id, moduleId, req.user.role);
    return { data };
  }

  @Get('recent')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Aluno, Role.Instrutor, Role.Admin)
  @ApiOperation({ summary: 'Atividade recente do aluno — últimas N aulas acessadas' })
  @ApiQuery({ name: 'limit', required: false, example: 5, description: 'Número de itens (default 5, max 20)' })
  @ApiResponse({ status: 200, description: 'Lista de atividade recente.', type: [RecentActivityItemDto] })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({ status: 403, description: 'Papel insuficiente.' })
  getRecentActivity(
    @Req() req: Request & { user: AuthUser },
    @Query('limit') limit?: string,
  ) {
    const parsedLimit = Math.min(Number(limit ?? 5), 20);
    return this.progressService.getRecentActivity(req.user.id, parsedLimit);
  }
}
