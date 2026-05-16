import {
  Controller, Get, Post, Body, Req, UseGuards,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse, ApiCookieAuth, ApiBearerAuth, ApiProperty,
} from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
import type { Request } from 'express';
import { EnrollmentsService } from './enrollments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles, Role } from '../common';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';

class EnrollDto {
  @ApiProperty({ description: 'UUID do curso a se matricular', format: 'uuid' })
  @IsUUID()
  courseId!: string;
}

@ApiTags('enrollments')
@ApiCookieAuth('access_token')
@ApiBearerAuth()
@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Aluno)
  @ApiOperation({ summary: 'Matricular-se em um curso (aluno)' })
  @ApiResponse({ status: 201, description: 'Matrícula criada.' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({ status: 403, description: 'Papel insuficiente — somente alunos podem se matricular.' })
  enroll(
    @Req() req: Request & { user: JwtPayload },
    @Body() body: EnrollDto,
  ) {
    return this.enrollmentsService.enroll(req.user.sub, body.courseId);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Aluno, Role.Admin)
  @ApiOperation({ summary: 'Listar matrículas do aluno autenticado' })
  @ApiResponse({ status: 200, description: 'Lista de matrículas do aluno.' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({ status: 403, description: 'Papel insuficiente.' })
  findMine(@Req() req: Request & { user: JwtPayload }) {
    return this.enrollmentsService.findByStudent(req.user.sub);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Listar todas as matrículas (admin)' })
  @ApiResponse({ status: 200, description: 'Lista de todas as matrículas.' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({ status: 403, description: 'Papel insuficiente.' })
  findAll() {
    return this.enrollmentsService.findAll();
  }
}
