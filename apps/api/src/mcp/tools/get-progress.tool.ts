import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { EnrollmentsService } from '../../enrollments/enrollments.service';

export function registerGetProgressTool(server: McpServer, enrollmentsService: EnrollmentsService) {
  server.tool(
    'get-progress',
    'Retorna o progresso de um aluno em todos os seus cursos matriculados',
    {
      studentId: z.string().uuid().describe('UUID do aluno'),
    },
    async ({ studentId }) => {
      const enrollments = await enrollmentsService.findByStudent(studentId);
      return {
        content: [{ type: 'text', text: JSON.stringify(enrollments) }],
      };
    },
  );
}
