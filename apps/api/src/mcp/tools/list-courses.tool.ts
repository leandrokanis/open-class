import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { CoursesRepository } from '../../courses/courses.repository';

export function registerListCoursesTool(server: McpServer, coursesRepository: CoursesRepository) {
  server.tool(
    'list-courses',
    'Lista os cursos publicados na plataforma com título, descrição, instrutor e categoria',
    {
      page: z.number().int().min(1).default(1).describe('Página (default: 1)'),
      limit: z.number().int().min(1).max(100).default(20).describe('Itens por página (max: 100)'),
    },
    async ({ page, limit }) => {
      const result = await coursesRepository.findAll(page, limit, { status: 'published' });
      return {
        content: [{ type: 'text', text: JSON.stringify(result) }],
      };
    },
  );
}
