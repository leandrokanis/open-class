import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { CoursesService } from '../../courses/courses.service';

export function registerUpdateCourseTool(server: McpServer, coursesService: CoursesService) {
  server.tool(
    'update-course',
    'Atualiza os metadados de um curso (título, descrição, nível, categoria)',
    {
      instructorId: z.string().uuid().describe('UUID do instrutor dono do curso'),
      courseId: z.string().uuid().describe('UUID do curso'),
      title: z.string().min(1).max(150).optional().describe('Novo título'),
      shortDescription: z.string().max(200).optional().describe('Nova descrição curta'),
      description: z.string().optional().describe('Nova descrição longa'),
      level: z.enum(['beginner', 'intermediate', 'advanced']).optional().describe('Nível'),
      categoryId: z.string().uuid().optional().describe('UUID da nova categoria'),
    },
    async ({ instructorId, courseId, ...dto }) => {
      const course = await coursesService.update(
        courseId,
        { id: instructorId, role: 'instructor' },
        dto,
      );
      return { content: [{ type: 'text', text: JSON.stringify(course) }] };
    },
  );
}
