# RBAC System Guide

## Overview

This NestJS application implements a comprehensive Role-Based Access Control (RBAC) system that supports multi-store and multi-organization architecture. The RBAC system provides fine-grained access control through a combination of roles, permissions, and scopes.

## Architecture

### Hierarchy Model

```
System (Global)
  └── Organization
       └── Store
            └── User
```

### Core Entities

#### 1. Organization
- Represents a business entity that can own multiple stores
- Fields: `name`, `description`, `isActive`

#### 2. Store
- Represents an individual store/location
- Belongs to an Organization
- Fields: `name`, `organizationId`, `address`, `phone`, `isActive`

#### 3. Permission
- Defines specific actions on resources
- Fields:
  - `name`: Human-readable name
  - `resource`: Target entity (e.g., 'orders', 'products')
  - `action`: Operation type (`create`, `read`, `update`, `delete`, `manage`)
  - `scope`: Context level (`system`, `organization`, `store`)
  - `description`: Purpose of the permission

#### 4. Role
- Groups permissions together
- Fields:
  - `name`: Role identifier (e.g., 'store_manager')
  - `description`: Role purpose
  - `scope`: Where the role applies
  - `permissions`: Array of Permission IDs
  - `isSystemRole`: Protected from deletion
  - `isActive`: Enable/disable role

#### 5. UserRole
- Assigns roles to users with context
- Fields:
  - `userId`: User reference
  - `roleId`: Role reference
  - `scope`: Permission scope
  - `scopeId`: Organization or Store ID
  - `scopeModel`: Dynamic reference type
  - `isActive`: Enable/disable assignment

## Default Roles

### super_admin
- **Scope**: System
- **Description**: Full system access
- **Permissions**: All system-level operations
- **Use Case**: Platform administrators

### organization_admin
- **Scope**: Organization
- **Description**: Manages an entire organization and all its stores
- **Permissions**: CRUD on stores, products, orders, users within organization
- **Use Case**: Business owners, regional managers

### store_owner
- **Scope**: Store
- **Description**: Full management of a specific store
- **Permissions**: CRUD on products, orders, categories, users within store
- **Use Case**: Store proprietors, franchise owners

### store_manager
- **Scope**: Store
- **Description**: Operational management of products and orders
- **Permissions**: Create, read, update (not delete) products, orders, categories
- **Use Case**: Store managers, shift supervisors

### staff
- **Scope**: Store
- **Description**: Basic order and product access
- **Permissions**: Create and read orders and products
- **Use Case**: Sales staff, cashiers

## Permission Matrix

### Resource Actions

| Resource | Actions | Scopes |
|----------|---------|--------|
| users | create, read, update, delete, manage | system, organization, store |
| roles | create, read, update, delete, manage | system, organization, store |
| permissions | create, read, update, delete, manage | system |
| organizations | create, read, update, delete, manage | system |
| stores | create, read, update, delete, manage | system, organization, store |
| products | create, read, update, delete, manage | organization, store |
| orders | create, read, update, delete, manage | organization, store |
| categories | create, read, update, delete, manage | organization, store |

## API Endpoints

### Authentication
```
POST /auth/register - Register new user
POST /auth/login - Login (returns JWT with roles)
```

### Organizations
```
POST   /organizations - Create organization (super_admin)
GET    /organizations - List all organizations
GET    /organizations/:id - Get organization details
PATCH  /organizations/:id - Update organization (super_admin, organization_admin)
DELETE /organizations/:id - Delete organization (super_admin)
```

### Stores
```
POST   /stores - Create store (super_admin, organization_admin)
GET    /stores - List all stores
GET    /stores?organizationId=xxx - Filter by organization
GET    /stores/:id - Get store details
PATCH  /stores/:id - Update store (super_admin, organization_admin, store_owner)
DELETE /stores/:id - Delete store (super_admin, organization_admin)
```

### Permissions
```
POST   /permissions - Create permission (super_admin)
GET    /permissions - List all permissions
GET    /permissions?resource=orders - Filter by resource
GET    /permissions?scope=store - Filter by scope
GET    /permissions/:id - Get permission details
PATCH  /permissions/:id - Update permission (super_admin)
DELETE /permissions/:id - Delete permission (super_admin)
```

### Roles
```
POST   /roles - Create role (super_admin, organization_admin)
GET    /roles - List all roles
GET    /roles?scope=store - Filter by scope
GET    /roles/:id - Get role details
PATCH  /roles/:id - Update role (super_admin, organization_admin)
POST   /roles/:id/permissions/add - Add permissions to role
POST   /roles/:id/permissions/remove - Remove permissions from role
DELETE /roles/:id - Delete role (super_admin, cannot delete system roles)
```

### User Roles
```
POST   /user-roles/assign - Assign role to user
POST   /user-roles/revoke - Revoke role from user
GET    /user-roles/user/:userId - Get user's roles
GET    /user-roles/user/:userId/permissions - Get user's permissions
GET    /user-roles/me/permissions - Get current user's permissions
GET    /user-roles/:id - Get user role details
PATCH  /user-roles/:id - Update user role (activate/deactivate)
```

### Orders (Example with RBAC)
```
POST   /orders - Create order (requires orders:create permission)
GET    /orders - List orders (role-based: super_admin, organization_admin, store_owner, store_manager, staff)
GET    /orders/:id - Get order details (requires orders:read permission)
PATCH  /orders/:id/status - Update order status (requires store_manager or above)
DELETE /orders/:id - Delete order (requires store_owner or above)
```

## Usage Examples

### 1. Setup - Seed Default Roles

```bash
npm run seed:rbac
```

