import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * CurrentRole decorator extracts the user's roles from the JWT payload.
 * 
 * @example
 * ```typescript
 * @Get('dashboard')
 * async getDashboard(@CurrentRole() roles: string[]) {
 *   // roles will be an array of role names from JWT
 * }
 * ```
 */
export const CurrentRole = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string[] => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.roles || [];
  },
);
