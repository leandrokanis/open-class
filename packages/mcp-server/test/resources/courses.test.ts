import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { AxiosInstance } from 'axios';

describe('registerCoursesResource', () => {
  let mockApiClient: { get: ReturnType<typeof vi.fn> };
  let mockServer: { resource: ReturnType<typeof vi.fn> };
  let registeredHandler: (uri: URL) => Promise<unknown>;

  beforeEach(async () => {
    vi.resetModules();
    mockApiClient = { get: vi.fn() };
    mockServer = { resource: vi.fn().mockImplementation((_name, _uri, handler) => {
      registeredHandler = handler;
    }) };

    const { registerCoursesResource } = await import('../../src/resources/courses');
    registerCoursesResource(mockServer as never, mockApiClient as unknown as AxiosInstance);
  });

  it('registra resource com nome "courses-list" e URI "courses://list"', () => {
    expect(mockServer.resource).toHaveBeenCalledWith(
      'courses-list',
      'courses://list',
      expect.any(Function),
    );
  });

  it('retorna lista de cursos com campos esperados', async () => {
    // Arrange
    const fakeCourses = [
      { id: 'c1', title: 'NestJS do Zero', shortDescription: 'Aprenda NestJS', level: 'beginner', slug: 'nestjs-do-zero', category: { name: 'Backend' } },
    ];
    mockApiClient.get.mockResolvedValue({ data: { items: fakeCourses } });

    // Act
    const result = await registeredHandler(new URL('courses://list')) as {
      contents: Array<{ uri: string; mimeType: string; text: string }>;
    };

    // Assert
    expect(result.contents).toHaveLength(1);
    const parsed = JSON.parse(result.contents[0].text);
    expect(parsed[0]).toMatchObject({ id: 'c1', title: 'NestJS do Zero' });
  });

  it('propaga erro quando API falha', async () => {
    // Arrange
    mockApiClient.get.mockRejectedValue(new Error('network error'));

    // Act & Assert
    await expect(registeredHandler(new URL('courses://list'))).rejects.toThrow();
  });
});
