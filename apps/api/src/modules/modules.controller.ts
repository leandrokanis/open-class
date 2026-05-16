import {
  Controller, Post, Get, Patch, Delete, Put,
  Param, Body, Req, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse, ApiCookieAuth, ApiBearerAuth, ApiParam,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { ModulesService } from './modules.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { ReorderModulesDto } from './dto/reorder-modules.dto';
import { ModuleResponseDto, ModuleListResponseDto, ReorderResponseDto } from './dto/module-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('modules')
@Controller()
export class ModulesController {
  constructor(private readonly service: ModulesService) {}

  @Post('courses/:courseId/modules')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('instructor', 'admin')
  @ApiCookieAuth('access_token')
  @ApiBearerAuth()
  @ApiParam({ name: 'courseId', description: 'ID do curso', type: String })
  @ApiOperation({ summary: 'Criar módulo em um curso' })
  @ApiResponse({ status: 201, description: 'Módulo criado.', type: ModuleResponseDto })
  @ApiResponse({ status: 403, description: 'Sem permissão.' })
  @ApiResponse({ status: 404, description: 'Curso não encontrado.' })
  async create(
    @Param('courseId') courseId: string,
    @Body() dto: CreateModuleDto,
    @Req() req: Request & { user: { id: string; role: string } },
  ) {
    const data = await this.service.create(courseId, dto, req.user.id, req.user.role);
    return { data };
  }

  @Get('courses/:courseId/modules')
  @ApiParam({ name: 'courseId', description: 'ID do curso', type: String })
  @ApiOperation({ summary: 'Listar módulos de um curso' })
  @ApiResponse({ status: 200, description: 'Lista de módulos.', type: ModuleListResponseDto })
  async findByCourse(@Param('courseId') courseId: string) {
    const data = await this.service.findByCourse(courseId);
    return { data };
  }

  @Patch('courses/:courseId/modules/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('instructor', 'admin')
  @ApiCookieAuth('access_token')
  @ApiBearerAuth()
  @ApiParam({ name: 'courseId', description: 'ID do curso', type: String })
  @ApiParam({ name: 'id', description: 'ID do módulo', type: String })
  @ApiOperation({ summary: 'Atualizar módulo' })
  @ApiResponse({ status: 200, description: 'Módulo atualizado.', type: ModuleResponseDto })
  async update(
    @Param('courseId') _courseId: string,
    @Param('id') id: string,
    @Body() dto: UpdateModuleDto,
    @Req() req: Request & { user: { id: string; role: string } },
  ) {
    const data = await this.service.update(id, dto, req.user.id, req.user.role);
    return { data };
  }

  @Delete('courses/:courseId/modules/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('instructor', 'admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiCookieAuth('access_token')
  @ApiBearerAuth()
  @ApiParam({ name: 'courseId', description: 'ID do curso', type: String })
  @ApiParam({ name: 'id', description: 'ID do módulo', type: String })
  @ApiOperation({ summary: 'Deletar módulo' })
  @ApiResponse({ status: 204, description: 'Módulo deletado.' })
  async delete(
    @Param('courseId') _courseId: string,
    @Param('id') id: string,
    @Req() req: Request & { user: { id: string; role: string } },
  ) {
    await this.service.delete(id, req.user.id, req.user.role);
  }

  @Put('courses/:courseId/modules/reorder')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('instructor', 'admin')
  @ApiCookieAuth('access_token')
  @ApiBearerAuth()
  @ApiParam({ name: 'courseId', description: 'ID do curso', type: String })
  @ApiOperation({ summary: 'Reordenar módulos de um curso' })
  @ApiResponse({ status: 200, description: 'Módulos reordenados.', type: ReorderResponseDto })
  @ApiResponse({ status: 422, description: 'IDs não correspondem ao conjunto atual de módulos.' })
  async reorder(
    @Param('courseId') courseId: string,
    @Body() dto: ReorderModulesDto,
    @Req() req: Request & { user: { id: string; role: string } },
  ) {
    const data = await this.service.reorder(courseId, dto.ids, req.user.id, req.user.role);
    return { data };
  }
}
