import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/filters/http-exception.filter';
import { cleanDb, closeDb } from './helpers/db';

describe('POST /auth/register (e2e)', () => {
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
  });

  afterAll(async () => {
    await app.close();
    await closeDb();
  });

  it('201 — registers a new user and sets access_token cookie', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ name: 'Test User', email: 'test@example.com', password: 'password123' })
      .expect(201);

    expect(res.body.data).toMatchObject({
      name: 'Test User',
      email: 'test@example.com',
      role: 'aluno',
    });
    expect(res.headers['set-cookie']).toBeDefined();
    expect(res.headers['set-cookie'][0]).toContain('access_token');
    expect(res.headers['set-cookie'][0]).toContain('HttpOnly');
  });

  it('409 — rejects duplicate email', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ name: 'Test User', email: 'dup@example.com', password: 'password123' })
      .expect(201);

    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ name: 'Other User', email: 'dup@example.com', password: 'password456' })
      .expect(409);

    expect(res.body.error).toContain('E-mail');
  });

  it('400 — rejects missing name', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'x@example.com', password: 'password123' })
      .expect(400);
  });

  it('400 — rejects short password', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ name: 'Test', email: 'x@example.com', password: 'short' })
      .expect(400);
  });

  it('400 — rejects invalid email', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ name: 'Test', email: 'not-an-email', password: 'password123' })
      .expect(400);
  });
});
