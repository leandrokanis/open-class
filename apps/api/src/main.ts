import { NestFactory } from '@nestjs/core';
import { ValidationPipe, RequestMethod } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { runMigrations } from '@open-class/db';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './filters/http-exception.filter';

async function bootstrap() {
  await runMigrations();

  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api', {
    exclude: [
      { path: '.well-known/oauth-authorization-server', method: RequestMethod.GET },
      { path: 'oauth/register', method: RequestMethod.POST },
      { path: 'oauth/authorize', method: RequestMethod.GET },
      { path: 'oauth/authorize', method: RequestMethod.POST },
      { path: 'oauth/token', method: RequestMethod.POST },
    ],
  });
  app.use(cookieParser());

  const allowedOrigins = (process.env.FRONTEND_URL ?? 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim());

  const oauthPaths = ['/oauth/', '/.well-known/'];

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
  });

  // OAuth endpoints must be reachable from any origin (claude.ai, other MCP clients)
  const rawApp = app.getHttpAdapter().getInstance();
  for (const path of oauthPaths) {
    rawApp.use(path, (_req: any, res: any, next: any) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      if (_req.method === 'OPTIONS') { res.sendStatus(204); return; }
      next();
    });
  }

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('Open Class API')
    .setDescription(
      'API da plataforma Open Class — cursos online open source e self-hosted.\n\n' +
      '**Autenticação**: use o cookie `access_token` (setado automaticamente no login) ' +
      'ou envie o JWT no header `Authorization: Bearer <token>`.\n\n' +
      '**Papéis (RBAC)**:\n' +
      '- `aluno` — pode se matricular e acessar conteúdo próprio\n' +
      '- `instrutor` — pode criar e editar seus cursos\n' +
      '- `admin` — acesso total (usuários, cursos, matrículas)\n\n' +
      'Rotas protegidas retornam `401` quando não autenticado e `403` quando o papel é insuficiente.\n\n' +
      '**Esquemas disponíveis**: cursos, módulos, aulas, matrículas, categorias, progresso de aulas, configurações da plataforma.',
    )
    .setVersion('0.3.0')
    .addCookieAuth('access_token')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  await app.listen(process.env.PORT ?? 3001);
}

void bootstrap();
