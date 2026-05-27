import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { AxiosInstance } from 'axios';

describe('registerEnrollTool', () => {
  let mockApiClient: {
    get: ReturnType<typeof vi.fn>;
    post: ReturnType<typeof vi.fn>;
  };
  let mockServer: { tool: ReturnType<typeof vi.fn> };
  let toolHandler: (args: { userEmail: string; courseId: string }) => Promise<unknown>;

  beforeEach(async () => {
    vi.resetModules();
    mockApiClient = { get: vi.fn(), post: vi.fn() };
    mockServer = {
      tool: vi.fn().mockImplementation((_name, _desc, _schema, handler) => {
        toolHandler = handler;
      }),
    };

    const { registerEnrollTool } = await import('../../src/tools/enroll');
    registerEnrollTool(mockServer as never, mockApiClient as unknown as AxiosInstance);
  });

  it('registra tool com nome "enroll_user"', () => {
    expect(mockServer.tool).toHaveBeenCalledWith(
      'enroll_user',
      expect.any(String),
      expect.any(Object),
      expect.any(Function),
    );
  });

  it('matricula usuário com sucesso no caminho feliz', async () => {
    // Arrange
    mockApiClient.get.mockResolvedValue({
      data: [{ id: 'user-123', email: 'aluno@test.com' }],
    });
    mockApiClient.post.mockResolvedValue({
      data: { id: 'enroll-456', status: 'active' },
    });

    // Act
    const result = await toolHandler({ userEmail: 'aluno@test.com', courseId: 'course-789' }) as {
      content: Array<{ type: string; text: string }>;
    };

    // Assert
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.enrollmentId).toBe('enroll-456');
    expect(parsed.status).toBe('active');
  });

  it('lança McpError user_not_found quando usuário não existe', async () => {
    // Arrange
    mockApiClient.get.mockResolvedValue({ data: [] });

    // Act & Assert
    await expect(
      toolHandler({ userEmail: 'naoexiste@test.com', courseId: 'course-789' }),
    ).rejects.toThrow('user_not_found');
  });

  it('lança McpError already_enrolled quando API retorna 409', async () => {
    // Arrange
    mockApiClient.get.mockResolvedValue({
      data: [{ id: 'user-123', email: 'aluno@test.com' }],
    });
    mockApiClient.post.mockRejectedValue({
      response: { status: 409 },
    });

    // Act & Assert
    await expect(
      toolHandler({ userEmail: 'aluno@test.com', courseId: 'course-789' }),
    ).rejects.toThrow('already_enrolled');
  });

  it('lança McpError course_not_found quando API retorna 404', async () => {
    // Arrange
    mockApiClient.get.mockResolvedValue({
      data: [{ id: 'user-123', email: 'aluno@test.com' }],
    });
    mockApiClient.post.mockRejectedValue({
      response: { status: 404 },
    });

    // Act & Assert
    await expect(
      toolHandler({ userEmail: 'aluno@test.com', courseId: 'naoexiste' }),
    ).rejects.toThrow('course_not_found');
  });
});
