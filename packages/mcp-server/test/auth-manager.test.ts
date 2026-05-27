import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';

vi.mock('axios');
const mockedAxios = vi.mocked(axios);

import { AuthManager } from '../src/auth-manager';

describe('AuthManager', () => {
  let manager: AuthManager;

  beforeEach(() => {
    vi.clearAllMocks();
    manager = new AuthManager({
      apiUrl: 'http://localhost:3000',
      email: 'admin@test.com',
      password: 'secret',
    });
  });

  it('efetua login e retorna token no primeiro getToken()', async () => {
    // Arrange
    mockedAxios.post = vi.fn().mockResolvedValue({
      data: { data: { access_token: 'jwt-abc' } },
    });

    // Act
    const token = await manager.getToken();

    // Assert
    expect(token).toBe('jwt-abc');
    expect(mockedAxios.post).toHaveBeenCalledWith(
      'http://localhost:3000/api/auth/login',
      { email: 'admin@test.com', password: 'secret' },
    );
  });

  it('retorna token cacheado sem fazer novo login', async () => {
    // Arrange
    mockedAxios.post = vi.fn().mockResolvedValue({
      data: { data: { access_token: 'jwt-abc' } },
    });
    await manager.getToken();

    // Act
    const token = await manager.getToken();

    // Assert
    expect(token).toBe('jwt-abc');
    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
  });

  it('renova token quando invalidateToken() é chamado', async () => {
    // Arrange
    mockedAxios.post = vi.fn()
      .mockResolvedValueOnce({ data: { data: { access_token: 'jwt-old' } } })
      .mockResolvedValueOnce({ data: { data: { access_token: 'jwt-new' } } });
    await manager.getToken();

    // Act
    manager.invalidateToken();
    const token = await manager.getToken();

    // Assert
    expect(token).toBe('jwt-new');
    expect(mockedAxios.post).toHaveBeenCalledTimes(2);
  });

  it('lança erro claro quando credenciais são inválidas', async () => {
    // Arrange
    mockedAxios.post = vi.fn().mockRejectedValue({ response: { status: 401 } });

    // Act & Assert
    await expect(manager.getToken()).rejects.toThrow(
      'MCP Server: falha ao autenticar na API Open Class',
    );
  });
});
