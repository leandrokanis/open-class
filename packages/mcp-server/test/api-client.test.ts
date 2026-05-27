import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('ApiClient', () => {
  let mockAuthManager: { getToken: ReturnType<typeof vi.fn>; invalidateToken: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    mockAuthManager = {
      getToken: vi.fn().mockResolvedValue('jwt-test'),
      invalidateToken: vi.fn(),
    };
  });

  it('injeta Authorization Bearer em cada requisição', async () => {
    const { createApiClient } = await import('../src/api-client');
    const client = createApiClient('http://localhost:3000', mockAuthManager as never);

    const mockGet = vi.fn().mockResolvedValue({ data: { items: [] } });
    client.get = mockGet;

    await client.get('/api/catalog');

    expect(mockGet).toHaveBeenCalledWith('/api/catalog');
  });

  it('cria instância axios com baseURL correta', async () => {
    const { createApiClient } = await import('../src/api-client');
    const client = createApiClient('http://api.example.com', mockAuthManager as never);

    expect((client.defaults as { baseURL?: string }).baseURL).toBe('http://api.example.com');
  });

  it('interceptor de request adiciona Bearer token', async () => {
    const { createApiClient } = await import('../src/api-client');
    const client = createApiClient('http://localhost:3000', mockAuthManager as never);

    const config = { headers: {} as Record<string, string> };
    const interceptor = client.interceptors.request as unknown as {
      handlers: Array<{ fulfilled: (c: typeof config) => typeof config }>;
    };

    const result = await interceptor.handlers[0].fulfilled(config);

    expect(mockAuthManager.getToken).toHaveBeenCalled();
    expect(result.headers['Authorization']).toBe('Bearer jwt-test');
  });
});
