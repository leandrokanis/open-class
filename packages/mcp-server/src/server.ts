import { McpServer } from '@modelcontextprotocol/sdk/server/mcp';
import type { AxiosInstance } from 'axios';
import { registerCoursesResource } from './resources/courses';
import { registerEnrollTool } from './tools/enroll';
import { registerUsersResource } from './resources/users';
import { registerEnrollmentsResource } from './resources/enrollments';
import { registerCreateCourseTool } from './tools/create-course';
import { registerGetProgressTool } from './tools/get-progress';

export function createServer(api: AxiosInstance): McpServer {
  const server = new McpServer({
    name: 'open-class',
    version: '1.0.0',
  });

  registerCoursesResource(server, api);
  registerUsersResource(server, api);
  registerEnrollmentsResource(server, api);

  registerEnrollTool(server, api);
  registerCreateCourseTool(server, api);
  registerGetProgressTool(server, api);

  return server;
}
