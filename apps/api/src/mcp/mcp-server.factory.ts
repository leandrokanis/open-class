import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { EnrollmentsService } from '../enrollments/enrollments.service';
import type { CoursesService } from '../courses/courses.service';
import type { CoursesRepository } from '../courses/courses.repository';
import type { UsersService } from '../users/users.service';
import { registerEnrollTool } from './tools/enroll.tool';
import { registerCreateCourseTool } from './tools/create-course.tool';
import { registerGetProgressTool } from './tools/get-progress.tool';
import { registerListCoursesTool } from './tools/list-courses.tool';
import { registerListUsersTool } from './tools/list-users.tool';
import { registerListEnrollmentsTool } from './tools/list-enrollments.tool';
import { registerCoursesResource } from './resources/courses.resource';
import { registerUsersResource } from './resources/users.resource';
import { registerEnrollmentsResource } from './resources/enrollments.resource';

export interface McpServices {
  enrollmentsService: EnrollmentsService;
  coursesService: CoursesService;
  coursesRepository: CoursesRepository;
  usersService: UsersService;
}

export function createMcpServer(services: McpServices): McpServer {
  const server = new McpServer({ name: 'open-class', version: '1.0.0' });

  registerEnrollTool(server, services.enrollmentsService);
  registerCreateCourseTool(server, services.coursesService);
  registerGetProgressTool(server, services.enrollmentsService);
  registerListCoursesTool(server, services.coursesRepository);
  registerListUsersTool(server, services.usersService);
  registerListEnrollmentsTool(server, services.enrollmentsService);

  registerCoursesResource(server, services.coursesRepository);
  registerUsersResource(server, services.usersService);
  registerEnrollmentsResource(server, services.enrollmentsService);

  return server;
}
