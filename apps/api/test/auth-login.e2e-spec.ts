import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/filters/http-exception.filter';
import { cleanDb, closeDb, testDb } from './helpers/db';
import { users } from '@open-class/db';
import * as bcrypt from 'bcrypt';

describe('Auth login/me/logout (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
  });

  beforeEach(async () => {
    await cleanDb();
    const hash = await bcrypt.hash('password123', 10);
    await testDb.insert(users).values({
      name: 'Alice',
      email: 'alice@example.com',
      passwordHash: hash,
    });
    await testDb.insert(users).values({
      name: 'Inactive',
      email: 'inactive@example.com',
      passwordHash: hash,
      isActive: false,
    });
  });

  afterAll(async () => {
    await app.close();
    await closeDb();
  });

  describe('POST /auth/login', () => {
    it('200 — returns user and sets cookie', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'alice@example.com', password: 'password123' })
        .expect(200);

      expect(res.body.data).toMatchObject({ email: 'alice@example.com', role: 'aluno' });
      expect(res.headers['set-cookie'][0]).toContain('access_token');
    });

    it('401 — wrong password', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'alice@example.com', password: 'wrong' })
        .expect(401);
    });

    it('401 — unknown email', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'nobody@example.com', password: 'password123' })
        .expect(401);
    });

    it('403 — inactive account', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'inactive@example.com', password: 'password123' })
        .expect(403);
    });
  });

  describe('GET /auth/me', () => {
    it('200 — returns user when authenticated', async () => {
      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'alice@example.com', password: 'password123' });

      const cookie = loginRes.headers['set-cookie'][0];

      const res = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Cookie', cookie)
        .expect(200);

      expect(res.body.data.email).toBe('alice@example.com');
    });

    it('401 — no cookie', async () => {
      await request(app.getHttpServer()).get('/auth/me').expect(401);
    });
  });

  describe('POST /auth/logout', () => {
    it('204 — clears the cookie', async () => {
      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'alice@example.com', password: 'password123' });

      const cookie = loginRes.headers['set-cookie'][0];

      await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Cookie', cookie)
        .expect(204);
    });
  });
});
