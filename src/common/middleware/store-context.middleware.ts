import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class StoreContextMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Extract x-store-id from headers
    const storeId = req.headers['x-store-id'] as string;
    
    if (storeId) {
      // Attach store ID to request object
      (req as any).storeId = storeId;
    }
    
    next();
  }
}
