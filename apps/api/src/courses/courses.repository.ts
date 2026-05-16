import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { courses } from '@open-class/db';
import type { Db } from '../db';

@Injectable()
export class CoursesRepository {
  constructor(@Inject('DATABASE') private readonly db: Db) {}

  findById(id: string) {
    return this.db.query.courses.findFirst({ where: eq(courses.id, id) });
  }
}
