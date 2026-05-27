import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types';
import type { AxiosInstance } from 'axios';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp';
import { ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp';

interface User {
  id: string;
  email: string;
}

interface Enrollment {
  studentId?: string;
  student?: { id: string };
}

export function registerEnrollmentsResource(server: McpServer, api: AxiosInstance): void {
  const template = new ResourceTemplate('enrollments://list/{userEmail}', { list: undefined });

  server.resource(
    'enrollments-list',
    template,
    async (uri, { userEmail }) => {
      const email = Array.isArray(userEmail) ? userEmail[0] : userEmail;

      const usersRes = await api.get('/api/users');
      const users = (usersRes.data ?? []) as User[];
      const user = users.find((u) => u.email === email);

      if (!user) {
        throw new McpError(ErrorCode.InvalidParams, 'user_not_found');
      }

      const enrollmentsRes = await api.get('/api/enrollments');
      const all = (enrollmentsRes.data ?? []) as Enrollment[];
      const studentEnrollments = all.filter(
        (e) => e.studentId === user.id || e.student?.id === user.id,
      );

      return {
        contents: [
          {
            uri: uri.href,
            mimeType: 'application/json',
            text: JSON.stringify(studentEnrollments),
          },
        ],
      };
    },
  );
}
