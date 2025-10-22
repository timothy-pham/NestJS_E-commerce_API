# NestJS E-commerce API

A comprehensive REST API for e-commerce backend built with NestJS, MongoDB, and JWT authentication.

## Features

- 🔐 **JWT Authentication** - Secure user authentication with JWT tokens
- 🛡️ **RBAC System** - Role-Based Access Control with multi-store support
- 🏢 **Multi-Tenant Architecture** - Organization → Store → User hierarchy
- 👥 **User Management** - Complete user CRUD operations with role-based access
- 📦 **Product Management** - Full product catalog with category organization
- 🛒 **Order Management** - Order creation with stock management
- 🏷️ **Category Management** - Product categorization system
- 🎭 **Role & Permission Management** - Flexible role and permission assignment
- 🏪 **Store Context** - Multi-store operations via x-store-id header
- 📝 **Swagger Documentation** - Interactive API documentation at `/api`
- ✅ **Validation** - Request validation using class-validator
- 🔒 **Security** - JWT guards and secure password hashing with bcryptjs
- 🗄️ **MongoDB** - NoSQL database with Mongoose ODM
- 🧪 **Testing** - Comprehensive unit tests with Jest

## Tech Stack

- **NestJS** - Progressive Node.js framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - JSON Web Token authentication
- **Passport** - Authentication middleware
- **Swagger** - API documentation
- **class-validator** - DTO validation
- **bcryptjs** - Password hashing

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/timothy-pham/nestjs-api.git
cd nestjs-api
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

4. Configure your environment variables in `.env`:
```env
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=1d
PORT=3000
NODE_ENV=development
```

5. Seed the RBAC system with default roles and permissions:
```bash
npm run seed:rbac
```

This will create:
- Default roles: `super_admin`, `organization_admin`, `store_owner`, `store_manager`, `staff`
- Permissions for all resources across different scopes
- Role-permission associations

## Running the Application

### Development mode
```bash
npm run start:dev
```

### Production mode
```bash
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3000`

## API Documentation

Once the application is running, visit:
- **Swagger UI**: `http://localhost:3000/api`
- **RBAC Guide**: See [RBAC_GUIDE.md](./RBAC_GUIDE.md) for detailed RBAC documentation

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user (returns JWT with roles)

### Organizations (RBAC)
- `POST /organizations` - Create organization (super_admin only)
- `GET /organizations` - List all organizations
- `GET /organizations/:id` - Get organization details
- `PATCH /organizations/:id` - Update organization (super_admin, organization_admin)
- `DELETE /organizations/:id` - Delete organization (super_admin only)

### Stores (RBAC)
- `POST /stores` - Create store (super_admin, organization_admin)
- `GET /stores` - List all stores
- `GET /stores/:id` - Get store details
- `PATCH /stores/:id` - Update store (super_admin, organization_admin, store_owner)
- `DELETE /stores/:id` - Delete store (super_admin, organization_admin)

### Roles (RBAC)
- `POST /roles` - Create role (super_admin, organization_admin)
- `GET /roles` - List all roles
- `GET /roles/:id` - Get role details
- `PATCH /roles/:id` - Update role (super_admin, organization_admin)
- `POST /roles/:id/permissions/add` - Add permissions to role
- `POST /roles/:id/permissions/remove` - Remove permissions from role
- `DELETE /roles/:id` - Delete role (super_admin only, cannot delete system roles)

### Permissions (RBAC)
- `POST /permissions` - Create permission (super_admin only)
- `GET /permissions` - List all permissions
- `GET /permissions/:id` - Get permission details
- `PATCH /permissions/:id` - Update permission (super_admin only)
- `DELETE /permissions/:id` - Delete permission (super_admin only)

### User Roles (RBAC)
- `POST /user-roles/assign` - Assign role to user
- `POST /user-roles/revoke` - Revoke role from user
- `GET /user-roles/user/:userId` - Get user's roles
- `GET /user-roles/user/:userId/permissions` - Get user's permissions
- `GET /user-roles/me/permissions` - Get current user's permissions
- `GET /user-roles/:id` - Get user role details
- `PATCH /user-roles/:id` - Update user role

### Users
- `POST /users` - Create a new user
- `GET /users` - Get all users (requires authentication)
- `GET /users/:id` - Get user by ID (requires authentication)
- `PATCH /users/:id` - Update user (requires authentication)
- `DELETE /users/:id` - Delete user (requires authentication)

