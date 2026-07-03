import {
  Controller, Post, Get, Param, Req, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse, ApiCookieAuth, ApiBearerAuth, ApiParam,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { CohortsService } from './cohorts.service';
import {
  PublicCohortListResponseDto, MyCohortListResponseDto, CohortResponseDto,
} from './dto/cohort-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles, Role } from '../common';

interface AuthUser { id: string; role: string; }

@ApiTags('cohorts')
@Controller()
export class CohortsStudentController {
  constructor(private readonly service: CohortsService) {}

  @Get('courses/:courseId/cohorts/public')
  @ApiParam({ name: 'courseId', description: 'ID do curso', type: String })
  @ApiOperation({ summary: 'Turmas visíveis na página do curso (abertas, agendadas e esgotadas)' })
  @ApiResponse({ status: 200, description: 'Turmas com vagas restantes e status.', type: PublicCohortListResponseDto })
  async listPublic(@Param('courseId') courseId: string) {
    const data = await this.service.listPublic(courseId);
    return { data };
  }

  @Get('cohorts/me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Aluno, Role.Instrutor, Role.Admin)
  @ApiCookieAuth('access_token')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Minhas turmas com curso e cronograma de módulos (aluno)' })
  @ApiResponse({ status: 200, description: 'Turmas do aluno.', type: MyCohortListResponseDto })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  async myCohorts(@Req() req: Request & { user: AuthUser }) {
    const data = await this.service.myCohorts(req.user.id);
    return { data };
  }

  @Post('cohorts/:id/enroll')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Aluno, Role.Instrutor)
  @HttpCode(HttpStatus.CREATED)
  @ApiCookieAuth('access_token')
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'ID da turma', type: String })
  @ApiOperation({ summary: 'Inscrever-se em uma turma (aluno)' })
  @ApiResponse({ status: 201, description: 'Inscrição realizada.', type: CohortResponseDto })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({ status: 404, description: 'Turma não encontrada.' })
  @ApiResponse({ status: 409, description: 'Turma esgotada, ou aluno já vinculado ao curso (turma ou on demand).' })
  @ApiResponse({ status: 422, description: 'Inscrições fora do período.' })
  async enroll(
    @Param('id') id: string,
    @Req() req: Request & { user: AuthUser },
  ) {
    const data = await this.service.enrollStudent(id, req.user.id);
    return { data };
  }
}
