import {
  Controller, Post, Patch, Delete, Body, Param,
  UseGuards, Req, HttpCode, HttpStatus,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse, ApiCookieAuth, ApiBearerAuth, ApiParam,
} from '@nestjs/swagger';
import { LessonDataDto } from '../dto/responses.dto';
import type { Request } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../guards/roles.guard';
import { LessonsService } from './lessons.service';
import { CreateLessonDto } from '../dto/create-lesson.dto';
import { UpdateLessonDto } from '../dto/update-lesson.dto';
import { ReorderDto } from '../dto/reorder.dto';
import { VisibilityDto } from '../dto/visibility.dto';

type AuthRequest = Request & { user: { id: string; email: string; role: string } };

@ApiTags('lessons')
@ApiCookieAuth('access_token')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('instrutor', 'admin')
@Controller('courses/:courseId/modules/:moduleId/lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar aula no módulo' })
  @ApiParam({ name: 'courseId', description: 'UUID do curso' })
  @ApiParam({ name: 'moduleId', description: 'UUID do módulo' })
  @ApiResponse({ status: 201, description: 'Aula criada.', type: LessonDataDto })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({ status: 403, description: 'Sem acesso ao curso.' })
  @ApiResponse({ status: 404, description: 'Módulo não encontrado.' })
  async create(
    @Req() req: AuthRequest,
    @Param('courseId') courseId: string,
    @Param('moduleId') moduleId: string,
    @Body() dto: CreateLessonDto,
  ) {
    return { data: await this.lessonsService.create(courseId, moduleId, req.user, dto) };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Editar aula' })
  @ApiParam({ name: 'courseId', description: 'UUID do curso' })
  @ApiParam({ name: 'moduleId', description: 'UUID do módulo' })
  @ApiParam({ name: 'id', description: 'UUID da aula' })
  @ApiResponse({ status: 200, description: 'Aula atualizada.', type: LessonDataDto })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({ status: 403, description: 'Sem acesso ao curso.' })
  @ApiResponse({ status: 404, description: 'Aula não encontrada.' })
  async update(
    @Req() req: AuthRequest,
    @Param('courseId') courseId: string,
    @Param('moduleId') moduleId: string,
    @Param('id') id: string,
    @Body() dto: UpdateLessonDto,
  ) {
    return { data: await this.lessonsService.update(courseId, moduleId, id, req.user, dto) };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Excluir aula' })
  @ApiParam({ name: 'courseId', description: 'UUID do curso' })
  @ApiParam({ name: 'moduleId', description: 'UUID do módulo' })
  @ApiParam({ name: 'id', description: 'UUID da aula' })
  @ApiResponse({ status: 204, description: 'Aula excluída.' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({ status: 403, description: 'Sem acesso ao curso.' })
  @ApiResponse({ status: 404, description: 'Aula não encontrada.' })
  async remove(
    @Req() req: AuthRequest,
    @Param('courseId') courseId: string,
    @Param('moduleId') moduleId: string,
    @Param('id') id: string,
  ) {
    await this.lessonsService.remove(courseId, moduleId, id, req.user);
  }

  @Post('reorder')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reordenar aulas do módulo' })
  @ApiParam({ name: 'courseId', description: 'UUID do curso' })
  @ApiParam({ name: 'moduleId', description: 'UUID do módulo' })
  @ApiResponse({ status: 200, description: 'Aulas reordenadas.', type: LessonDataDto })
  @ApiResponse({ status: 400, description: 'Lista de IDs inválida ou incompleta.' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({ status: 403, description: 'Sem acesso ao curso.' })
  async reorder(
    @Req() req: AuthRequest,
    @Param('courseId') courseId: string,
    @Param('moduleId') moduleId: string,
    @Body() dto: ReorderDto,
  ) {
    return { data: await this.lessonsService.reorder(courseId, moduleId, req.user, dto.ids) };
  }

  @Patch(':id/visibility')
  @ApiOperation({ summary: 'Alterar visibilidade da aula' })
  @ApiParam({ name: 'courseId', description: 'UUID do curso' })
  @ApiParam({ name: 'moduleId', description: 'UUID do módulo' })
  @ApiParam({ name: 'id', description: 'UUID da aula' })
  @ApiResponse({ status: 200, description: 'Visibilidade atualizada.', type: LessonDataDto })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({ status: 403, description: 'Sem acesso ao curso.' })
  @ApiResponse({ status: 404, description: 'Aula não encontrada.' })
  async setVisibility(
    @Req() req: AuthRequest,
    @Param('courseId') courseId: string,
    @Param('moduleId') moduleId: string,
    @Param('id') id: string,
    @Body() dto: VisibilityDto,
  ) {
    return {
      data: await this.lessonsService.setVisibility(courseId, moduleId, id, req.user, dto.visibility),
    };
  }
}
