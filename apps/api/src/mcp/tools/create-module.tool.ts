import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { ModulesService } from '../../modules/modules.service';

export function registerCreateModuleTool(server: McpServer, modulesService: ModulesService) {
  server.tool(
    'create-module',
    'Cria um novo módulo dentro de um curso',
    {
      instructorId: z.string().uuid().describe('UUID do instrutor dono do curso'),
      courseId: z.string().uuid().describe('UUID do curso'),
      title: z.string().min(1).max(150).describe('Título do módulo'),
      description: z.string().optional().describe('Descrição do módulo'),
    },
    async ({ instructorId, courseId, title, description }) => {
      const module_ = await modulesService.create(courseId, { title, description }, instructorId, 'instructor');
      return { content: [{ type: 'text', text: JSON.stringify(module_) }] };
    },
  );
}
