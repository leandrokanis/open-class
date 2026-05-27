import {
  Module,
  OnModuleInit,
  Inject,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import type { Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { EnrollmentsModule } from '../enrollments/enrollments.module';
import { EnrollmentsService } from '../enrollments/enrollments.service';
import { CoursesModule } from '../courses/courses.module';
import { CoursesService } from '../courses/courses.service';
import { CoursesRepository } from '../courses/courses.repository';
import { UsersModule } from '../users/users.module';
import { UsersService } from '../users/users.service';
import { ModulesModule } from '../modules/modules.module';
import { ModulesService } from '../modules/modules.service';
import { LessonsModule } from '../lessons/lessons.module';
import { LessonsService } from '../lessons/lessons.service';
import { CategoriesModule } from '../categories/categories.module';
import { CategoriesService } from '../categories/categories.service';
import { McpController } from './mcp.controller';
import { createMcpServer } from './mcp-server.factory';
import { createMcpAuthMiddleware } from './mcp-auth.middleware';
import { McpOAuthModule } from '../mcp-oauth/mcp-oauth.module';
import { McpOAuthService } from '../mcp-oauth/mcp-oauth.service';

export { createMcpAuthMiddleware };

@Module({
  imports: [
    EnrollmentsModule,
    CoursesModule,
    UsersModule,
    ModulesModule,
    LessonsModule,
    CategoriesModule,
    McpOAuthModule,
  ],
  controllers: [McpController],
})
export class McpModule implements OnModuleInit {
  private readonly sessions = new Map<
    string,
    { server: McpServer; transport: StreamableHTTPServerTransport }
  >();

  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    @Inject(EnrollmentsService) private readonly enrollmentsService: EnrollmentsService,
    @Inject(CoursesService) private readonly coursesService: CoursesService,
    @Inject(CoursesRepository) private readonly coursesRepository: CoursesRepository,
    @Inject(UsersService) private readonly usersService: UsersService,
    @Inject(ModulesService) private readonly modulesService: ModulesService,
    @Inject(LessonsService) private readonly lessonsService: LessonsService,
    @Inject(CategoriesService) private readonly categoriesService: CategoriesService,
    @Inject(McpOAuthService) private readonly mcpOAuthService: McpOAuthService,
  ) {}

  onModuleInit() {
    const token = process.env.MCP_API_TOKEN;

    if (!token && !this.mcpOAuthService) {
      console.warn('MCP_API_TOKEN not set and OAuth service unavailable — MCP endpoint disabled');
      return;
    }

    const app = this.httpAdapterHost.httpAdapter.getInstance();
    const authMiddleware = createMcpAuthMiddleware(token, this.mcpOAuthService);

    app.use('/mcp', authMiddleware);

    app.post('/mcp', async (req: Request, res: Response) => {
      const sessionId = req.headers['mcp-session-id'] as string | undefined;
      let session = sessionId ? this.sessions.get(sessionId) : undefined;

      if (!session) {
        const transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => randomUUID(),
          onsessioninitialized: (id) => {
            this.sessions.set(id, { server, transport });
          },
        });

        const server = createMcpServer({
          enrollmentsService: this.enrollmentsService,
          coursesService: this.coursesService,
          coursesRepository: this.coursesRepository,
          usersService: this.usersService,
          modulesService: this.modulesService,
          lessonsService: this.lessonsService,
          categoriesService: this.categoriesService,
        });

        await server.connect(transport);
        session = { server, transport };
      }

      await session.transport.handleRequest(req, res, req.body);
    });

    app.get('/mcp', async (req: Request, res: Response) => {
      const sessionId = req.headers['mcp-session-id'] as string | undefined;
      const session = sessionId ? this.sessions.get(sessionId) : undefined;
      if (!session) {
        res.status(404).json({ message: 'Session not found' });
        return;
      }
      await session.transport.handleRequest(req, res);
    });

    app.delete('/mcp', async (req: Request, res: Response) => {
      const sessionId = req.headers['mcp-session-id'] as string | undefined;
      const session = sessionId ? this.sessions.get(sessionId) : undefined;
      if (session) {
        await session.transport.close();
        this.sessions.delete(sessionId!);
      }
      res.status(204).send();
    });
  }
}
