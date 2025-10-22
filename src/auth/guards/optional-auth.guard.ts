import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * OptionalAuthGuard allows requests to pass through even without authentication.
 * Used for endpoints that should be accessible to both authenticated users and guests.
 * If a valid token is provided, user info is attached to request.user.
 */
@Injectable()
export class OptionalAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    // Allow request to proceed even if there's no user
    // If user exists (valid token), attach it to the request
    return user;
  }
}
