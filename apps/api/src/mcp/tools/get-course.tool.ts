import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { CoursesRepository } from '../../courses/courses.repository';

export function registerGetCourseTool(server: McpServer, coursesRepository: CoursesRepository) {
  server.tool(
    'get-course',
    'Retorna um curso completo com seus módulos e aulas pelo ID',
    {
      courseId: z.string().uuid().describe('UUID do curso'),
    },
    async ({ courseId }) => {
      const course = await coursesRepository.findWithModulesAndLessons(courseId);
      if (!course) {
        return { content: [{ type: 'text', text: JSON.stringify({ error: 'Curso não encontrado' }) }] };
      }
      return { content: [{ type: 'text', text: JSON.stringify(course) }] };
    },
  );
}
