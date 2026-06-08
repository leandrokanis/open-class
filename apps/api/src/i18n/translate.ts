import { I18nContext } from 'nestjs-i18n';

/**
 * Resolves a translation key using the language of the current request
 * (negotiated via the `Accept-Language` header, falling back to pt-BR).
 *
 * Meant for use inside services/guards that run within a request context.
 * When no i18n context is active (e.g. plain unit tests), it returns the key
 * itself so that exception types — not message strings — drive assertions.
 */
export function t(key: string, args?: Record<string, unknown>): string {
  const ctx = I18nContext.current();
  return ctx ? ctx.t(key, args ? { args } : undefined) : key;
}
