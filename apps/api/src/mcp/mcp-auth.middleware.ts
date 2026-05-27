import type { Request, Response, NextFunction } from 'express';

export function createMcpAuthMiddleware(token: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.headers.authorization !== `Bearer ${token}`) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    next();
  };
}