This creates all default roles, permissions, and their associations.

### 2. Register a User

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

Response includes JWT token with user roles.

### 3. Assign Role to User

```bash
curl -X POST http://localhost:3000/user-roles/assign \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_ID",
    "roleId": "ROLE_ID",
    "scope": "store",
    "scopeId": "STORE_ID"
  }'
```

### 4. Create Organization

```bash
curl -X POST http://localhost:3000/organizations \
  -H "Authorization: Bearer SUPER_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "ACME Corporation",
    "description": "Leading retail company"
  }'
```

### 5. Create Store

```bash
curl -X POST http://localhost:3000/stores \
  -H "Authorization: Bearer ORG_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Downtown Store",
    "organizationId": "ORG_ID",
    "address": "123 Main St",
    "phone": "+1234567890"
  }'
```

### 6. Access Orders with Store Context

```bash
curl -X GET http://localhost:3000/orders \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "x-store-id: STORE_ID"
```

The `x-store-id` header sets the store context for the request.

### 7. Check User Permissions

```bash
curl -X GET http://localhost:3000/user-roles/me/permissions?storeId=STORE_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Response:
```json
{
  "roles": ["store_manager"],
  "permissions": [
    "orders:create",
    "orders:read",
    "orders:update",
    "products:create",
    "products:read",
    "products:update"
  ],
  "userRoles": [...]
}
```

## Guards and Decorators

### @Roles() Decorator

Checks if user has any of the specified roles:

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin', 'organization_admin')
@Get('sensitive-data')
async getSensitiveData() {
  // Only super_admin or organization_admin can access
}
```

### @Permissions() Decorator

Checks if user has specific permissions:

```typescript
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Permissions('orders:create', 'orders:update')
@Post('orders')
async createOrder() {
  // User must have either orders:create or orders:update permission
}
```

### @GetUser() Decorator

Gets current authenticated user from request:

```typescript
@Get('profile')
async getProfile(@GetUser() user: any) {
  // user contains { userId, email, role, roles }
}
```

### @GetStoreId() Decorator

Gets store context from x-store-id header:

```typescript
@Get('orders')
async getOrders(@GetStoreId() storeId: string) {
  // storeId from x-store-id header
}
```

## Store Context Middleware

The `StoreContextMiddleware` automatically extracts the `x-store-id` header and attaches it to the request object. This allows guards and controllers to access the current store context.

```typescript
// Middleware configuration in app.module.ts
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(StoreContextMiddleware)
      .forRoutes('*');
  }
}
```

## Advanced Scenarios

### Multi-Store User

A user can have different roles in different stores:

```typescript
// Assign as store_manager in Store A
{
  userId: "user123",
  roleId: "store_manager_role_id",
  scope: "store",
  scopeId: "storeA"
}

// Assign as staff in Store B
{
  userId: "user123",
  roleId: "staff_role_id",
  scope: "store",
  scopeId: "storeB"
}
```

### Organization-Wide Role

Assign a role at organization level to grant access to all stores:

```typescript
{
  userId: "user123",
  roleId: "organization_admin_role_id",
  scope: "organization",
  scopeId: "org123"
}
```

### Custom Role Creation

Create a custom role for specific needs:

```bash
# 1. Get relevant permissions
curl -X GET http://localhost:3000/permissions?resource=products

# 2. Create custom role
curl -X POST http://localhost:3000/roles \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "inventory_specialist",
    "description": "Manages product inventory",
    "scope": "store",
    "permissions": ["PERMISSION_ID_1", "PERMISSION_ID_2"]
  }'
```

## Security Considerations

1. **System Roles**: Roles marked as `isSystemRole: true` cannot be deleted
2. **Scope Validation**: Permissions are checked against the current store context
3. **JWT Expiration**: Tokens expire based on JWT_EXPIRES_IN (default: 1d)
4. **Role Caching**: Consider implementing Redis caching for role lookups in production
5. **Audit Logging**: Consider adding audit logs for role assignments and permission changes

## Future Enhancements

1. **Permission Caching**: Implement Redis caching for permission lookups
2. **Audit Trail**: Track role and permission changes
3. **Dynamic Permissions**: Allow runtime permission evaluation
4. **Permission Inheritance**: Implement permission inheritance hierarchies
5. **Time-Based Roles**: Add expiration dates to role assignments
6. **IP Restrictions**: Add IP-based access control
7. **Two-Factor Authentication**: Integrate 2FA for sensitive operations

## Troubleshooting

### Issue: User can't access endpoint despite having role

1. Check if user has active role assignment:
   ```bash
   GET /user-roles/user/:userId
   ```

2. Verify role has required permissions:
   ```bash
   GET /roles/:roleId
   ```

3. Check if store context is set (for store-scoped operations):
   - Include `x-store-id` header in request

### Issue: Permission denied on multi-store operation

Ensure the `x-store-id` header is included and matches a store where the user has appropriate roles.

### Issue: Can't delete role

Check if role is a system role (`isSystemRole: true`). System roles cannot be deleted.

## Swagger Documentation

Access interactive API documentation at:
```
http://localhost:3000/api
```

All RBAC endpoints include:
- Required roles/permissions in descriptions
- Request/response schemas
- Authorization requirements
- Example requests

## Summary

This RBAC system provides:
- ✅ Multi-tenant architecture (Organization → Store → User)
- ✅ Flexible role-permission assignment
- ✅ Scope-based access control
- ✅ Store context via headers
- ✅ Default roles for common use cases
- ✅ Extensible permission model
- ✅ Complete Swagger documentation
- ✅ Unit tests for all services
