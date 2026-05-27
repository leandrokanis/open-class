import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { EnrollmentsService } from '../../enrollments/enrollments.service';

export function registerEnrollTool(server: McpServer, enrollmentsService: EnrollmentsService) {
  server.tool(
    'enroll',
    'Matricula um aluno em um curso pelo ID',
    {
      studentId: z.string().uuid().describe('UUID do aluno'),
      courseId: z.string().uuid().describe('UUID do curso'),
    },
    async ({ studentId, courseId }) => {
      const enrollment = await enrollmentsService.enroll(studentId, courseId);
      return {
        content: [{ type: 'text', text: JSON.stringify(enrollment) }],
      };
    },
  );
}
