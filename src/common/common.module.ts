import { Module, Global } from '@nestjs/common';
import { RolesGuard } from './guards/roles.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { UserRolesModule } from '../user-roles/user-roles.module';

/**
 * CommonModule provides shared guards, decorators, and middleware
 * across the application. Marked as @Global() so guards are available
 * everywhere without repeated imports.
 */
@Global()
@Module({
  imports: [UserRolesModule],
  providers: [RolesGuard, PermissionsGuard],
  exports: [RolesGuard, PermissionsGuard],
})
export class CommonModule {}
