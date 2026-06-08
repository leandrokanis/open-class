import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { ProfileService } from '../../users/profile.service';

export function registerGetProfileTool(server: McpServer, profileService: ProfileService) {
  server.tool(
    'get-profile',
    'Retorna o perfil de um usuário (sem hash de senha)',
    {
      userId: z.string().uuid().describe('UUID do usuário'),
    },
    async ({ userId }) => {
      const profile = await profileService.getProfile(userId);
      return { content: [{ type: 'text', text: JSON.stringify(profile) }] };
    },
  );
}
