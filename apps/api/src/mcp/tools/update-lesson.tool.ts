import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { LessonsService } from '../../lessons/lessons.service';

export function registerUpdateLessonTool(server: McpServer, lessonsService: LessonsService) {
  server.tool(
    'update-lesson',
    'Atualiza os dados de uma aula existente (título, descrição, URL do vídeo, duração, visibilidade)',
    {
      instructorId: z.string().uuid().describe('UUID do instrutor dono do curso'),
      lessonId: z.string().uuid().describe('UUID da aula'),
      title: z.string().min(1).max(150).optional().describe('Novo título'),
      description: z.string().optional().describe('Nova descrição'),
      youtubeUrl: z.string().url().optional().describe('Nova URL do YouTube'),
      duration: z.number().int().min(0).optional().describe('Duração em segundos'),
      isVisible: z.boolean().optional().describe('true = visível, false = oculta'),
    },
    async ({ instructorId, lessonId, ...dto }) => {
      const lesson = await lessonsService.update(lessonId, dto, instructorId, 'instructor');
      return { content: [{ type: 'text', text: JSON.stringify(lesson) }] };
    },
  );
}
