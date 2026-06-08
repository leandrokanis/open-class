import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMcpServer, type McpServices } from '../mcp-server.factory';

const makeServices = (overrides: Partial<McpServices> = {}): McpServices => ({
  enrollmentsService: {
    enroll: vi.fn(),
    findByStudent: vi.fn(),
  } as unknown as McpServices['enrollmentsService'],
  coursesService: {
    create: vi.fn(),
  } as unknown as McpServices['coursesService'],
  coursesRepository: {
    findAll: vi.fn(),
  } as unknown as McpServices['coursesRepository'],
  usersService: {
    findAll: vi.fn(),
  } as unknown as McpServices['usersService'],
  profileService: {
    getProfile: vi.fn(),
    updateProfile: vi.fn(),
  } as unknown as McpServices['profileService'],
  ...overrides,
});

describe('createMcpServer', () => {
  let services: McpServices;

  beforeEach(() => {
    services = makeServices();
  });

  it('should return an McpServer instance', () => {
    const server = createMcpServer(services);
    expect(server).toBeDefined();
    expect(typeof server.connect).toBe('function');
  });

  it('should register enroll tool that delegates to EnrollmentsService.enroll()', async () => {
    const mockEnrollment = { id: 'e1', status: 'active', enrolledAt: new Date().toISOString() };
    vi.mocked(services.enrollmentsService.enroll).mockResolvedValue(mockEnrollment as any);

    const server = createMcpServer(services);
    const tools = (server as any)._registeredTools as Record<string, any>;
    expect('enroll' in tools).toBe(true);

    const result = await tools['enroll'].handler({ studentId: 's1', courseId: 'c1' }, {});

    expect(services.enrollmentsService.enroll).toHaveBeenCalledWith('s1', 'c1');
    expect(result.content[0].text).toContain('e1');
  });

  it('should register create-course tool that delegates to CoursesService.create()', async () => {
    const mockCourse = { id: 'c1', title: 'NestJS', slug: 'nestjs' };
    vi.mocked(services.coursesService.create).mockResolvedValue(mockCourse as any);

    const server = createMcpServer(services);
    const tools = (server as any)._registeredTools as Record<string, any>;
    expect('create-course' in tools).toBe(true);

    const result = await tools['create-course'].handler({ instructorId: 'u1', title: 'NestJS' }, {});

    expect(services.coursesService.create).toHaveBeenCalledWith(
      { id: 'u1', role: 'instructor' },
      expect.objectContaining({ title: 'NestJS' }),
    );
    expect(result.content[0].text).toContain('c1');
  });

  it('should register get-progress tool that delegates to EnrollmentsService.findByStudent()', async () => {
    const mockProgress = [{ id: 'e1', progress: { percentage: 50 } }];
    vi.mocked(services.enrollmentsService.findByStudent).mockResolvedValue(mockProgress as any);

    const server = createMcpServer(services);
    const tools = (server as any)._registeredTools as Record<string, any>;
    expect('get-progress' in tools).toBe(true);

    const result = await tools['get-progress'].handler({ studentId: 's1' }, {});

    expect(services.enrollmentsService.findByStudent).toHaveBeenCalledWith('s1');
    expect(result.content[0].text).toContain('e1');
  });
});
