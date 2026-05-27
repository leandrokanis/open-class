import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { UsersService } from '../../users/users.service';

export function registerUsersResource(server: McpServer, usersService: UsersService) {
  server.resource(
    'users',
    'users://list',
    { description: 'Lista todos os usuários cadastrados na plataforma' },
    async () => {
      const users = await usersService.findAll();
      return {
        contents: [{ uri: 'users://list', text: JSON.stringify(users), mimeType: 'application/json' }],
      };
    },
  );
}
