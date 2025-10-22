import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * CurrentStore decorator extracts the current store from request context.
 * Store ID is set via x-store-id header by StoreContextMiddleware.
 * 
 * @example
 * ```typescript
 * @Get('products')
 * async getProducts(@CurrentStore() storeId: string) {
 *   // storeId will be the value from x-store-id header
 * }
 * ```
 */
export const CurrentStore = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest();
    return request.storeId;
  },
);
