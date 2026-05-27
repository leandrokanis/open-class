import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types';
import { z } from 'zod';
import type { AxiosInstance } from 'axios';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp';

interface User {
  id: string;
  email: string;
}

export function registerEnrollTool(server: McpServer, api: AxiosInstance): void {
  server.tool(
    'enroll_user',
    'Matricula um usuário em um curso pelo e-mail e ID do curso',
    {
      userEmail: z.string().email().describe('E-mail do usuário a matricular'),
      courseId: z.string().describe('UUID do curso'),
    },
    async ({ userEmail, courseId }) => {
      const usersRes = await api.get('/api/users');
      const users = (usersRes.data ?? []) as User[];
      const user = users.find((u) => u.email === userEmail);

      if (!user) {
        throw new McpError(ErrorCode.InvalidParams, 'user_not_found');
      }

      try {
        const enrollRes = await api.post('/api/enrollments/admin', {
          studentId: user.id,
          courseId,
        });
        const enrollment = enrollRes.data as { id: string; status: string };

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ enrollmentId: enrollment.id, status: enrollment.status }),
            },
          ],
        };
      } catch (err: unknown) {
        const status = (err as { response?: { status?: number } }).response?.status;
        if (status === 409) throw new McpError(ErrorCode.InvalidParams, 'already_enrolled');
        if (status === 404) throw new McpError(ErrorCode.InvalidParams, 'course_not_found');
        throw err;
      }
    },
  );
}
