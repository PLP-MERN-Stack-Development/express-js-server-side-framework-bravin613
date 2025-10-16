# Product API - Express.js RESTful Service

A fully functional RESTful API built with Express.js for managing products with CRUD operations, authentication, validation, and advanced features.

## 🚀 Features

- ✅ Complete CRUD operations for products
- ✅ Custom middleware (logging, authentication, validation)
- ✅ Global error handling with custom error classes
- ✅ Query filtering by category and stock status
- ✅ Pagination support
- ✅ Product search functionality
- ✅ Statistics endpoint
- ✅ API key authentication
- ✅ Comprehensive input validation

## 📋 Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn package manager

## 🛠️ Installation

1. Clone the repository:
```bash
git clone 
cd
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (see `.env.example`):
```bash
cp .env.example .env
```

4. Start the server:
```bash
# Development mode
npm start

# Or with nodemon (for auto-restart)
npm run dev
```

The server will run on `http://localhost:3000` by default.

## 📚 API Documentation

### Base URL
```
http://localhost:3000
```

### Authentication

Protected endpoints require an API key in the request headers:
```
x-api-key: your-secret-api-key
```

**Protected Endpoints:**
- POST `/api/products`
- PUT `/api/products/:id`
- DELETE `/api/products/:id`

---

## 🔌 API Endpoints

### 1. Get All Products
```http
GET /api/products
```

**Query Parameters:**
- `category` (optional) - Filter by category (e.g., electronics, kitchen, furniture)
- `inStock` (optional) - Filter by stock status (true/false)
- `page` (optional) - Page number for pagination (default: 1)
- `limit` (optional) - Items per page (default: 10)

**Example Request:**
```bash
curl http://localhost:3000/api/products?category=electronics&page=1&limit=5
```

**Example Response:**
```json
{
  "data": [
    {
      "id": "1",
      "name": "Laptop",
      "description": "High-performance laptop with 16GB RAM",
      "price": 1200,
      "category": "electronics",
      "inStock": true
    }
  ],
  "pagination": {
    "total": 2,
    "page": 1,
    "limit": 5,
    "totalPages": 1
  }
}
```

---

### 2. Get Product by ID
```http
GET /api/products/:id
```

**Example Request:**
```bash
curl http://localhost:3000/api/products/1
```

**Example Response:**
```json
{
  "id": "1",
  "name": "Laptop",
  "description": "High-performance laptop with 16GB RAM",
  "price": 1200,
  "category": "electronics",
  "inStock": true
}
```

---

### 3. Search Products
```http
GET /api/products/search?q=query
```

**Query Parameters:**
- `q` (required) - Search query for name or description

**Example Request:**
```bash
curl http://localhost:3000/api/products/search?q=laptop
```

**Example Response:**
```json
{
  "query": "laptop",
  "count": 1,
  "data": [
    {
      "id": "1",
      "name": "Laptop",
      "description": "High-performance laptop with 16GB RAM",
      "price": 1200,
      "category": "electronics",
      "inStock": true
    }
  ]
}
```

---

### 4. Get Product Statistics
```http
GET /api/products/stats
```

**Example Request:**
```bash
curl http://localhost:3000/api/products/stats
```

**Example Response:**
```json
{
  "totalProducts": 5,
  "inStock": 4,
  "outOfStock": 1,
  "byCategory": {
    "electronics": 2,
    "kitchen": 2,
    "furniture": 1
  },
  "averagePrice": 465,
  "totalValue": 2325
}
```

---

### 5. Create Product (Protected)
```http
POST /api/products
```

**Headers:**
```
Content-Type: application/json
x-api-key: your-secret-api-key
```

**Request Body:**
```json
{
  "name": "Wireless Mouse",
  "description": "Ergonomic wireless mouse with USB receiver",
  "price": 29.99,
  "category": "electronics",
  "inStock": true
}
```

