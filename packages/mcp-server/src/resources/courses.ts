import type { AxiosInstance } from 'axios';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp';

export function registerCoursesResource(server: McpServer, api: AxiosInstance): void {
  server.resource(
    'courses-list',
    'courses://list',
    async (uri) => {
      const res = await api.get('/api/catalog');
      const courses = (res.data.data ?? res.data.items ?? []) as unknown[];

      return {
        contents: [
          {
            uri: uri.href,
            mimeType: 'application/json',
            text: JSON.stringify(courses),
          },
        ],
      };
    },
  );
}
