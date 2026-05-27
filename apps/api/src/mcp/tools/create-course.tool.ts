import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { CoursesService } from '../../courses/courses.service';

export function registerCreateCourseTool(server: McpServer, coursesService: CoursesService) {
  server.tool(
    'create-course',
    'Cria um novo curso atribuído a um instrutor',
    {
      instructorId: z.string().uuid().describe('UUID do instrutor'),
      title: z.string().min(1).max(150).describe('Título do curso'),
      shortDescription: z.string().max(200).optional().describe('Descrição curta'),
      description: z.string().optional().describe('Descrição longa'),
      level: z.enum(['beginner', 'intermediate', 'advanced']).optional().describe('Nível do curso'),
      categoryId: z.string().uuid().optional().describe('UUID da categoria'),
    },
    async ({ instructorId, title, shortDescription, description, level, categoryId }) => {
      const course = await coursesService.create(
        { id: instructorId, role: 'instructor' },
        { title, shortDescription, description, level, categoryId },
      );
      return {
        content: [{ type: 'text', text: JSON.stringify(course) }],
      };
    },
  );
}
