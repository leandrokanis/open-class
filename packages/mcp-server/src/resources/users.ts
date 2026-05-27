import type { AxiosInstance } from 'axios';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp';

export function registerUsersResource(server: McpServer, api: AxiosInstance): void {
  server.resource(
    'users-list',
    'users://list',
    async (uri) => {
      const res = await api.get('/api/users');
      const users = (res.data ?? []) as unknown[];

      return {
        contents: [
          {
            uri: uri.href,
            mimeType: 'application/json',
            text: JSON.stringify(users),
          },
        ],
      };
    },
  );
}
