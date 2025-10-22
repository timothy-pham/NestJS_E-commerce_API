# RBAC System - Quick Start Example

This document provides a quick practical example of using the RBAC system.

## Scenario: Setting up a Retail Chain

Let's set up a retail chain with multiple stores and different user roles.

### Step 1: Start Fresh

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env - make sure MongoDB URI is correct
# MONGODB_URI=mongodb://localhost:27017/ecommerce

# Build the application
npm run build

# Seed RBAC data
npm run seed:rbac

# Start the application
npm run start:dev
```

### Step 2: Register Users

**CEO/Admin User:**
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ceo@retailcorp.com",
    "password": "SecurePass123!",
    "firstName": "Jane",
    "lastName": "Smith"
  }'
```

Save the access token as `CEO_TOKEN`.

**Store Manager:**
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "manager.downtown@retailcorp.com",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

Save the access token as `MANAGER_TOKEN`.

**Sales Staff:**
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "staff.downtown@retailcorp.com",
    "password": "SecurePass123!",
    "firstName": "Alice",
    "lastName": "Johnson"
  }'
```

Save the access token as `STAFF_TOKEN`.

### Step 3: Get Role IDs

```bash
curl -X GET http://localhost:3000/roles \
  -H "Authorization: Bearer $CEO_TOKEN"
```

From the response, note down the `_id` for:
- `super_admin` → SUPER_ADMIN_ROLE_ID
- `organization_admin` → ORG_ADMIN_ROLE_ID
- `store_manager` → STORE_MANAGER_ROLE_ID
- `staff` → STAFF_ROLE_ID

### Step 4: Assign Super Admin to CEO

```bash
curl -X POST http://localhost:3000/user-roles/assign \
  -H "Authorization: Bearer $CEO_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "CEO_USER_ID",
    "roleId": "SUPER_ADMIN_ROLE_ID",
    "scope": "system"
  }'
```

### Step 5: Create Organization

```bash
curl -X POST http://localhost:3000/organizations \
  -H "Authorization: Bearer $CEO_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "RetailCorp",
    "description": "National retail chain"
  }'
```

Save the organization ID as `ORG_ID`.

### Step 6: Create Stores

**Downtown Store:**
```bash
curl -X POST http://localhost:3000/stores \
  -H "Authorization: Bearer $CEO_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Downtown Store",
    "organizationId": "ORG_ID",
    "address": "123 Main St, Downtown",
    "phone": "+1-555-0101"
  }'
```

Save as `DOWNTOWN_STORE_ID`.

**Uptown Store:**
```bash
curl -X POST http://localhost:3000/stores \
  -H "Authorization: Bearer $CEO_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Uptown Store",
    "organizationId": "ORG_ID",
    "address": "456 High St, Uptown",
    "phone": "+1-555-0102"
  }'
```

Save as `UPTOWN_STORE_ID`.

### Step 7: Assign Roles to Users

**Make John a Store Manager at Downtown Store:**
```bash
curl -X POST http://localhost:3000/user-roles/assign \
  -H "Authorization: Bearer $CEO_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "MANAGER_USER_ID",
    "roleId": "STORE_MANAGER_ROLE_ID",
    "scope": "store",
    "scopeId": "DOWNTOWN_STORE_ID"
  }'
```

**Make Alice a Staff member at Downtown Store:**
```bash
curl -X POST http://localhost:3000/user-roles/assign \
  -H "Authorization: Bearer $CEO_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "STAFF_USER_ID",
    "roleId": "STAFF_ROLE_ID",
    "scope": "store",
    "scopeId": "DOWNTOWN_STORE_ID"
  }'
```

### Step 8: Test Permissions

**Alice (Staff) creates an order at Downtown Store:**
```bash
# Login as Alice to get fresh token with roles
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "staff.downtown@retailcorp.com",
    "password": "SecurePass123!"
  }'

# Create order
curl -X POST http://localhost:3000/orders \
  -H "Authorization: Bearer $STAFF_TOKEN" \
  -H "x-store-id: $DOWNTOWN_STORE_ID" \
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

**Expected:** ✅ Success (Staff can create orders)

**Alice tries to update order status:**
```bash
curl -X PATCH http://localhost:3000/orders/ORDER_ID/status \
  -H "Authorization: Bearer $STAFF_TOKEN" \
  -H "x-store-id: $DOWNTOWN_STORE_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "processing"
  }'
```

**Expected:** ❌ Forbidden (Staff cannot update order status, needs manager role)

