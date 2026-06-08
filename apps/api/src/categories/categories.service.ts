import {
  Injectable, NotFoundException, ConflictException,
} from '@nestjs/common';
import slugify from 'slugify';
import { CategoriesRepository } from './categories.repository';
import { t } from '../i18n/translate';
import type { CreateCategoryDto } from './dto/create-category.dto';
import type { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly repo: CategoriesRepository) {}

  private async generateSlug(name: string): Promise<string> {
    const base = slugify(name, { lower: true, strict: true });
    let slug = base;
    let suffix = 1;
    while (await this.repo.slugExists(slug)) {
      slug = `${base}-${suffix++}`;
    }
    return slug;
  }

  async findAll(page: number, limit: number) {
    return this.repo.findAll(page, limit);
  }

  async findOne(id: string) {
    const category = await this.repo.findById(id);
    if (!category) throw new NotFoundException(t('categories.not_found'));
    return category;
  }

  async create(dto: CreateCategoryDto) {
    const existing = await this.repo.findByName(dto.name);
    if (existing) throw new ConflictException(t('categories.name_taken'));

    const slug = await this.generateSlug(dto.name);
    const position = (await this.repo.maxPosition()) + 1;

    return this.repo.create({ name: dto.name, slug, description: dto.description, iconUrl: dto.iconUrl, position });
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const category = await this.repo.findById(id);
    if (!category) throw new NotFoundException(t('categories.not_found'));

    const data: Record<string, unknown> = {};

    if (dto.name !== undefined && dto.name !== category.name) {
      const existing = await this.repo.findByName(dto.name);
      if (existing) throw new ConflictException(t('categories.name_taken'));
      data.name = dto.name;
      data.slug = await this.generateSlug(dto.name);
    }
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.iconUrl !== undefined) data.iconUrl = dto.iconUrl;

    return this.repo.update(id, data);
  }

  async remove(id: string) {
    const category = await this.repo.findById(id);
    if (!category) throw new NotFoundException(t('categories.not_found'));

    const linked = await this.repo.countLinkedCourses(id);
    if (linked > 0) {
      throw new ConflictException(t('categories.has_linked_courses', { count: linked }));
    }

    await this.repo.delete(id);
  }

  async reorder(ids: string[]) {
    return this.repo.reorder(ids);
  }
}
