import {
  Controller, Post, Get, Patch, Delete, Body, Param, Query,
  UseGuards, Req, HttpCode, HttpStatus, UseInterceptors, UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags, ApiOperation, ApiResponse, ApiCookieAuth, ApiBearerAuth,
  ApiConsumes, ApiQuery, ApiParam, ApiBody,
} from '@nestjs/swagger';
import {
  CourseDataDto, CourseListItemDto, PaginatedCoursesDto, ThumbnailUploadDto,
} from './dto/responses.dto';
import { InstructorStatsResponseDto } from './dto/instructor-stats-response.dto';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles, Role } from '../common';
import { CoursesService } from './courses.service';
import { UploadService } from './upload/upload.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

type AuthRequest = Request & { user: { id: string; email: string; role: string } };

@ApiTags('courses')
@ApiCookieAuth('access_token')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.Instrutor, Role.Admin)
@Controller('courses')
export class CoursesController {
  constructor(
    private readonly coursesService: CoursesService,
    private readonly uploadService: UploadService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo curso (rascunho)' })
  @ApiResponse({ status: 201, description: 'Curso criado.', type: CourseDataDto })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({ status: 403, description: 'Sem permissão.' })
  create(@Req() req: AuthRequest, @Body() dto: CreateCourseDto) {
    return this.coursesService.create(req.user, dto).then((data) => ({ data }));
  }

  @Get('stats')
  @ApiOperation({ summary: 'Métricas do instrutor autenticado' })
  @ApiResponse({ status: 200, description: 'Stats do instrutor.', type: InstructorStatsResponseDto })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({ status: 403, description: 'Sem permissão.' })
  async getStats(@Req() req: AuthRequest) {
    return { data: await this.coursesService.getInstructorStats(req.user) };
  }

  @Get('mine')
  @ApiOperation({ summary: 'Listar cursos do instrutor autenticado' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiResponse({ status: 200, description: 'Lista paginada de cursos.', type: PaginatedCoursesDto })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  async findMine(
    @Req() req: AuthRequest,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    const { rows, total } = await this.coursesService.findMine(
      req.user,
      Math.max(1, Number(page)),
      Math.min(100, Math.max(1, Number(limit))),
    );
    return { data: rows, meta: { page: Number(page), limit: Number(limit), total } };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhes do curso com módulos e aulas (visão instrutor)' })
  @ApiParam({ name: 'id', description: 'UUID do curso' })
  @ApiResponse({ status: 200, description: 'Dados do curso.', type: CourseDataDto })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({ status: 403, description: 'Sem acesso ao curso.' })
  @ApiResponse({ status: 404, description: 'Curso não encontrado.' })
  async findOne(@Req() req: AuthRequest, @Param('id') id: string) {
    return { data: await this.coursesService.findOne(id, req.user) };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Editar curso' })
  @ApiParam({ name: 'id', description: 'UUID do curso' })
  @ApiResponse({ status: 200, description: 'Curso atualizado.', type: CourseDataDto })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({ status: 403, description: 'Sem acesso ao curso.' })
  @ApiResponse({ status: 404, description: 'Curso não encontrado.' })
  async update(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() dto: UpdateCourseDto,
  ) {
    return { data: await this.coursesService.update(id, req.user, dto) };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Excluir curso (soft delete)' })
  @ApiParam({ name: 'id', description: 'UUID do curso' })
  @ApiResponse({ status: 204, description: 'Curso excluído.' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({ status: 403, description: 'Sem acesso ao curso.' })
  @ApiResponse({ status: 404, description: 'Curso não encontrado.' })
  async remove(@Req() req: AuthRequest, @Param('id') id: string) {
    await this.coursesService.remove(id, req.user);
  }

  @Post(':id/publish')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Publicar curso' })
  @ApiParam({ name: 'id', description: 'UUID do curso' })
  @ApiResponse({ status: 200, description: 'Curso publicado.', type: CourseDataDto })
  @ApiResponse({ status: 400, description: 'Pré-condição não atendida (nenhuma aula visível).' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({ status: 403, description: 'Sem acesso.' })
  @ApiResponse({ status: 404, description: 'Curso não encontrado.' })
  async publish(@Req() req: AuthRequest, @Param('id') id: string) {
    return { data: await this.coursesService.publish(id, req.user) };
  }

  @Post(':id/unpublish')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Despublicar curso' })
  @ApiParam({ name: 'id', description: 'UUID do curso' })
  @ApiResponse({ status: 200, description: 'Curso despublicado.', type: CourseDataDto })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({ status: 403, description: 'Sem acesso.' })
  @ApiResponse({ status: 404, description: 'Curso não encontrado.' })
  async unpublish(@Req() req: AuthRequest, @Param('id') id: string) {
    return { data: await this.coursesService.unpublish(id, req.user) };
  }

  @Post(':id/thumbnail')
  @HttpCode(HttpStatus.OK)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload de thumbnail do curso' })
  @ApiParam({ name: 'id', description: 'UUID do curso' })
  @ApiBody({ type: ThumbnailUploadDto })
  @ApiResponse({ status: 200, description: 'Thumbnail salva.', type: CourseDataDto })
  @ApiResponse({ status: 400, description: 'Arquivo inválido (formato ou tamanho).' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({ status: 403, description: 'Sem acesso.' })
  @ApiResponse({ status: 404, description: 'Curso não encontrado.' })
  @UseInterceptors(FileInterceptor('thumbnail', new UploadService().multerOptions()))
  async uploadThumbnail(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return { data: await this.coursesService.uploadThumbnail(id, req.user, file) };
  }
}

export type { CourseListItemDto };
