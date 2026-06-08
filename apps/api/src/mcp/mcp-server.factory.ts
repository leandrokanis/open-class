import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { EnrollmentsService } from '../enrollments/enrollments.service';
import type { CoursesService } from '../courses/courses.service';
import type { CoursesRepository } from '../courses/courses.repository';
import type { UsersService } from '../users/users.service';
import type { ModulesService } from '../modules/modules.service';
import type { LessonsService } from '../lessons/lessons.service';
import type { CategoriesService } from '../categories/categories.service';
import type { ProfileService } from '../users/profile.service';
import { registerEnrollTool } from './tools/enroll.tool';
import { registerCreateCourseTool } from './tools/create-course.tool';
import { registerGetProgressTool } from './tools/get-progress.tool';
import { registerListCoursesTool } from './tools/list-courses.tool';
import { registerListUsersTool } from './tools/list-users.tool';
import { registerListEnrollmentsTool } from './tools/list-enrollments.tool';
import { registerGetCourseTool } from './tools/get-course.tool';
import { registerListMyCoursesTool } from './tools/list-my-courses.tool';
import { registerUpdateCourseTool } from './tools/update-course.tool';
import { registerPublishCourseTool } from './tools/publish-course.tool';
import { registerCreateModuleTool } from './tools/create-module.tool';
import { registerCreateLessonTool } from './tools/create-lesson.tool';
import { registerUpdateLessonTool } from './tools/update-lesson.tool';
import { registerListCategoriesTool } from './tools/list-categories.tool';
import { registerGetProfileTool } from './tools/get-profile.tool';
import { registerUpdateProfileTool } from './tools/update-profile.tool';
import { registerCoursesResource } from './resources/courses.resource';
import { registerUsersResource } from './resources/users.resource';
import { registerEnrollmentsResource } from './resources/enrollments.resource';

export interface McpServices {
  enrollmentsService: EnrollmentsService;
  coursesService: CoursesService;
  coursesRepository: CoursesRepository;
  usersService: UsersService;
  modulesService: ModulesService;
  lessonsService: LessonsService;
  categoriesService: CategoriesService;
  profileService: ProfileService;
}

export function createMcpServer(services: McpServices): McpServer {
  const server = new McpServer({ name: 'open-class', version: '1.0.0' });

  // Consulta
  registerListCoursesTool(server, services.coursesRepository);
  registerListMyCoursesTool(server, services.coursesRepository);
  registerGetCourseTool(server, services.coursesRepository);
  registerListCategoriesTool(server, services.categoriesService);
  registerListUsersTool(server, services.usersService);
  registerListEnrollmentsTool(server, services.enrollmentsService);
  registerGetProgressTool(server, services.enrollmentsService);

  // Instrutor — cursos
  registerCreateCourseTool(server, services.coursesService);
  registerUpdateCourseTool(server, services.coursesService);
  registerPublishCourseTool(server, services.coursesService);

  // Instrutor — estrutura
  registerCreateModuleTool(server, services.modulesService);
  registerCreateLessonTool(server, services.lessonsService);
  registerUpdateLessonTool(server, services.lessonsService);

  // Aluno
  registerEnrollTool(server, services.enrollmentsService);

  // Perfil
  registerGetProfileTool(server, services.profileService);
  registerUpdateProfileTool(server, services.profileService);

  // Resources (para clientes MCP que suportam)
  registerCoursesResource(server, services.coursesRepository);
  registerUsersResource(server, services.usersService);
  registerEnrollmentsResource(server, services.enrollmentsService);

  return server;
}
