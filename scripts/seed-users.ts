import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { UsersService } from '../src/users/users.service';
import { UserRolesService } from '../src/user-roles/user-roles.service';
import { RolesService } from '../src/roles/roles.service';
import { OrganizationsService } from '../src/organizations/organizations.service';
import { StoresService } from '../src/stores/stores.service';
import { UserType } from '../src/users/user.schema';
import { PermissionScope } from '../src/permissions/permission.schema';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const usersService = app.get(UsersService);
  const userRolesService = app.get(UserRolesService);
  const rolesService = app.get(RolesService);
  const organizationsService = app.get(OrganizationsService);
  const storesService = app.get(StoresService);

  console.log('🌱 Seeding sample users...');

  try {
    // Get roles
    const superAdminRole = await rolesService.findByName('super_admin');
    const orgAdminRole = await rolesService.findByName('organization_admin');
    const storeOwnerRole = await rolesService.findByName('store_owner');
    const storeManagerRole = await rolesService.findByName('store_manager');
    const staffRole = await rolesService.findByName('staff');
    const customerRole = await rolesService.findByName('customer');

    // Create sample organization
    let organization;
    try {
      organization = await organizationsService.create({
        name: 'ACME Corporation',
        description: 'Sample e-commerce organization',
      });
      console.log(`  ✓ Created organization: ${organization.name}`);
    } catch (error) {
      if (error.status === 409) {
        const orgs = await organizationsService.findAll();
        organization = orgs.find((o: any) => o.name === 'ACME Corporation') || orgs[0];
        console.log(`  - Organization already exists: ${organization.name}`);
      } else {
        throw error;
      }
    }

    // Create sample stores
    let downtownStore, mallStore;
    try {
      downtownStore = await storesService.create({
        name: 'Downtown Store',
        organizationId: (organization as any)._id.toString(),
        address: '123 Main Street',
        phone: '+1234567890',
      });
      console.log(`  ✓ Created store: ${downtownStore.name}`);
    } catch (error) {
      if (error.status === 409) {
        const stores = await storesService.findAll();
        downtownStore = stores.find((s: any) => s.name === 'Downtown Store') || stores[0];
        console.log(`  - Store already exists: ${downtownStore.name}`);
      } else {
        throw error;
      }
    }

    try {
      mallStore = await storesService.create({
        name: 'Mall Store',
        organizationId: (organization as any)._id.toString(),
        address: '456 Shopping Mall, Floor 2',
        phone: '+1234567891',
      });
      console.log(`  ✓ Created store: ${mallStore.name}`);
    } catch (error) {
      if (error.status === 409) {
        const stores = await storesService.findAll();
        mallStore = stores.find((s: any) => s.name === 'Mall Store') || stores[1];
        console.log(`  - Store already exists: ${mallStore.name}`);
      } else {
        throw error;
      }
    }

    // Create Super Admin User
    try {
      const superAdmin = await usersService.create({
        email: 'admin@acme.com',
        password: 'Admin123!',
        firstName: 'Super',
        lastName: 'Admin',
        userType: UserType.STAFF,
      });

      await userRolesService.assignRole({
        userId: (superAdmin as any)._id.toString(),
        roleId: (superAdminRole as any)._id.toString(),
        scope: PermissionScope.SYSTEM,
      });

      console.log(`  ✓ Created super admin user: ${superAdmin.email}`);
      console.log(`    Password: Admin123!`);
    } catch (error) {
      if (error.status === 409) {
        console.log(`  - Super admin user already exists: admin@acme.com`);
      }
    }

    // Create Organization Admin User
    try {
      const orgAdmin = await usersService.create({
        email: 'orgadmin@acme.com',
        password: 'OrgAdmin123!',
        firstName: 'Organization',
        lastName: 'Admin',
        userType: UserType.STAFF,
        organizationId: (organization as any)._id,
      });

      await userRolesService.assignRole({
        userId: (orgAdmin as any)._id.toString(),
        roleId: (orgAdminRole as any)._id.toString(),
        scope: PermissionScope.ORGANIZATION,
        scopeId: (organization as any)._id.toString(),
      });

      console.log(`  ✓ Created organization admin user: ${orgAdmin.email}`);
      console.log(`    Password: OrgAdmin123!`);
    } catch (error) {
      if (error.status === 409) {
        console.log(`  - Organization admin user already exists: orgadmin@acme.com`);
      }
    }

    // Create Store Owner User (Downtown Store)
    try {
      const storeOwner = await usersService.create({
        email: 'owner.downtown@acme.com',
        password: 'Owner123!',
        firstName: 'John',
        lastName: 'Owner',
        phone: '+1234567892',
        userType: UserType.STAFF,
        primaryStoreId: (downtownStore as any)._id,
        organizationId: (organization as any)._id,
      });

      await userRolesService.assignRole({
        userId: (storeOwner as any)._id.toString(),
        roleId: (storeOwnerRole as any)._id.toString(),
        scope: PermissionScope.STORE,
        scopeId: (downtownStore as any)._id.toString(),
      });

      console.log(`  ✓ Created store owner user: ${storeOwner.email}`);
      console.log(`    Password: Owner123!`);
    } catch (error) {
      if (error.status === 409) {
        console.log(`  - Store owner user already exists: owner.downtown@acme.com`);
      }
    }

    // Create Store Manager User (Mall Store)
    try {
      const storeManager = await usersService.create({
        email: 'manager.mall@acme.com',
        password: 'Manager123!',
        firstName: 'Jane',
        lastName: 'Manager',
        phone: '+1234567893',
        userType: UserType.STAFF,
        primaryStoreId: (mallStore as any)._id,
        organizationId: (organization as any)._id,
      });

      await userRolesService.assignRole({
        userId: (storeManager as any)._id.toString(),
        roleId: (storeManagerRole as any)._id.toString(),
        scope: PermissionScope.STORE,
        scopeId: (mallStore as any)._id.toString(),
      });

      console.log(`  ✓ Created store manager user: ${storeManager.email}`);
      console.log(`    Password: Manager123!`);
    } catch (error) {
      if (error.status === 409) {
        console.log(`  - Store manager user already exists: manager.mall@acme.com`);
      }
    }

    // Create Staff User (Downtown Store)
    try {
      const staff = await usersService.create({
        email: 'staff.downtown@acme.com',
        password: 'Staff123!',
        firstName: 'Bob',
        lastName: 'Staff',
        phone: '+1234567894',
        userType: UserType.STAFF,
        primaryStoreId: (downtownStore as any)._id,
        organizationId: (organization as any)._id,
      });

      await userRolesService.assignRole({
        userId: (staff as any)._id.toString(),
        roleId: (staffRole as any)._id.toString(),
        scope: PermissionScope.STORE,
        scopeId: (downtownStore as any)._id.toString(),
      });

      console.log(`  ✓ Created staff user: ${staff.email}`);
      console.log(`    Password: Staff123!`);
    } catch (error) {
      if (error.status === 409) {
        console.log(`  - Staff user already exists: staff.downtown@acme.com`);
      }
    }

    // Create Customer Users
    try {
      const customer1 = await usersService.create({
        email: 'customer1@example.com',
        password: 'Customer123!',
        firstName: 'Alice',
        lastName: 'Customer',
        phone: '+1234567895',
        userType: UserType.CUSTOMER,
      });

      await userRolesService.assignRole({
        userId: (customer1 as any)._id.toString(),
        roleId: (customerRole as any)._id.toString(),
        scope: PermissionScope.SYSTEM,
      });

      console.log(`  ✓ Created customer user: ${customer1.email}`);
      console.log(`    Password: Customer123!`);
    } catch (error) {
      if (error.status === 409) {
        console.log(`  - Customer user already exists: customer1@example.com`);
      }
    }

    try {
      const customer2 = await usersService.create({
        email: 'customer2@example.com',
        password: 'Customer123!',
        firstName: 'Charlie',
        lastName: 'Buyer',
        phone: '+1234567896',
        userType: UserType.CUSTOMER,
      });

      await userRolesService.assignRole({
        userId: (customer2 as any)._id.toString(),
        roleId: (customerRole as any)._id.toString(),
        scope: PermissionScope.SYSTEM,
      });

      console.log(`  ✓ Created customer user: ${customer2.email}`);
      console.log(`    Password: Customer123!`);
    } catch (error) {
      if (error.status === 409) {
        console.log(`  - Customer user already exists: customer2@example.com`);
      }
    }

    console.log('\n✅ User seeding completed successfully!');
    console.log('\n📝 Sample Users Created:');
    console.log('┌─────────────────────────────────────────────────────────────────┐');
    console.log('│ Super Admin                                                      │');
    console.log('│   Email: admin@acme.com                                          │');
    console.log('│   Password: Admin123!                                            │');
    console.log('│   Role: super_admin (System-wide access)                         │');
    console.log('├─────────────────────────────────────────────────────────────────┤');
    console.log('│ Organization Admin                                               │');
    console.log('│   Email: orgadmin@acme.com                                       │');
    console.log('│   Password: OrgAdmin123!                                         │');
    console.log('│   Role: organization_admin (ACME Corporation)                    │');
    console.log('├─────────────────────────────────────────────────────────────────┤');
    console.log('│ Store Owner (Downtown Store)                                     │');
    console.log('│   Email: owner.downtown@acme.com                                 │');
    console.log('│   Password: Owner123!                                            │');
    console.log('│   Role: store_owner (Downtown Store)                             │');
    console.log('├─────────────────────────────────────────────────────────────────┤');
    console.log('│ Store Manager (Mall Store)                                       │');
    console.log('│   Email: manager.mall@acme.com                                   │');
    console.log('│   Password: Manager123!                                          │');
    console.log('│   Role: store_manager (Mall Store)                               │');
    console.log('├─────────────────────────────────────────────────────────────────┤');
    console.log('│ Staff (Downtown Store)                                           │');
    console.log('│   Email: staff.downtown@acme.com                                 │');
    console.log('│   Password: Staff123!                                            │');
    console.log('│   Role: staff (Downtown Store)                                   │');
    console.log('├─────────────────────────────────────────────────────────────────┤');
    console.log('│ Customer                                                         │');
    console.log('│   Email: customer1@example.com                                   │');
    console.log('│   Password: Customer123!                                         │');
    console.log('│   Role: customer                                                 │');
    console.log('├─────────────────────────────────────────────────────────────────┤');
    console.log('│ Customer                                                         │');
    console.log('│   Email: customer2@example.com                                   │');
    console.log('│   Password: Customer123!                                         │');
    console.log('│   Role: customer                                                 │');
    console.log('└─────────────────────────────────────────────────────────────────┘');

  } catch (error) {
    console.error('❌ Error seeding users:', error);
  }

  await app.close();
}

bootstrap();
