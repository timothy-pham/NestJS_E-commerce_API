# NestJS E-commerce API

A comprehensive REST API for e-commerce backend built with NestJS, MongoDB, and JWT authentication.

## Features

- 🔐 **JWT Authentication** - Secure user authentication with JWT tokens
- 👥 **User Management** - Complete user CRUD operations with role-based access
- 📦 **Product Management** - Full product catalog with category organization
- 🛒 **Order Management** - Order creation with stock management
- 🏷️ **Category Management** - Product categorization system
- 📝 **Swagger Documentation** - Interactive API documentation at `/api`
- ✅ **Validation** - Request validation using class-validator
- 🔒 **Security** - JWT guards and secure password hashing with bcryptjs
- 🗄️ **MongoDB** - NoSQL database with Mongoose ODM

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

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user

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

### Orders
- `POST /orders` - Create order (requires authentication)
- `GET /orders` - Get all orders (admin) or user orders (requires authentication)
- `GET /orders/:id` - Get order by ID (requires authentication)
- `PATCH /orders/:id/status` - Update order status (requires authentication)
- `DELETE /orders/:id` - Delete order (requires authentication)

## Project Structure

```
src/
├── auth/                 # Authentication module
│   ├── dto/             # Data transfer objects
│   ├── guards/          # JWT auth guard
│   ├── strategies/      # Passport strategies
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── auth.module.ts
├── users/               # User management module
│   ├── dto/
│   ├── user.schema.ts
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── users.module.ts
├── categories/          # Category management module
│   ├── dto/
│   ├── category.schema.ts
│   ├── categories.controller.ts
│   ├── categories.service.ts
│   └── categories.module.ts
├── products/            # Product management module
│   ├── dto/
│   ├── product.schema.ts
│   ├── products.controller.ts
│   ├── products.service.ts
│   └── products.module.ts
├── orders/              # Order management module
│   ├── dto/
│   ├── order.schema.ts
│   ├── orders.controller.ts
│   ├── orders.service.ts
│   └── orders.module.ts
├── common/              # Shared resources
│   ├── decorators/      # Custom decorators
│   ├── guards/          # Custom guards
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