import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMcpAuthMiddleware } from '../mcp-auth.middleware';

const makeRes = () => {
  const json = vi.fn();
  return { status: vi.fn().mockReturnValue({ json }), json };
};

const makeOAuthService = (valid: boolean) => ({
  validateAccessToken: vi.fn().mockResolvedValue(valid),
});

describe('createMcpAuthMiddleware', () => {
  const staticToken = 'secret-token';
  let next: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    next = vi.fn();
  });

  // ─── backward compat: static token ───────────────────────────────────────

  it('should call next() when Authorization header matches static token', async () => {
    const middleware = createMcpAuthMiddleware(staticToken, makeOAuthService(false) as any);
    const req = { headers: { authorization: `Bearer ${staticToken}` } } as any;
    const res = makeRes();

    await middleware(req, res as any, next);

    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should return 401 when Authorization header is missing', async () => {
    const middleware = createMcpAuthMiddleware(staticToken, makeOAuthService(false) as any);
    const req = { headers: {} } as any;
    const res = makeRes();

    await middleware(req, res as any, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 when token does not match static token and is not a valid OAuth token', async () => {
    const middleware = createMcpAuthMiddleware(staticToken, makeOAuthService(false) as any);
    const req = { headers: { authorization: 'Bearer wrong-token' } } as any;
    const res = makeRes();

    await middleware(req, res as any, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  // ─── OAuth token ──────────────────────────────────────────────────────────

  it('should call next() when bearer token is a valid OAuth access token', async () => {
    const oauthService = makeOAuthService(true);
    const middleware = createMcpAuthMiddleware(undefined, oauthService as any);
    const req = { headers: { authorization: 'Bearer oauth-token-uuid' } } as any;
    const res = makeRes();

    await middleware(req, res as any, next);

    expect(oauthService.validateAccessToken).toHaveBeenCalledWith('oauth-token-uuid');
    expect(next).toHaveBeenCalledOnce();
  });

  it('should return 401 when no static token configured and OAuth token is invalid', async () => {
    const oauthService = makeOAuthService(false);
    const middleware = createMcpAuthMiddleware(undefined, oauthService as any);
    const req = { headers: { authorization: 'Bearer bad-token' } } as any;
    const res = makeRes();

    await middleware(req, res as any, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('should not call OAuth service when static token matches', async () => {
    const oauthService = makeOAuthService(true);
    const middleware = createMcpAuthMiddleware(staticToken, oauthService as any);
    const req = { headers: { authorization: `Bearer ${staticToken}` } } as any;
    const res = makeRes();

    await middleware(req, res as any, next);

    expect(oauthService.validateAccessToken).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledOnce();
  });

  it('should fall through to OAuth check when static token configured but does not match', async () => {
    const oauthService = makeOAuthService(true);
    const middleware = createMcpAuthMiddleware(staticToken, oauthService as any);
    const req = { headers: { authorization: 'Bearer different-oauth-token' } } as any;
    const res = makeRes();

    await middleware(req, res as any, next);

    expect(oauthService.validateAccessToken).toHaveBeenCalledWith('different-oauth-token');
    expect(next).toHaveBeenCalledOnce();
  });
});