**John (Manager) updates order status:**
```bash
# Login as John
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "manager.downtown@retailcorp.com",
    "password": "SecurePass123!"
  }'

# Update order
curl -X PATCH http://localhost:3000/orders/ORDER_ID/status \
  -H "Authorization: Bearer $MANAGER_TOKEN" \
  -H "x-store-id: $DOWNTOWN_STORE_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "processing"
  }'
```

**Expected:** ✅ Success (Manager can update order status)

**John tries to access Uptown Store orders:**
```bash
curl -X GET http://localhost:3000/orders \
  -H "Authorization: Bearer $MANAGER_TOKEN" \
  -H "x-store-id: $UPTOWN_STORE_ID"
```

**Expected:** ❌ Forbidden (Manager only has access to Downtown Store)

**CEO accesses all stores:**
```bash
curl -X GET http://localhost:3000/stores \
  -H "Authorization: Bearer $CEO_TOKEN"
```

**Expected:** ✅ Success (Super admin can see all stores)

### Step 9: Check User Permissions

**Alice checks her permissions:**
```bash
curl -X GET "http://localhost:3000/user-roles/me/permissions?storeId=$DOWNTOWN_STORE_ID" \
  -H "Authorization: Bearer $STAFF_TOKEN"
```

**Response:**
```json
{
  "roles": ["staff"],
  "permissions": [
    "orders:create",
    "orders:read",
    "products:read"
  ],
  "userRoles": [...]
}
```

**John checks his permissions:**
```bash
curl -X GET "http://localhost:3000/user-roles/me/permissions?storeId=$DOWNTOWN_STORE_ID" \
  -H "Authorization: Bearer $MANAGER_TOKEN"
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

### Step 10: Multi-Store Scenario

**Make John manager of BOTH stores:**
```bash
curl -X POST http://localhost:3000/user-roles/assign \
  -H "Authorization: Bearer $CEO_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "MANAGER_USER_ID",
    "roleId": "STORE_MANAGER_ROLE_ID",
    "scope": "store",
    "scopeId": "UPTOWN_STORE_ID"
  }'
```

**Now John can manage both stores:**
```bash
# Access Downtown Store
curl -X GET http://localhost:3000/orders \
  -H "Authorization: Bearer $MANAGER_TOKEN" \
  -H "x-store-id: $DOWNTOWN_STORE_ID"

# Access Uptown Store
curl -X GET http://localhost:3000/orders \
  -H "Authorization: Bearer $MANAGER_TOKEN" \
  -H "x-store-id: $UPTOWN_STORE_ID"
```

Both should work! ✅

## Visual Permission Matrix

| User | Role | Store | Create Order | Update Order | Delete Order | Manage Users |
|------|------|-------|--------------|--------------|--------------|--------------|
| Jane (CEO) | super_admin | All | ✅ | ✅ | ✅ | ✅ |
| John (Manager) | store_manager | Downtown | ✅ | ✅ | ❌ | ❌ |
| John (Manager) | store_manager | Uptown | ✅ | ✅ | ❌ | ❌ |
| Alice (Staff) | staff | Downtown | ✅ | ❌ | ❌ | ❌ |

## Key Takeaways

1. **Hierarchical Structure**: Organization → Stores → Users
2. **Flexible Roles**: Users can have different roles in different stores
3. **Store Context**: Use `x-store-id` header to specify which store to operate on
4. **Scope-Based Access**: Permissions are evaluated based on role scope
5. **System Roles**: Pre-defined roles (super_admin, etc.) cannot be deleted
6. **Dynamic Assignment**: Roles can be assigned/revoked at runtime

## Next Steps

1. Create custom roles for specific needs
2. Add more fine-grained permissions
3. Implement audit logging for role changes
4. Add Redis caching for permission lookups
5. Set up monitoring for unauthorized access attempts

## Useful Commands

```bash
# List all roles
curl -X GET http://localhost:3000/roles \
  -H "Authorization: Bearer $TOKEN"

# Get user's roles
curl -X GET http://localhost:3000/user-roles/user/USER_ID \
  -H "Authorization: Bearer $TOKEN"

# List all permissions
curl -X GET http://localhost:3000/permissions \
  -H "Authorization: Bearer $TOKEN"

# List stores in organization
curl -X GET "http://localhost:3000/stores?organizationId=ORG_ID" \
  -H "Authorization: Bearer $TOKEN"
```

## Swagger UI

For interactive testing, open:
```
http://localhost:3000/api
```

All endpoints are documented with:
- Required permissions
- Example requests
- Response schemas
- Try it out functionality

---

**Need help?** Check [RBAC_GUIDE.md](./RBAC_GUIDE.md) for detailed documentation.
