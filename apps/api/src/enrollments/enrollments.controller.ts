import {
  Controller, Get, Post, Body, Req, UseGuards,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse, ApiCookieAuth, ApiBearerAuth, ApiProperty,
} from '@nestjs/swagger';
import { EnrollmentWithProgressDto } from './dto/enrollment-with-progress.dto';
import { IsUUID } from 'class-validator';
import type { Request } from 'express';
import { EnrollmentsService } from './enrollments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles, Role } from '../common';
interface AuthUser { id: string; email: string; role: string; }

class EnrollDto {
  @ApiProperty({ description: 'UUID do curso a se matricular', format: 'uuid' })
  @IsUUID()
  courseId!: string;
}

class AdminEnrollDto {
  @ApiProperty({ description: 'UUID do aluno a matricular', format: 'uuid' })
  @IsUUID()
  studentId!: string;

  @ApiProperty({ description: 'UUID do curso', format: 'uuid' })
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
  @Roles(Role.Aluno, Role.Instrutor)
  @ApiOperation({ summary: 'Matricular-se em um curso (aluno)' })
  @ApiResponse({ status: 201, description: 'Matrícula criada.' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({ status: 403, description: 'Papel insuficiente.' })
  enroll(
    @Req() req: Request & { user: AuthUser },
    @Body() body: EnrollDto,
  ) {
    return this.enrollmentsService.enroll(req.user.id, body.courseId);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Aluno, Role.Instrutor, Role.Admin)
  @ApiOperation({ summary: 'Listar matrículas do aluno autenticado com progresso' })
  @ApiResponse({ status: 200, description: 'Lista de matrículas do aluno com progresso.', type: [EnrollmentWithProgressDto] })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({ status: 403, description: 'Papel insuficiente.' })
  findMine(@Req() req: Request & { user: AuthUser }) {
    return this.enrollmentsService.findByStudent(req.user.id);
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

  @Post('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Matricular aluno em curso (admin)' })
  @ApiResponse({ status: 201, description: 'Matrícula criada pelo admin.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({ status: 403, description: 'Papel insuficiente.' })
  @ApiResponse({ status: 409, description: 'Aluno já matriculado.' })
  enrollForStudent(@Body() body: AdminEnrollDto) {
    return this.enrollmentsService.enroll(body.studentId, body.courseId);
  }
}
