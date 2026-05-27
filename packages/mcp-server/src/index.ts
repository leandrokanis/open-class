import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio';
import { validate } from './config';
import { AuthManager } from './auth-manager';
import { createApiClient } from './api-client';
import { createServer } from './server';

async function main() {
  const config = validate();

  const auth = new AuthManager({
    apiUrl: config.openClassApiUrl,
    email: config.adminEmail,
    password: config.adminPassword,
  });

  const api = createApiClient(config.openClassApiUrl, auth);
  const server = createServer(api);
  const transport = new StdioServerTransport();

  await server.connect(transport);
}

main().catch((err) => {
  process.stderr.write(`MCP Server error: ${err instanceof Error ? err.message : String(err)}\n`);
  process.exit(1);
});
