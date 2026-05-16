import {
  Controller, Post, Patch, Delete,
  Param, Body, Req, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse, ApiCookieAuth, ApiBearerAuth, ApiParam,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { ResourcesService } from './resources.service';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { ResourceResponseDto } from './dto/resource-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles, Role } from '../common';

@ApiTags('lesson-resources')
@Controller('lessons/:lessonId/resources')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.Instrutor, Role.Admin)
@ApiCookieAuth('access_token')
@ApiBearerAuth()
@ApiParam({ name: 'lessonId', description: 'ID da aula', type: String })
export class ResourcesController {
  constructor(private readonly service: ResourcesService) {}

  @Post()
  @ApiOperation({ summary: 'Adicionar recurso a uma aula' })
  @ApiResponse({ status: 201, description: 'Recurso criado.', type: ResourceResponseDto })
  async create(
    @Param('lessonId') lessonId: string,
    @Body() dto: CreateResourceDto,
    @Req() req: Request & { user: { id: string; role: string } },
  ) {
    const data = await this.service.create(lessonId, dto, req.user.id, req.user.role);
    return { data };
  }

  @Patch(':resourceId')
  @ApiParam({ name: 'resourceId', description: 'ID do recurso', type: String })
  @ApiOperation({ summary: 'Atualizar recurso de uma aula' })
  @ApiResponse({ status: 200, description: 'Recurso atualizado.', type: ResourceResponseDto })
  async update(
    @Param('lessonId') lessonId: string,
    @Param('resourceId') resourceId: string,
    @Body() dto: UpdateResourceDto,
    @Req() req: Request & { user: { id: string; role: string } },
  ) {
    const data = await this.service.update(resourceId, lessonId, dto, req.user.id, req.user.role);
    return { data };
  }

  @Delete(':resourceId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'resourceId', description: 'ID do recurso', type: String })
  @ApiOperation({ summary: 'Remover recurso de uma aula' })
  @ApiResponse({ status: 204, description: 'Recurso removido.' })
  async delete(
    @Param('lessonId') lessonId: string,
    @Param('resourceId') resourceId: string,
    @Req() req: Request & { user: { id: string; role: string } },
  ) {
    await this.service.delete(resourceId, lessonId, req.user.id, req.user.role);
  }
}
