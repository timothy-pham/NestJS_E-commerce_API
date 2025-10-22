# RBAC System Testing Guide

## Testing the RBAC Implementation

This guide demonstrates how to test the RBAC system functionality.

### Prerequisites

Before testing, ensure:
1. MongoDB is running on `localhost:27017`
2. Environment variables are configured (`.env` file)
3. Application dependencies are installed (`npm install`)

### Step 1: Initialize the Database

Run the RBAC seeder to create default roles and permissions:

```bash
npm run seed:rbac
```

Expected output:
```
🌱 Seeding RBAC data...
Creating permissions...
  ✓ Created permission: create users (system)
  ✓ Created permission: read users (system)
  ...
Creating roles...
  ✓ Created role: super_admin
  ✓ Created role: organization_admin
  ✓ Created role: store_owner
  ✓ Created role: store_manager
  ✓ Created role: staff
✅ RBAC seeding completed successfully!
```

### Step 2: Start the Application

```bash
npm run start:dev
```

The API will be available at `http://localhost:3000`

### Step 3: Access Swagger Documentation

Open your browser and navigate to:
```
http://localhost:3000/api
```

You'll see all RBAC endpoints with:
- Interactive API testing
- Request/response schemas
- Authorization requirements
- Role and permission details

### Step 4: Testing Workflow

#### 4.1 Register a User

**Request:**
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Admin123!",
    "firstName": "Admin",
    "lastName": "User"
  }'
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "admin@example.com",
    "firstName": "Admin",
    "lastName": "User",
    "role": "user",
    "roles": []
  }
}
```

Save the `access_token` for subsequent requests.

#### 4.2 Get All Roles

**Request:**
```bash
curl -X GET http://localhost:3000/roles \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Response:**
```json
[
  {
    "_id": "...",
    "name": "super_admin",
    "description": "System administrator with full access to all resources",
    "scope": "system",
    "permissions": [...],
    "isSystemRole": true,
    "isActive": true
  },
  ...
]
```

#### 4.3 Create an Organization

First, you need to assign super_admin role to your user, then:

**Request:**
```bash
curl -X POST http://localhost:3000/organizations \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "ACME Corporation",
    "description": "Leading retail company"
  }'
```

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "name": "ACME Corporation",
  "description": "Leading retail company",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### 4.4 Create a Store

**Request:**
```bash
curl -X POST http://localhost:3000/stores \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Downtown Store",
    "organizationId": "507f1f77bcf86cd799439012",
    "address": "123 Main St",
    "phone": "+1234567890"
  }'
```

#### 4.5 Assign Role to User

Assign the store_manager role to a user for a specific store:

**Request:**
```bash
curl -X POST http://localhost:3000/user-roles/assign \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "507f1f77bcf86cd799439011",
    "roleId": "STORE_MANAGER_ROLE_ID",
    "scope": "store",
    "scopeId": "STORE_ID"
  }'
```

#### 4.6 Check User Permissions

**Request:**
```bash
curl -X GET "http://localhost:3000/user-roles/me/permissions?storeId=STORE_ID" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Response:**
```json
{
  "roles": ["store_manager"],
  "permissions": [
    "orders:create",
    "orders:read",
    "orders:update",
    "products:create",
    "products:read",
    "products:update",
    "categories:create",
    "categories:read",
    "categories:update"
  ],
  "userRoles": [...]
}
```

#### 4.7 Test Store Context with Orders

Create an order with store context:

**Request:**
```bash
curl -X POST http://localhost:3000/orders \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "x-store-id: STORE_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "productId": "PRODUCT_ID",
        "quantity": 2,
        "price": 29.99
      }
    ]
  }'
```

The `x-store-id` header sets the store context for permission evaluation.

#### 4.8 Test Access Control

Try accessing an endpoint without proper role:

**Request:**
```bash
curl -X DELETE http://localhost:3000/organizations/SOME_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected Response (403 Forbidden):**
```json
{
  "statusCode": 403,
  "message": "Access denied. Required roles: super_admin",
  "error": "Forbidden"
}
```

### Step 5: Test Different Role Scenarios

#### Scenario 1: Super Admin
- Create organizations, stores, roles, permissions
- Full access to all resources

#### Scenario 2: Organization Admin
- Manage all stores within their organization
- Assign roles to users within organization
- Cannot modify system-level settings

#### Scenario 3: Store Owner
- Full control over specific store
- Manage products, orders, and staff
- Cannot access other stores

#### Scenario 4: Store Manager
- Manage products and orders
- Cannot delete resources
- Cannot manage users

#### Scenario 5: Staff
- Create and view orders
- View products
- Limited access

### Automated Testing

Run the unit tests:
```bash
npm test
```

All 15 tests should pass:
```
Test Suites: 10 passed, 10 total
Tests:       15 passed, 15 total
```

### Common Test Scenarios

#### Test 1: Multi-Store User
1. Create 2 stores
2. Assign user as store_manager in Store A
3. Assign user as staff in Store B
4. Test access with different x-store-id headers

#### Test 2: Permission Inheritance
1. Create custom role with specific permissions
2. Assign to user
3. Verify user can only perform allowed actions

#### Test 3: Role Modification
1. Add permission to role
2. Verify users with that role gain new permission
3. Remove permission and verify access is revoked

#### Test 4: Scope Validation
1. Assign organization-level role
2. Verify access to all stores in organization
3. Compare with store-level role access

### Troubleshooting

#### Issue: "User not authenticated"
**Solution:** Ensure Authorization header includes valid JWT token

#### Issue: "Access denied. Required roles: ..."
**Solution:** 
1. Check user's roles: `GET /user-roles/me/permissions`
2. Assign appropriate role: `POST /user-roles/assign`

#### Issue: "Permission with ... already exists"
**Solution:** Seeder has already run. This is normal.

#### Issue: Store context not working
**Solution:** Include `x-store-id` header in request

### Performance Testing

For production deployments, consider:

1. **Load Testing**: Test with concurrent users
2. **Permission Caching**: Implement Redis for permission lookups
3. **Database Indexing**: Ensure indexes on userId, roleId, scope fields
4. **JWT Optimization**: Monitor token size with many roles

### Security Testing

Verify:
1. ✅ JWT tokens expire correctly
2. ✅ Revoked roles deny access immediately
3. ✅ System roles cannot be deleted
4. ✅ Cross-store access is blocked
5. ✅ Permissions are scope-aware

## Summary

The RBAC system provides comprehensive access control with:
- 🎭 5 default roles
- 🔐 Fine-grained permissions
- 🏪 Multi-store support
- 🔄 Dynamic role assignment
- 📊 Complete audit trail

For detailed API reference, see [RBAC_GUIDE.md](./RBAC_GUIDE.md)
