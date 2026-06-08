import { describe, it, expect, beforeAll } from 'vitest';
import { Test } from '@nestjs/testing';
import { join } from 'path';
import { I18nModule, I18nService, AcceptLanguageResolver } from 'nestjs-i18n';

describe('i18n catalogs', () => {
  let i18n: I18nService;

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

  it('resolves a message in pt-BR', () => {
    expect(i18n.translate('auth.email_taken', { lang: 'pt-BR' })).toBe('E-mail já cadastrado');
  });

  it('resolves the same message in en', () => {
    expect(i18n.translate('auth.email_taken', { lang: 'en' })).toBe('Email already registered');
  });

  it('falls back to pt-BR for an unsupported language', () => {
    expect(i18n.translate('auth.email_taken', { lang: 'fr' })).toBe('E-mail já cadastrado');
  });

  it('interpolates arguments', () => {
    expect(
      i18n.translate('categories.has_linked_courses', { lang: 'en', args: { count: 3 } }),
    ).toBe('Cannot delete: 3 course(s) reference this category');
  });

  it('keeps pt-BR and en catalogs with matching keys', () => {
    const namespaces = [
      'auth',
      'courses',
      'modules',
      'lessons',
      'enrollments',
      'progress',
      'users',
      'categories',
      'catalog',
      'youtube',
      'validation',
      'mail',
    ];
    for (const ns of namespaces) {
      const pt = i18n.translate(`${ns}`, { lang: 'pt-BR' }) as unknown as Record<string, string>;
      const en = i18n.translate(`${ns}`, { lang: 'en' }) as unknown as Record<string, string>;
      expect(Object.keys(pt).sort()).toEqual(Object.keys(en).sort());
    }
  });
});
