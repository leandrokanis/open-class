import type { Request, Response, NextFunction } from 'express';
import type { McpOAuthService } from '../mcp-oauth/mcp-oauth.service';

export function createMcpAuthMiddleware(
  staticToken: string | undefined,
  oauthService: Pick<McpOAuthService, 'validateAccessToken'>,
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const token = authHeader.slice(7);

    if (staticToken && token === staticToken) {
      next();
      return;
    }

    const valid = await oauthService.validateAccessToken(token);
    if (valid) {
      next();
      return;
    }

    res.status(401).json({ message: 'Unauthorized' });
  };
}
