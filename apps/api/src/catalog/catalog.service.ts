import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CatalogRepository } from './catalog.repository';
import { t } from '../i18n/translate';
import type { ListCatalogDto } from './dto/list-catalog.dto';
import type {
  CatalogListItemDto,
  CatalogPageDto,
  CatalogPageMetaDto,
} from './dto/catalog-list-item.dto';
import type { CatalogDetailDto } from './dto/catalog-detail.dto';
import type { CategoryItemDto } from './dto/category-item.dto';
import type { CatalogStatsDto } from './dto/catalog-stats.dto';

interface CursorPayload {
  createdAt: string;
  id: string;
}

function encodeCursor(createdAt: Date, id: string): string {
  const payload: CursorPayload = { createdAt: createdAt.toISOString(), id };
  return Buffer.from(JSON.stringify(payload)).toString('base64url');
}

function decodeCursor(raw: string): { createdAt: Date; id: string } {
  try {
    const json = Buffer.from(raw, 'base64url').toString('utf8');
    const { createdAt, id } = JSON.parse(json) as CursorPayload;
    if (!createdAt || !id || typeof createdAt !== 'string' || typeof id !== 'string') {
      throw new Error('invalid fields');
    }
    const date = new Date(createdAt);
    if (Number.isNaN(date.getTime())) throw new Error('invalid date');
    return { createdAt: date, id };
  } catch {
    throw new BadRequestException(t('catalog.invalid_cursor'));
  }
}

@Injectable()
export class CatalogService {
  constructor(private readonly repo: CatalogRepository) {}

  async listPublished(dto: ListCatalogDto): Promise<CatalogPageDto> {
    const limit = Math.min(100, Math.max(1, dto.limit ?? 20));

    let cursor: { createdAt: Date; id: string } | undefined;
    if (dto.cursor) {
      cursor = decodeCursor(dto.cursor);
    }

    const q = dto.q?.trim() || undefined;

    const { rows, hasMore } = await this.repo.findPublished({
      categoryId: dto.categoryId,
      level: dto.level,
      q,
      cursor,
      limit,
    });

    const lastRow = rows[rows.length - 1];
    const nextCursor = hasMore && lastRow ? encodeCursor(lastRow.createdAt, lastRow.id) : null;

    const meta: CatalogPageMetaDto = { nextCursor, hasMore, limit };
    const data: CatalogListItemDto[] = rows.map((r) => ({
      id: r.id,
      title: r.title,
      slug: r.slug,
      shortDescription: r.shortDescription,
      level: r.level,
      thumbnailUrl: r.thumbnailUrl,
      rating: r.rating,
      reviewCount: r.reviewCount,
      lessonCount: r.lessonCount,
      totalDurationMinutes: r.totalDurationMinutes,
      category: r.category,
      instructor: r.instructor,
      createdAt: r.createdAt,
    }));

    return { data, meta };
  }

  async getBySlug(slug: string, requesterId?: string, requesterRole?: string): Promise<CatalogDetailDto> {
    const allowDraft = !!requesterId;
    const course = await this.repo.findBySlug(slug, allowDraft);

    if (!course) throw new NotFoundException(t('courses.not_found'));

    const isOwner = course.instructor?.id === requesterId;
    const isAdmin = requesterRole === 'admin';
    if (course.status !== 'published' && !isOwner && !isAdmin) {
      throw new NotFoundException(t('courses.not_found'));
    }

    // Aulas exclusivas de turma: visíveis só para o aluno de alguma turma ativa da
    // aula (US-25 many-to-many). Dono/admin vê todas; de fora não vê nenhuma.
    let visibleCohortId: string | null = null;
    if (!isOwner && !isAdmin && requesterId) {
      const myCohort = await this.repo.findStudentCohortForCourse(requesterId, course.id);
      if (myCohort && !myCohort.closed) visibleCohortId = myCohort.cohortId;
    }
    const allLessonIds = (course.modules ?? []).flatMap((m) => (m.lessons ?? []).map((l) => l.id));
    const cohortMap = await this.repo.findLessonCohortIds(allLessonIds);
    const canSeeExclusive = (lessonCohortIds: string[]) =>
      lessonCohortIds.length === 0 || isOwner || isAdmin
      || (visibleCohortId !== null && lessonCohortIds.includes(visibleCohortId));

    const detail: CatalogDetailDto = {
      id: course.id,
      title: course.title,
      slug: course.slug,
      shortDescription: course.shortDescription ?? null,
      description: course.description ?? null,
      level: course.level ?? null,
      accessMode: course.accessMode,
      thumbnailUrl: course.thumbnailUrl ?? null,
      category: course.category
        ? { id: course.category.id, name: course.category.name, slug: course.category.slug }
        : null,
      instructor: { name: course.instructor?.name ?? '', avatarUrl: course.instructor?.avatarUrl ?? null },
      modules: (course.modules ?? []).map((m) => ({
        id: m.id,
        title: m.title,
        description: m.description ?? null,
        order: m.position,
        lessons: (m.lessons ?? [])
          .filter((l) => canSeeExclusive(cohortMap[l.id] ?? []))
          .map((l) => ({
            id: l.id,
            title: l.title,
            contentType: l.contentType,
            duration: l.duration ?? null,
            order: l.position,
            isExtra: l.isExtra,
            cohortIds: cohortMap[l.id] ?? [],
          })),
      })),
      createdAt: course.createdAt,
    };

    return detail;
  }

  async getStats(): Promise<CatalogStatsDto> {
    return this.repo.getStats();
  }

  async listCategories(): Promise<CategoryItemDto[]> {
    const rows = await this.repo.findCategories();
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      description: r.description ?? null,
      iconUrl: r.iconUrl ?? null,
    }));
  }
}
