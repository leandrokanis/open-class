import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { ProfileService } from '../../users/profile.service';

export function registerUpdateProfileTool(server: McpServer, profileService: ProfileService) {
  server.tool(
    'update-profile',
    'Atualiza o nome e/ou bio de um usuário',
    {
      userId: z.string().uuid().describe('UUID do usuário'),
      name: z.string().min(1).max(255).optional().describe('Novo nome de exibição'),
      bio: z.string().max(300).optional().describe('Nova biografia'),
    },
    async ({ userId, name, bio }) => {
      const profile = await profileService.updateProfile(userId, { name, bio });
      return { content: [{ type: 'text', text: JSON.stringify(profile) }] };
    },
  );
}
