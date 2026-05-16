import { Injectable, NotImplementedException } from '@nestjs/common';

@Injectable()
export class EnrollmentsService {
  enroll(_studentId: string, _courseId: string) {
    throw new NotImplementedException('EnrollmentsModule: CRUD completo será implementado na Fase 3 do roadmap');
  }

  findByStudent(_studentId: string) {
    throw new NotImplementedException('EnrollmentsModule: CRUD completo será implementado na Fase 3 do roadmap');
  }

  findAll() {
    throw new NotImplementedException('EnrollmentsModule: CRUD completo será implementado na Fase 3 do roadmap');
  }
}
