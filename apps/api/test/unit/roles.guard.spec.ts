import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { ExecutionContext } from '@nestjs/common';
import { RolesGuard } from '../../src/common/guards/roles.guard';
import { Role } from '../../src/common/enums/role.enum';

describe('RolesGuard', () => {
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
  });

  it('permite acesso quando não há @Roles() definido na rota', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    const guard = new RolesGuard(reflector);

    const ctx = {
      getHandler: vi.fn(),
      getClass: vi.fn(),
      switchToHttp: vi.fn().mockReturnValue({ getRequest: vi.fn().mockReturnValue({ user: { role: Role.Aluno } }) }),
    } as unknown as ExecutionContext;

    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('permite acesso quando @Roles([]) está vazio', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue([]);
    const guard = new RolesGuard(reflector);

    const ctx = {
      getHandler: vi.fn(),
      getClass: vi.fn(),
      switchToHttp: vi.fn().mockReturnValue({ getRequest: vi.fn().mockReturnValue({ user: { role: Role.Aluno } }) }),
    } as unknown as ExecutionContext;

    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('permite acesso quando user.role está na lista de papéis exigidos', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.Admin]);
    const guard = new RolesGuard(reflector);

    const ctx = {
      getHandler: vi.fn(),
      getClass: vi.fn(),
      switchToHttp: vi.fn().mockReturnValue({ getRequest: vi.fn().mockReturnValue({ user: { role: Role.Admin } }) }),
    } as unknown as ExecutionContext;

    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('lança ForbiddenException quando user.role não está na lista de papéis exigidos', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.Admin]);
    const guard = new RolesGuard(reflector);

    const ctx = {
      getHandler: vi.fn(),
      getClass: vi.fn(),
      switchToHttp: vi.fn().mockReturnValue({ getRequest: vi.fn().mockReturnValue({ user: { role: Role.Aluno } }) }),
    } as unknown as ExecutionContext;

    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('permite acesso quando user.role está em lista com múltiplos papéis', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.Admin, Role.Instrutor]);
    const guard = new RolesGuard(reflector);

    const ctx = {
      getHandler: vi.fn(),
      getClass: vi.fn(),
      switchToHttp: vi.fn().mockReturnValue({ getRequest: vi.fn().mockReturnValue({ user: { role: Role.Instrutor } }) }),
    } as unknown as ExecutionContext;

    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('lança ForbiddenException quando user.role não está em lista com múltiplos papéis', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.Admin, Role.Instrutor]);
    const guard = new RolesGuard(reflector);

    const ctx = {
      getHandler: vi.fn(),
      getClass: vi.fn(),
      switchToHttp: vi.fn().mockReturnValue({ getRequest: vi.fn().mockReturnValue({ user: { role: Role.Aluno } }) }),
    } as unknown as ExecutionContext;

    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('lança ForbiddenException quando user é undefined no request', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.Admin]);
    const guard = new RolesGuard(reflector);

    const ctx = {
      getHandler: vi.fn(),
      getClass: vi.fn(),
      switchToHttp: vi.fn().mockReturnValue({ getRequest: vi.fn().mockReturnValue({ user: undefined }) }),
    } as unknown as ExecutionContext;

    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });
});