**Example Request:**
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-secret-api-key" \
  -d '{
    "name": "Wireless Mouse",
    "description": "Ergonomic wireless mouse with USB receiver",
    "price": 29.99,
    "category": "electronics",
    "inStock": true
  }'
```

**Example Response:**
```json
{
  "message": "Product created successfully",
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "Wireless Mouse",
    "description": "Ergonomic wireless mouse with USB receiver",
    "price": 29.99,
    "category": "electronics",
    "inStock": true
  }
}
```

---

### 6. Update Product (Protected)
```http
PUT /api/products/:id
```

**Headers:**
```
Content-Type: application/json
x-api-key: your-secret-api-key
```

**Request Body:**
```json
{
  "name": "Updated Product Name",
  "description": "Updated description",
  "price": 99.99,
  "category": "electronics",
  "inStock": false
}
```

**Example Request:**
```bash
curl -X PUT http://localhost:3000/api/products/1 \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-secret-api-key" \
  -d '{
    "name": "Gaming Laptop",
    "description": "High-performance gaming laptop",
    "price": 1500,
    "category": "electronics",
    "inStock": true
  }'
```

**Example Response:**
```json
{
  "message": "Product updated successfully",
  "data": {
    "id": "1",
    "name": "Gaming Laptop",
    "description": "High-performance gaming laptop",
    "price": 1500,
    "category": "electronics",
    "inStock": true
  }
}
```

---

### 7. Delete Product (Protected)
```http
DELETE /api/products/:id
```

**Headers:**
```
x-api-key: your-secret-api-key
```

**Example Request:**
```bash
curl -X DELETE http://localhost:3000/api/products/1 \
  -H "x-api-key: your-secret-api-key"
```

**Example Response:**
```json
{
  "message": "Product deleted successfully",
  "data": {
    "id": "1",
    "name": "Laptop",
    "description": "High-performance laptop with 16GB RAM",
    "price": 1200,
    "category": "electronics",
    "inStock": true
  }
}
```

---

## ⚠️ Error Responses

The API uses standard HTTP status codes and returns errors in the following format:

```json
{
  "error": {
    "name": "ErrorType",
    "message": "Error description"
  }
}
```

### Status Codes
- `200` - OK
- `201` - Created
- `400` - Bad Request (Validation Error)
- `401` - Unauthorized (Authentication Error)
- `404` - Not Found
- `500` - Internal Server Error

### Error Examples

**Validation Error (400):**
```json
{
  "error": {
    "name": "ValidationError",
    "message": "Price is required and must be a non-negative number"
  }
}
```

**Authentication Error (401):**
```json
{
  "error": {
    "name": "AuthenticationError",
    "message": "API key is required"
  }
}
```

**Not Found Error (404):**
```json
{
  "error": {
    "name": "NotFoundError",
    "message": "Product with id 999 not found"
  }
}
```

---

## 🧪 Testing

You can test the API using:

1. **cURL** (command line)
2. **Postman** (GUI application)
3. **Insomnia** (GUI application)
4. **VS Code REST Client** extension

### Example Test Workflow

1. Get all products:
```bash
curl http://localhost:3000/api/products
```

2. Create a new product:
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-secret-api-key" \
  -d '{"name":"Test Product","description":"Test","price":10,"category":"test","inStock":true}'
```

3. Search for products:
```bash
curl http://localhost:3000/api/products/search?q=test
```

---

## 📁 Project Structure

```
.
├── server.js           # Main application file
├── package.json        # Project dependencies
├── .env               # Environment variables (not in git)
├── .env.example       # Example environment variables
└── README.md          # This file
```

---

## 🔐 Environment Variables

See `.env.example` for all available environment variables:

```env
PORT=3000
API_KEY=your-secret-api-key
NODE_ENV=development
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is part of the Week 2 Express.js assignment.

---

## 👨‍💻 Author

Bravin Musali - Week 2 Assignment

---

## 📞 Support

If you have any questions or issues, please open an issue in the GitHub repository.