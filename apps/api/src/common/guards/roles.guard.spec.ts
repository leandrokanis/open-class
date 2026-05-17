import { describe, it, expect, vi } from 'vitest';
import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';

const makeContext = (role: string | undefined, handlerRoles?: string[], classRoles?: string[]) => {
  const reflector = new Reflector();
  vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(handlerRoles ?? classRoles ?? null);

  const guard = new RolesGuard(reflector);

  const ctx = {
    getHandler: vi.fn(),
    getClass: vi.fn(),
    switchToHttp: vi.fn().mockReturnValue({
      getRequest: vi.fn().mockReturnValue({ user: role ? { role } : undefined }),
    }),
  } as never;

  return { guard, ctx };
};

describe('RolesGuard', () => {
  it('allows access when no @Roles decorator is set', () => {
    const { guard, ctx } = makeContext(undefined);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('allows access when user role matches required role', () => {
    const { guard, ctx } = makeContext('admin', ['admin']);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('allows access when user has one of multiple required roles', () => {
    const { guard, ctx } = makeContext('instrutor', ['instrutor', 'admin']);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('throws ForbiddenException when role does not match', () => {
    const { guard, ctx } = makeContext('aluno', ['admin']);
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('throws ForbiddenException when user is not authenticated', () => {
    const { guard, ctx } = makeContext(undefined, ['admin']);
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });
});
