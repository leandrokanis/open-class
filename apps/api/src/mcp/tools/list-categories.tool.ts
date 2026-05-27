import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { CategoriesService } from '../../categories/categories.service';

export function registerListCategoriesTool(server: McpServer, categoriesService: CategoriesService) {
  server.tool(
    'list-categories',
    'Lista as categorias disponíveis para associar a cursos',
    {
      page: z.number().int().min(1).default(1).describe('Página'),
      limit: z.number().int().min(1).max(100).default(50).describe('Itens por página'),
    },
    async ({ page, limit }) => {
      const result = await categoriesService.findAll(page, limit);
      return { content: [{ type: 'text', text: JSON.stringify(result) }] };
    },
  );
}
