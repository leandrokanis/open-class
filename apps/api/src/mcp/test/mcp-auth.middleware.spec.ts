import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMcpAuthMiddleware } from '../mcp-auth.middleware';

describe('createMcpAuthMiddleware', () => {
  const token = 'secret-token';
  let next: ReturnType<typeof vi.fn>;
  let res: { status: ReturnType<typeof vi.fn>; json: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    next = vi.fn();
    const json = vi.fn();
    res = { status: vi.fn().mockReturnValue({ json }), json };
  });

  it('should call next() when Authorization header matches token', () => {
    const middleware = createMcpAuthMiddleware(token);
    const req = { headers: { authorization: `Bearer ${token}` } } as any;

    middleware(req, res as any, next);

    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should return 401 when Authorization header is missing', () => {
    const middleware = createMcpAuthMiddleware(token);
    const req = { headers: {} } as any;

    middleware(req, res as any, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 when token is incorrect', () => {
    const middleware = createMcpAuthMiddleware(token);
    const req = { headers: { authorization: 'Bearer wrong-token' } } as any;

    middleware(req, res as any, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});
