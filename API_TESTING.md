# API Testing Guide

This guide shows you how to test all the API endpoints using curl or any HTTP client.

## Prerequisites
- Make sure MongoDB is running
- Start the application with `npm run start:dev`
- API will be available at `http://localhost:3000`

## 1. Authentication

### Register a new user
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user"
  }
}
```

### Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

**Save the access_token from the response for authenticated requests!**

## 2. Categories

### Create a category (requires authentication)
```bash
curl -X POST http://localhost:3000/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name": "Electronics",
    "description": "Electronic devices and accessories"
  }'
```

### Get all categories
```bash
curl http://localhost:3000/categories
```

### Get category by ID
```bash
curl http://localhost:3000/categories/CATEGORY_ID
```

### Update category (requires authentication)
```bash
curl -X PATCH http://localhost:3000/categories/CATEGORY_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "description": "Updated description"
  }'
```

### Delete category (requires authentication)
```bash
curl -X DELETE http://localhost:3000/categories/CATEGORY_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 3. Products

### Create a product (requires authentication)
```bash
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name": "iPhone 13 Pro",
    "description": "Latest Apple smartphone",
    "price": 999.99,
    "stock": 100,
    "category": "CATEGORY_ID",
    "images": ["image1.jpg", "image2.jpg"]
  }'
```

### Get all products
```bash
curl http://localhost:3000/products
```

### Get products by category
```bash
curl http://localhost:3000/products?category=CATEGORY_ID
```

### Get product by ID
```bash
curl http://localhost:3000/products/PRODUCT_ID
```

### Update product (requires authentication)
```bash
curl -X PATCH http://localhost:3000/products/PRODUCT_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "price": 899.99,
    "stock": 80
  }'
```

### Delete product (requires authentication)
```bash
curl -X DELETE http://localhost:3000/products/PRODUCT_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 4. Orders

### Create an order (requires authentication)
```bash
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "items": [
      {
        "product": "PRODUCT_ID",
        "quantity": 2,
        "price": 999.99
      }
    ],
    "shippingAddress": "123 Main St, City, Country",
    "notes": "Please deliver before 5 PM"
  }'
```

### Get all orders (user's orders or all if admin)
```bash
curl http://localhost:3000/orders \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Get order by ID
```bash
curl http://localhost:3000/orders/ORDER_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Update order status (requires authentication)
```bash
curl -X PATCH http://localhost:3000/orders/ORDER_ID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "status": "shipped"
  }'
```

Status options: `pending`, `processing`, `shipped`, `delivered`, `cancelled`

### Delete order (requires authentication)
```bash
curl -X DELETE http://localhost:3000/orders/ORDER_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 5. Users

### Create a user
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123",
    "firstName": "Admin",
    "lastName": "User",
    "role": "admin"
  }'
```

### Get all users (requires authentication)
```bash
curl http://localhost:3000/users \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Get user by ID (requires authentication)
```bash
curl http://localhost:3000/users/USER_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Update user (requires authentication)
```bash
curl -X PATCH http://localhost:3000/users/USER_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "firstName": "Updated Name"
  }'
```

### Delete user (requires authentication)
```bash
curl -X DELETE http://localhost:3000/users/USER_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Swagger Documentation

For an interactive API testing experience, visit:
```
http://localhost:3000/api
```

The Swagger UI provides:
- Complete API documentation
- Interactive testing interface
- Request/response schemas
- Authentication testing

## Tips

1. **Save your JWT token**: After login/register, save the `access_token` and use it in the Authorization header
2. **Replace IDs**: Replace `CATEGORY_ID`, `PRODUCT_ID`, `ORDER_ID`, and `USER_ID` with actual IDs from your responses
3. **Check stock**: When creating orders, ensure products have sufficient stock
4. **Admin access**: Some operations may require admin role
