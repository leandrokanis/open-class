import { z } from 'zod';
import type { AxiosInstance } from 'axios';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp';

export function registerCreateCourseTool(server: McpServer, api: AxiosInstance): void {
  server.tool(
    'create_course',
    'Cria um rascunho de curso (instrutor/admin)',
    {
      title: z.string().min(1).describe('Título do curso'),
      shortDescription: z.string().min(1).describe('Descrição curta'),
      categoryId: z.string().describe('UUID da categoria'),
      level: z.enum(['beginner', 'intermediate', 'advanced']).describe('Nível do curso'),
    },
    async ({ title, shortDescription, categoryId, level }) => {
      const res = await api.post('/api/courses', { title, shortDescription, categoryId, level });
      const course = res.data as { id: string; slug: string };

      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify({ courseId: course.id, slug: course.slug }),
          },
        ],
      };
    },
  );
}
