import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { PermissionsService } from '../src/permissions/permissions.service';
import { RolesService } from '../src/roles/roles.service';
import { PermissionAction, PermissionScope } from '../src/permissions/permission.schema';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const permissionsService = app.get(PermissionsService);
  const rolesService = app.get(RolesService);

  console.log('🌱 Seeding RBAC data...');

  try {
    // Create permissions
    console.log('Creating permissions...');
    const permissions = [];

    // Define resources
    const resources = ['users', 'roles', 'permissions', 'organizations', 'stores', 'products', 'orders', 'categories'];
    const actions = [PermissionAction.CREATE, PermissionAction.READ, PermissionAction.UPDATE, PermissionAction.DELETE, PermissionAction.MANAGE];
    const scopes = [PermissionScope.SYSTEM, PermissionScope.ORGANIZATION, PermissionScope.STORE];

    // Create permissions for each resource/action/scope combination
    for (const resource of resources) {
      for (const action of actions) {
        for (const scope of scopes) {
          // Skip invalid combinations
          if (scope === PermissionScope.SYSTEM && resource === 'stores') continue;
          if (action === PermissionAction.MANAGE && scope === PermissionScope.STORE && resource !== 'store') continue;

          try {
            const permission = await permissionsService.create({
              name: `${action} ${resource} (${scope})`,
              resource,
              action,
              scope,
              description: `Permission to ${action} ${resource} at ${scope} level`,
            });
            permissions.push(permission);
            console.log(`  ✓ Created permission: ${permission.name}`);
          } catch (error) {
            if (error.status === 409) {
              console.log(`  - Permission already exists: ${action} ${resource} (${scope})`);
            } else {
              console.error(`  ✗ Error creating permission:`, error.message);
            }
          }
        }
      }
    }

    // Create roles with permissions
    console.log('\nCreating roles...');

    // Super Admin - Full system access
    const systemPermissions = await permissionsService.findByScope(PermissionScope.SYSTEM);
    try {
      const superAdmin = await rolesService.create({
        name: 'super_admin',
        description: 'System administrator with full access to all resources',
        scope: PermissionScope.SYSTEM,
        permissions: systemPermissions.map((p: any) => p._id.toString()),
        isSystemRole: true,
        isActive: true,
      });
      console.log(`  ✓ Created role: ${superAdmin.name}`);
    } catch (error) {
      if (error.status === 409) {
        console.log(`  - Role already exists: super_admin`);
      }
    }

    // Organization Admin - Manage organization and all stores
    const orgPermissions = await permissionsService.findByScope(PermissionScope.ORGANIZATION);
    const orgManageableResources = ['stores', 'products', 'orders', 'users'];
    const orgFilteredPermissions = orgPermissions.filter((p: any) => 
      orgManageableResources.includes(p.resource)
    );
    
    try {
      const orgAdmin = await rolesService.create({
        name: 'organization_admin',
        description: 'Organization administrator who can manage all stores in an organization',
        scope: PermissionScope.ORGANIZATION,
        permissions: orgFilteredPermissions.map((p: any) => p._id.toString()),
        isSystemRole: true,
        isActive: true,
      });
      console.log(`  ✓ Created role: ${orgAdmin.name}`);
    } catch (error) {
      if (error.status === 409) {
        console.log(`  - Role already exists: organization_admin`);
      }
    }

    // Store Owner - Full store management
    const storePermissions = await permissionsService.findByScope(PermissionScope.STORE);
    const storeManageableResources = ['products', 'orders', 'categories', 'users'];
    const storeOwnerPermissions = storePermissions.filter((p: any) => 
      storeManageableResources.includes(p.resource)
    );
    
    try {
      const storeOwner = await rolesService.create({
        name: 'store_owner',
        description: 'Store owner with full management capabilities',
        scope: PermissionScope.STORE,
        permissions: storeOwnerPermissions.map((p: any) => p._id.toString()),
        isSystemRole: true,
        isActive: true,
      });
      console.log(`  ✓ Created role: ${storeOwner.name}`);
    } catch (error) {
      if (error.status === 409) {
        console.log(`  - Role already exists: store_owner`);
      }
    }

    // Store Manager - Manage products and orders
    const managerResources = ['products', 'orders', 'categories'];
    const managerPermissions = storePermissions.filter((p: any) => 
      managerResources.includes(p.resource) && 
      [PermissionAction.CREATE, PermissionAction.READ, PermissionAction.UPDATE].includes(p.action)
    );
    
    try {
      const storeManager = await rolesService.create({
        name: 'store_manager',
        description: 'Store manager who can manage products and orders',
        scope: PermissionScope.STORE,
        permissions: managerPermissions.map((p: any) => p._id.toString()),
        isSystemRole: true,
        isActive: true,
      });
      console.log(`  ✓ Created role: ${storeManager.name}`);
    } catch (error) {
      if (error.status === 409) {
        console.log(`  - Role already exists: store_manager`);
      }
    }

    // Staff - Basic order and product access
    const staffResources = ['orders', 'products'];
    const staffPermissions = storePermissions.filter((p: any) => 
      staffResources.includes(p.resource) && 
      [PermissionAction.CREATE, PermissionAction.READ].includes(p.action)
    );
    
    try {
      const staff = await rolesService.create({
        name: 'staff',
        description: 'Store staff with basic order and product access',
        scope: PermissionScope.STORE,
        permissions: staffPermissions.map((p: any) => p._id.toString()),
        isSystemRole: true,
        isActive: true,
      });
      console.log(`  ✓ Created role: ${staff.name}`);
    } catch (error) {
      if (error.status === 409) {
        console.log(`  - Role already exists: staff`);
      }
    }

    // Customer - Basic customer permissions (read products, create orders)
    const customerResources = ['products', 'orders'];
    const customerPermissions = storePermissions.filter((p: any) => 
      (p.resource === 'products' && p.action === PermissionAction.READ) ||
      (p.resource === 'orders' && [PermissionAction.CREATE, PermissionAction.READ].includes(p.action))
    );
    
    try {
      const customer = await rolesService.create({
        name: 'customer',
        description: 'Customer who can browse products and create orders',
        scope: PermissionScope.SYSTEM,
        permissions: customerPermissions.map((p: any) => p._id.toString()),
        isSystemRole: true,
        isActive: true,
      });
      console.log(`  ✓ Created role: ${customer.name}`);
    } catch (error) {
      if (error.status === 409) {
        console.log(`  - Role already exists: customer`);
      }
    }

    console.log('\n✅ RBAC seeding completed successfully!');
    console.log('\nDefault roles created:');
    console.log('  - super_admin: Full system access');
    console.log('  - organization_admin: Manage organization and stores');
    console.log('  - store_owner: Full store management');
    console.log('  - store_manager: Manage products and orders');
    console.log('  - staff: Basic order and product access');
    console.log('  - customer: Browse products and create orders');
    
  } catch (error) {
    console.error('❌ Error seeding RBAC data:', error);
  }

  await app.close();
}

bootstrap();
