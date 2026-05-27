import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { LessonsService } from '../../lessons/lessons.service';

export function registerCreateLessonTool(server: McpServer, lessonsService: LessonsService) {
  server.tool(
    'create-lesson',
    'Cria uma nova aula dentro de um módulo',
    {
      instructorId: z.string().uuid().describe('UUID do instrutor dono do curso'),
      moduleId: z.string().uuid().describe('UUID do módulo'),
      title: z.string().min(1).max(150).describe('Título da aula'),
      description: z.string().optional().describe('Descrição da aula'),
      videoUrl: z.string().url().optional().describe('URL do vídeo (YouTube, etc.)'),
      duration: z.number().int().min(0).optional().describe('Duração em segundos'),
      visibility: z.enum(['visible', 'hidden']).default('visible').describe('Visibilidade da aula'),
    },
    async ({ instructorId, moduleId, title, description, videoUrl, duration, visibility }) => {
      const lesson = await lessonsService.create(
        moduleId,
        { title, description, videoUrl, duration, visibility },
        instructorId,
        'instructor',
      );
      return { content: [{ type: 'text', text: JSON.stringify(lesson) }] };
    },
  );
}
