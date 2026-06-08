import { describe, it, expect, beforeAll } from 'vitest';
import { Test } from '@nestjs/testing';
import { join } from 'path';
import {
  I18nModule,
  I18nService,
  I18nValidationPipe,
  I18nValidationException,
  AcceptLanguageResolver,
} from 'nestjs-i18n';
import { formatI18nErrors } from 'nestjs-i18n/dist/utils';
import type { ValidationError } from 'class-validator';
import { RegisterDto } from '../auth/dto/register.dto';

const messagesFor = (errors: ValidationError[]): string[] =>
  errors.flatMap((e) => Object.values(e.constraints ?? {}));

describe('DTO validation i18n', () => {
  let i18n: I18nService;
  const pipe = new I18nValidationPipe();
  const meta = { type: 'body' as const, metatype: RegisterDto, data: '' };
  const invalid = { name: 'A', email: 'not-an-email', password: '123' };

  const translatedMessages = async (lang: string): Promise<string[]> => {
    try {
      await pipe.transform(invalid, meta);
      throw new Error('expected validation to fail');
    } catch (err) {
      if (!(err instanceof I18nValidationException)) throw err;
      const translated = formatI18nErrors(err.errors ?? [], i18n, { lang });
      return messagesFor(translated);
    }
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        I18nModule.forRoot({
          fallbackLanguage: 'pt-BR',
          loaderOptions: { path: join(__dirname, 'i18n') },
          resolvers: [AcceptLanguageResolver],
        }),
      ],
    }).compile();
    i18n = moduleRef.get(I18nService);
  });

  it('translates validation messages to en', async () => {
    const messages = await translatedMessages('en');
    expect(messages).toContain('Invalid email');
    expect(messages.some((m) => m.includes('at least 8 characters'))).toBe(true);
  });

  it('translates validation messages to pt-BR by default', async () => {
    const messages = await translatedMessages('pt-BR');
    expect(messages).toContain('E-mail inválido');
    expect(messages.some((m) => m.includes('no mínimo 8 caracteres'))).toBe(true);
  });
});
