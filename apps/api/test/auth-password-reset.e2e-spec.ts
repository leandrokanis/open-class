import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import * as request from 'supertest';
import * as crypto from 'crypto';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/filters/http-exception.filter';
import { cleanDb, closeDb, testDb } from './helpers/db';
import { users, passwordResetTokens } from '@open-class/db';
import * as bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';

describe('Auth password reset (e2e)', () => {
  let app: INestApplication;
  let userId: string;

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
    const hash = await bcrypt.hash('oldpassword', 10);
    const [user] = await testDb.insert(users).values({
      name: 'Bob',
      email: 'bob@example.com',
      passwordHash: hash,
    }).returning();
    userId = user.id;
  });

  afterAll(async () => {
    await app.close();
    await closeDb();
  });

  describe('POST /auth/forgot-password', () => {
    it('200 — always responds OK (existing email)', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({ email: 'bob@example.com' })
        .expect(200);

      expect(res.body.data.message).toBeTruthy();
    });

    it('200 — always responds OK (non-existing email, anti-enumeration)', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({ email: 'nobody@example.com' })
        .expect(200);

      expect(res.body.data.message).toBeTruthy();
    });

    it('creates a token record in DB for existing user', async () => {
      await request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({ email: 'bob@example.com' });

      const tokens = await testDb.query.passwordResetTokens.findMany({
        where: eq(passwordResetTokens.userId, userId),
      });
      expect(tokens).toHaveLength(1);
      expect(tokens[0].usedAt).toBeNull();
    });
  });

  describe('POST /auth/reset-password', () => {
    async function seedToken(offsetMs = 0) {
      const raw = 'valid-test-token-32-chars-exactly!!';
      const hash = crypto.createHash('sha256').update(raw).digest('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000 + offsetMs);
      await testDb.insert(passwordResetTokens).values({ userId, tokenHash: hash, expiresAt });
      return raw;
    }

    it('200 — resets password with valid token', async () => {
      const raw = await seedToken();

      await request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({ token: raw, password: 'newpassword123' })
        .expect(200);

      const user = await testDb.query.users.findFirst({ where: eq(users.id, userId) });
      expect(user?.passwordHash).not.toBeNull();
      const valid = await bcrypt.compare('newpassword123', user!.passwordHash!);
      expect(valid).toBe(true);
    });

    it('400 — expired token', async () => {
      const raw = 'expired-test-token-32-chars-exact!';
      const hash = crypto.createHash('sha256').update(raw).digest('hex');
      const expiresAt = new Date(Date.now() - 1000);
      await testDb.insert(passwordResetTokens).values({ userId, tokenHash: hash, expiresAt });

      await request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({ token: raw, password: 'newpassword123' })
        .expect(400);
    });

    it('400 — already used token', async () => {
      const raw = await seedToken();
      await request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({ token: raw, password: 'newpassword123' });

      await request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({ token: raw, password: 'anotherpassword' })
        .expect(400);
    });

    it('400 — invalid token', async () => {
      await request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({ token: 'totally-invalid-token', password: 'newpassword123' })
        .expect(400);
    });
  });
});
