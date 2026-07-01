import { NestFactory } from '@nestjs/core';
import { RequestMethod } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { I18nValidationPipe } from 'nestjs-i18n';
import helmet from 'helmet';
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
  // Security headers. CSP is disabled so the Swagger UI (/docs) and the
  // static uploads (/uploads) keep working — see ADR-023.
  app.use(helmet({ contentSecurityPolicy: false }));
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
    new I18nValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
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
      '**Idioma (i18n)**: mensagens de erro, validação e e-mails respeitam o cabeçalho ' +
      '`Accept-Language`. Idiomas suportados: `pt-BR` (padrão) e `en`. Qualquer outro valor ' +
      'recai para `pt-BR`.\n\n' +
      '**Esquemas disponíveis**: cursos, módulos, aulas, matrículas, categorias, progresso de aulas, configurações da plataforma.',
    )
    .setVersion('0.3.0')
    .addGlobalParameters({
      name: 'Accept-Language',
      in: 'header',
      required: false,
      description: 'Idioma das mensagens: `pt-BR` (padrão) ou `en`',
      schema: { type: 'string', enum: ['pt-BR', 'en'], default: 'pt-BR' },
    })
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