### Categories
- `POST /categories` - Create category (requires authentication)
- `GET /categories` - Get all categories
- `GET /categories/:id` - Get category by ID
- `PATCH /categories/:id` - Update category (requires authentication)
- `DELETE /categories/:id` - Delete category (requires authentication)

### Products
- `POST /products` - Create product (requires authentication)
- `GET /products` - Get all products
- `GET /products?category=:categoryId` - Get products by category
- `GET /products/:id` - Get product by ID
- `PATCH /products/:id` - Update product (requires authentication)
- `DELETE /products/:id` - Delete product (requires authentication)

### Orders (with RBAC Demo)
- `POST /orders` - Create order (requires orders:create permission)
- `GET /orders` - Get orders (role-based: super_admin, organization_admin, store_owner, store_manager, staff)
  - Use `x-store-id` header for store context
- `GET /orders/:id` - Get order by ID (requires orders:read permission)
- `PATCH /orders/:id/status` - Update order status (requires store_manager or above)
- `DELETE /orders/:id` - Delete order (requires store_owner or above)

## RBAC System

This API implements a comprehensive Role-Based Access Control system:

### Default Roles
- **super_admin**: Full system access
- **organization_admin**: Manages organization and all stores
- **store_owner**: Full store management
- **store_manager**: Manages products and orders
- **staff**: Basic order and product access

### Store Context
Include the `x-store-id` header in requests to set the store context:
```bash
curl -X GET http://localhost:3000/orders \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "x-store-id: STORE_ID"
```

For detailed RBAC documentation, see [RBAC_GUIDE.md](./RBAC_GUIDE.md)

## Project Structure

```
src/
├── auth/                  # Authentication module
│   ├── dto/              # Data transfer objects
│   ├── guards/           # JWT auth guard
│   ├── strategies/       # Passport strategies
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── auth.module.ts
├── organizations/         # Organization management (RBAC)
│   ├── dto/
│   ├── organization.schema.ts
│   ├── organizations.controller.ts
│   ├── organizations.service.ts
│   └── organizations.module.ts
├── stores/               # Store management (RBAC)
│   ├── dto/
│   ├── store.schema.ts
│   ├── stores.controller.ts
│   ├── stores.service.ts
│   └── stores.module.ts
├── roles/                # Role management (RBAC)
│   ├── dto/
│   ├── role.schema.ts
│   ├── roles.controller.ts
│   ├── roles.service.ts
│   └── roles.module.ts
├── permissions/          # Permission management (RBAC)
│   ├── dto/
│   ├── permission.schema.ts
│   ├── permissions.controller.ts
│   ├── permissions.service.ts
│   └── permissions.module.ts
├── user-roles/           # User-Role assignment (RBAC)
│   ├── dto/
│   ├── user-role.schema.ts
│   ├── user-roles.controller.ts
│   ├── user-roles.service.ts
│   └── user-roles.module.ts
├── users/                # User management module
│   ├── dto/
│   ├── user.schema.ts
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── users.module.ts
├── categories/           # Category management module
│   ├── dto/
│   ├── category.schema.ts
│   ├── categories.controller.ts
│   ├── categories.service.ts
│   └── categories.module.ts
├── products/             # Product management module
│   ├── dto/
│   ├── product.schema.ts
│   ├── products.controller.ts
│   ├── products.service.ts
│   └── products.module.ts
├── orders/               # Order management module
│   ├── dto/
│   ├── order.schema.ts
│   ├── orders.controller.ts
│   ├── orders.service.ts
│   └── orders.module.ts
├── common/               # Shared resources
│   ├── decorators/       # Custom decorators (@Roles, @Permissions, @GetUser, @GetStoreId)
│   ├── guards/           # Custom guards (RolesGuard, PermissionsGuard)
│   ├── middleware/       # Middleware (StoreContextMiddleware)
│   └── pipes/           # Custom pipes
├── app.module.ts        # Root module
└── main.ts              # Application entry point
```

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Building for Production

```bash
npm run build
```

## Security Considerations

- Change `JWT_SECRET` in production to a strong, random string
- Use environment variables for sensitive data
- Enable HTTPS in production
- Implement rate limiting for API endpoints
- Keep dependencies up to date
- Use MongoDB authentication in production

## License

ISC

## Author

Timothy Pham