import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { CoursesRepository } from '../../courses/courses.repository';

export function registerListMyCoursesTool(server: McpServer, coursesRepository: CoursesRepository) {
  server.tool(
    'list-my-courses',
    'Lista os cursos criados por um instrutor (todos os status: rascunho e publicado)',
    {
      instructorId: z.string().uuid().describe('UUID do instrutor'),
      page: z.number().int().min(1).default(1).describe('Página (default: 1)'),
      limit: z.number().int().min(1).max(50).default(20).describe('Itens por página'),
    },
    async ({ instructorId, page, limit }) => {
      const result = await coursesRepository.findByInstructorId(instructorId, page, limit);
      return { content: [{ type: 'text', text: JSON.stringify(result) }] };
    },
  );
}
