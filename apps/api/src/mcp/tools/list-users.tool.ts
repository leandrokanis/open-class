import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { UsersService } from '../../users/users.service';

export function registerListUsersTool(server: McpServer, usersService: UsersService) {
  server.tool(
    'list-users',
    'Lista os usuários cadastrados na plataforma com nome, e-mail e papel (role)',
    {},
    async () => {
      const users = await usersService.findAll();
      return {
        content: [{ type: 'text', text: JSON.stringify(users) }],
      };
    },
  );
}
