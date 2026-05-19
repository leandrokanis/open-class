import {
  Controller, Get, Put, Body, Param, Req, UseGuards,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse, ApiCookieAuth, ApiBearerAuth,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { ProgressService } from './progress.service';
import { MarkLessonDto } from './dto/mark-lesson.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles, Role } from '../common';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';

@ApiTags('progress')
@ApiCookieAuth('access_token')
@ApiBearerAuth()
@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Put('lessons/:lessonId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Aluno)
  @ApiOperation({ summary: 'Marcar aula como concluída / não concluída (aluno)' })
  @ApiResponse({ status: 200, description: 'Progresso atualizado.' })
  @ApiResponse({ status: 400, description: 'Corpo inválido.' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({ status: 403, description: 'Não matriculado no curso.' })
  @ApiResponse({ status: 404, description: 'Aula não encontrada.' })
  markLesson(
    @Req() req: Request & { user: JwtPayload },
    @Param('lessonId') lessonId: string,
    @Body() body: MarkLessonDto,
  ) {
    return this.progressService.markLesson(req.user.sub, lessonId, body.isCompleted);
  }

  @Get('courses/:courseId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Aluno)
  @ApiOperation({ summary: 'Percentual de conclusão do curso (aluno)' })
  @ApiResponse({ status: 200, description: 'Estatísticas de progresso do curso.' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({ status: 403, description: 'Não matriculado no curso.' })
  @ApiResponse({ status: 404, description: 'Curso não encontrado.' })
  getCourseProgress(
    @Req() req: Request & { user: JwtPayload },
    @Param('courseId') courseId: string,
  ) {
    return this.progressService.getCourseProgress(req.user.sub, courseId);
  }

  @Get('courses/:courseId/lessons')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Aluno)
  @ApiOperation({ summary: 'IDs das aulas concluídas no curso (aluno)' })
  @ApiResponse({ status: 200, description: 'Lista de IDs de aulas concluídas.' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({ status: 403, description: 'Não matriculado no curso.' })
  getCompletedLessons(
    @Req() req: Request & { user: JwtPayload },
    @Param('courseId') courseId: string,
  ) {
    return this.progressService.getCompletedLessonIds(req.user.sub, courseId).then(
      (completedLessonIds) => ({ completedLessonIds }),
    );
  }

  @Get('courses/:courseId/last-accessed')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Aluno)
  @ApiOperation({ summary: 'Última aula acessada no curso (aluno)' })
  @ApiResponse({ status: 200, description: 'Última aula acessada ou null.' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({ status: 403, description: 'Não matriculado no curso.' })
  @ApiResponse({ status: 404, description: 'Curso não encontrado.' })
  getLastAccessed(
    @Req() req: Request & { user: JwtPayload },
    @Param('courseId') courseId: string,
  ) {
    return this.progressService.getLastAccessed(req.user.sub, courseId);
  }
}
