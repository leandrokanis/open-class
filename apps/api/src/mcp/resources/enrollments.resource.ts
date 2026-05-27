import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { EnrollmentsService } from '../../enrollments/enrollments.service';

export function registerEnrollmentsResource(server: McpServer, enrollmentsService: EnrollmentsService) {
  server.resource(
    'enrollments',
    new ResourceTemplate('enrollments://{studentId}', { list: undefined }),
    { description: 'Matrículas e progresso de um aluno (parâmetro: studentId)' },
    async (uri, { studentId }) => {
      const enrollments = await enrollmentsService.findByStudent(studentId as string);
      return {
        contents: [{ uri: uri.href, text: JSON.stringify(enrollments), mimeType: 'application/json' }],
      };
    },
  );
}
