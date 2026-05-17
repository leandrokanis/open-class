import { Controller, Get, Param, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import {
  ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags,
} from '@nestjs/swagger';
import { CatalogService } from './catalog.service';
import { ListCatalogDto } from './dto/list-catalog.dto';
import { CatalogPageDto } from './dto/catalog-list-item.dto';
import { CatalogDetailResponseDto } from './dto/catalog-detail.dto';
import { CategoriesResponseDto } from './dto/category-item.dto';

@ApiTags('catalog')
@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get()
  @ApiOperation({ summary: 'Listar cursos publicados com filtros e paginação por cursor' })
  @ApiQuery({ name: 'categoryId', required: false, description: 'UUID da categoria' })
  @ApiQuery({ name: 'level', required: false, enum: ['beginner', 'intermediate', 'advanced'] })
  @ApiQuery({ name: 'q', required: false, description: 'Busca por título ou descrição curta' })
  @ApiQuery({ name: 'cursor', required: false, description: 'Cursor opaco da página anterior' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Itens por página (1–100)' })
  @ApiResponse({ status: 200, description: 'Lista paginada de cursos.', type: CatalogPageDto })
  @ApiResponse({ status: 400, description: 'Cursor ou parâmetro inválido.' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async listCourses(@Query() dto: ListCatalogDto): Promise<CatalogPageDto> {
    return this.catalogService.listPublished(dto);
  }

  // IMPORTANT: /categories must be declared before /:slug to avoid route shadowing
  @Get('categories')
  @ApiOperation({ summary: 'Listar categorias disponíveis' })
  @ApiResponse({ status: 200, description: 'Lista de categorias.', type: CategoriesResponseDto })
  async listCategories(): Promise<CategoriesResponseDto> {
    const data = await this.catalogService.listCategories();
    return { data };
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Detalhes de um curso publicado com currículo expandido' })
  @ApiParam({ name: 'slug', description: 'Slug do curso' })
  @ApiResponse({ status: 200, description: 'Dados completos do curso.', type: CatalogDetailResponseDto })
  @ApiResponse({ status: 404, description: 'Curso não encontrado.' })
  async getCourse(@Param('slug') slug: string): Promise<CatalogDetailResponseDto> {
    const data = await this.catalogService.getBySlug(slug);
    return { data };
  }
}
