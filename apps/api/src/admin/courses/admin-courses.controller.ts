import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse, ApiCookieAuth, ApiBearerAuth, ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles, Role } from '../../common';
import { AdminCoursesService } from './admin-courses.service';

@ApiTags('admin')
@ApiCookieAuth('access_token')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.Admin)
@Controller('admin/courses')
export class AdminCoursesController {
  constructor(private readonly adminCoursesService: AdminCoursesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os cursos da plataforma (admin)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'status', required: false, enum: ['draft', 'published'] })
  @ApiQuery({ name: 'instructorId', required: false, type: String, format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Lista paginada de todos os cursos.' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({ status: 403, description: 'Papel insuficiente.' })
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('status') status?: 'draft' | 'published',
    @Query('instructorId') instructorId?: string,
  ) {
    const p = Math.max(1, Number(page));
    const l = Math.min(100, Math.max(1, Number(limit)));
    const { rows, total } = await this.adminCoursesService.listAll(p, l, { status, instructorId });
    return { data: rows, meta: { page: p, limit: l, total } };
  }
}
