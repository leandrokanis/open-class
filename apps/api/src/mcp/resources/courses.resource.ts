import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CoursesRepository } from '../../courses/courses.repository';

export function registerCoursesResource(server: McpServer, coursesRepository: CoursesRepository) {
  server.resource(
    'courses',
    'courses://list',
    { description: 'Lista todos os cursos cadastrados na plataforma' },
    async () => {
      const courses = await coursesRepository.findAll(1, 100, { status: 'published' });
      return {
        contents: [{ uri: 'courses://list', text: JSON.stringify(courses), mimeType: 'application/json' }],
      };
    },
  );
}
