import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types';
import { z } from 'zod';
import type { AxiosInstance } from 'axios';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp';

interface User {
  id: string;
  email: string;
}

interface EnrollmentWithProgress {
  course: { id: string };
  progress?: { percentage: number; completedLessons: number; totalLessons: number };
}

export function registerGetProgressTool(server: McpServer, api: AxiosInstance): void {
  server.tool(
    'get_student_progress',
    'Consulta o progresso de um aluno em um curso específico',
    {
      userEmail: z.string().email().describe('E-mail do aluno'),
      courseId: z.string().describe('UUID do curso'),
    },
    async ({ userEmail, courseId }) => {
      const usersRes = await api.get('/api/users');
      const users = (usersRes.data ?? []) as User[];
      const user = users.find((u) => u.email === userEmail);

      if (!user) {
        throw new McpError(ErrorCode.InvalidParams, 'user_not_found');
      }

      const enrollmentsRes = await api.get('/api/enrollments');
      const all = (enrollmentsRes.data ?? []) as EnrollmentWithProgress[];
      const enrollment = all.find((e) => e.course?.id === courseId);

      if (!enrollment) {
        throw new McpError(ErrorCode.InvalidParams, 'enrollment_not_found');
      }

      const progress = enrollment.progress ?? { percentage: 0, completedLessons: 0, totalLessons: 0 };

      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(progress),
          },
        ],
      };
    },
  );
}
