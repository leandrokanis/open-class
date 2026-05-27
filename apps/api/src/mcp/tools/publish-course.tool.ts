import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { CoursesService } from '../../courses/courses.service';

export function registerPublishCourseTool(server: McpServer, coursesService: CoursesService) {
  server.tool(
    'publish-course',
    'Publica um curso (muda status de draft para published). O curso precisa ter ao menos uma aula visível.',
    {
      instructorId: z.string().uuid().describe('UUID do instrutor dono do curso'),
      courseId: z.string().uuid().describe('UUID do curso a publicar'),
    },
    async ({ instructorId, courseId }) => {
      const course = await coursesService.publish(courseId, { id: instructorId, role: 'instructor' });
      return { content: [{ type: 'text', text: JSON.stringify(course) }] };
    },
  );
}
