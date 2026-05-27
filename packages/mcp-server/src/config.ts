export interface Config {
  mcpApiToken: string;
  openClassApiUrl: string;
  adminEmail: string;
  adminPassword: string;
}

const REQUIRED_VARS = [
  'MCP_API_TOKEN',
  'OPEN_CLASS_API_URL',
  'OPEN_CLASS_ADMIN_EMAIL',
  'OPEN_CLASS_ADMIN_PASSWORD',
] as const;

export function validate(): Config {
  for (const varName of REQUIRED_VARS) {
    if (!process.env[varName]) {
      throw new Error(`MCP Server: variável de ambiente obrigatória ausente: ${varName}`);
    }
  }

  return {
    mcpApiToken: process.env.MCP_API_TOKEN!,
    openClassApiUrl: process.env.OPEN_CLASS_API_URL!,
    adminEmail: process.env.OPEN_CLASS_ADMIN_EMAIL!,
    adminPassword: process.env.OPEN_CLASS_ADMIN_PASSWORD!,
  };
}
