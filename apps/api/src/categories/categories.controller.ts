import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
  UseGuards, HttpCode, HttpStatus, ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse, ApiCookieAuth, ApiBearerAuth,
  ApiParam, ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles, Role } from '../common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ReorderCategoriesDto } from './dto/reorder-categories.dto';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar categorias ordenadas por posição' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 50 })
  @ApiResponse({ status: 200, description: 'Lista paginada de categorias.' })
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '50',
  ) {
    const p = Math.max(1, Number(page));
    const l = Math.min(200, Math.max(1, Number(limit)));
    const { rows, total } = await this.categoriesService.findAll(p, l);
    return { data: rows, meta: { page: p, limit: l, total } };
  }

  @Post()
  @ApiCookieAuth('access_token')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Criar nova categoria (admin)' })
  @ApiResponse({ status: 201, description: 'Categoria criada.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({ status: 403, description: 'Papel insuficiente.' })
  @ApiResponse({ status: 409, description: 'Nome já existe.' })
  async create(@Body() dto: CreateCategoryDto) {
    return { data: await this.categoriesService.create(dto) };
  }

  @Patch('reorder')
  @ApiCookieAuth('access_token')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Reordenar categorias (admin)' })
  @ApiResponse({ status: 200, description: 'Categorias reordenadas.' })
  @ApiResponse({ status: 400, description: 'IDs inválidos.' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({ status: 403, description: 'Papel insuficiente.' })
  async reorder(@Body() dto: ReorderCategoriesDto) {
    return { data: await this.categoriesService.reorder(dto.ids) };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar categoria por ID' })
  @ApiParam({ name: 'id', description: 'UUID da categoria', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Categoria encontrada.' })
  @ApiResponse({ status: 404, description: 'Categoria não encontrada.' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return { data: await this.categoriesService.findOne(id) };
  }

  @Patch(':id')
  @ApiCookieAuth('access_token')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Atualizar categoria (admin)' })
  @ApiParam({ name: 'id', description: 'UUID da categoria', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Categoria atualizada.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({ status: 403, description: 'Papel insuficiente.' })
  @ApiResponse({ status: 404, description: 'Categoria não encontrada.' })
  @ApiResponse({ status: 409, description: 'Nome já existe.' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return { data: await this.categoriesService.update(id, dto) };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiCookieAuth('access_token')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Excluir categoria (admin)' })
  @ApiParam({ name: 'id', description: 'UUID da categoria', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Categoria excluída.' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({ status: 403, description: 'Papel insuficiente.' })
  @ApiResponse({ status: 404, description: 'Categoria não encontrada.' })
  @ApiResponse({ status: 409, description: 'Cursos vinculados à categoria.' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.categoriesService.remove(id);
  }
}
