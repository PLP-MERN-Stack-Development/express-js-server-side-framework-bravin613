// server.js - Complete Express server with RESTful API

const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Sample in-memory products database
let products = [
  {
    id: '1',
    name: 'Laptop',
    description: 'High-performance laptop with 16GB RAM',
    price: 1200,
    category: 'electronics',
    inStock: true
  },
  {
    id: '2',
    name: 'Smartphone',
    description: 'Latest model with 128GB storage',
    price: 800,
    category: 'electronics',
    inStock: true
  },
  {
    id: '3',
    name: 'Coffee Maker',
    description: 'Programmable coffee maker with timer',
    price: 50,
    category: 'kitchen',
    inStock: false
  },
  {
    id: '4',
    name: 'Desk Chair',
    description: 'Ergonomic office chair',
    price: 250,
    category: 'furniture',
    inStock: true
  },
  {
    id: '5',
    name: 'Water Bottle',
    description: 'Insulated stainless steel bottle',
    price: 25,
    category: 'kitchen',
    inStock: true
  }
];

// ==================== CUSTOM ERROR CLASSES ====================
class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404;
  }
}

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
  }
}

class AuthenticationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AuthenticationError';
    this.statusCode = 401;
  }
}

// ==================== MIDDLEWARE ====================

// Custom logger middleware
const logger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
};

// Authentication middleware
const authenticate = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  const validApiKey = process.env.API_KEY || 'your-secret-api-key';
  
  if (!apiKey) {
    return next(new AuthenticationError('API key is required'));
  }
  
  if (apiKey !== validApiKey) {
    return next(new AuthenticationError('Invalid API key'));
  }
  
  next();
};

// Validation middleware for product creation/update
const validateProduct = (req, res, next) => {
  const { name, description, price, category, inStock } = req.body;
  const errors = [];
  
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push('Name is required and must be a non-empty string');
  }
  
  if (!description || typeof description !== 'string' || description.trim().length === 0) {
    errors.push('Description is required and must be a non-empty string');
  }
  
  if (price === undefined || typeof price !== 'number' || price < 0) {
    errors.push('Price is required and must be a non-negative number');
  }
  
  if (!category || typeof category !== 'string' || category.trim().length === 0) {
    errors.push('Category is required and must be a non-empty string');
  }
  
  if (inStock === undefined || typeof inStock !== 'boolean') {
    errors.push('inStock is required and must be a boolean');
  }
  
  if (errors.length > 0) {
    return next(new ValidationError(errors.join(', ')));
  }
  
  next();
};

// Async error wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Apply middleware
app.use(bodyParser.json());
app.use(logger);

// ==================== ROUTES ====================

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Product API!',
    endpoints: {
      products: '/api/products',
      productById: '/api/products/:id',
      search: '/api/products/search?q=query',
      stats: '/api/products/stats'
    }
  });
});

// GET /api/products - Get all products with filtering and pagination
app.get('/api/products', asyncHandler(async (req, res) => {
  const { category, inStock, page = 1, limit = 10 } = req.query;
  let filteredProducts = [...products];
  
  // Filter by category
  if (category) {
    filteredProducts = filteredProducts.filter(
      p => p.category.toLowerCase() === category.toLowerCase()
    );
  }
  
  // Filter by stock status
  if (inStock !== undefined) {
    const stockStatus = inStock === 'true';
    filteredProducts = filteredProducts.filter(p => p.inStock === stockStatus);
  }
  
  // Pagination
  const startIndex = (parseInt(page) - 1) * parseInt(limit);
  const endIndex = startIndex + parseInt(limit);
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
  
  res.json({
    data: paginatedProducts,
    pagination: {
      total: filteredProducts.length,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(filteredProducts.length / parseInt(limit))
    }
  });
}));

// GET /api/products/search - Search products by name
app.get('/api/products/search', asyncHandler(async (req, res) => {
  const { q } = req.query;
  
  if (!q) {
    throw new ValidationError('Search query parameter "q" is required');
  }
  
  const searchResults = products.filter(p =>
    p.name.toLowerCase().includes(q.toLowerCase()) ||
    p.description.toLowerCase().includes(q.toLowerCase())
  );
  
  res.json({
    query: q,
    count: searchResults.length,
    data: searchResults
  });
}));

// GET /api/products/stats - Get product statistics
app.get('/api/products/stats', asyncHandler(async (req, res) => {
  const stats = {
    totalProducts: products.length,
    inStock: products.filter(p => p.inStock).length,
    outOfStock: products.filter(p => !p.inStock).length,
    byCategory: {},
    averagePrice: products.reduce((sum, p) => sum + p.price, 0) / products.length,
    totalValue: products.reduce((sum, p) => sum + p.price, 0)
  };
  
  // Count by category
  products.forEach(p => {
    stats.byCategory[p.category] = (stats.byCategory[p.category] || 0) + 1;
  });
  
  res.json(stats);
}));

// GET /api/products/:id - Get a specific product by ID
app.get('/api/products/:id', asyncHandler(async (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  
  if (!product) {
    throw new NotFoundError(`Product with id ${req.params.id} not found`);
  }
  
  res.json(product);
}));

// POST /api/products - Create a new product (requires authentication)
app.post('/api/products', authenticate, validateProduct, asyncHandler(async (req, res) => {
  const newProduct = {
    id: uuidv4(),
    name: req.body.name.trim(),
    description: req.body.description.trim(),
    price: req.body.price,
    category: req.body.category.trim().toLowerCase(),
    inStock: req.body.inStock
  };
  
  products.push(newProduct);
  
  res.status(201).json({
    message: 'Product created successfully',
    data: newProduct
  });
}));

// PUT /api/products/:id - Update an existing product (requires authentication)
app.put('/api/products/:id', authenticate, validateProduct, asyncHandler(async (req, res) => {
  const productIndex = products.findIndex(p => p.id === req.params.id);
  
  if (productIndex === -1) {
    throw new NotFoundError(`Product with id ${req.params.id} not found`);
  }
  
  const updatedProduct = {
    id: req.params.id,
    name: req.body.name.trim(),
    description: req.body.description.trim(),
    price: req.body.price,
    category: req.body.category.trim().toLowerCase(),
    inStock: req.body.inStock
  };
  
  products[productIndex] = updatedProduct;
  
  res.json({
    message: 'Product updated successfully',
    data: updatedProduct
  });
}));

// DELETE /api/products/:id - Delete a product (requires authentication)
app.delete('/api/products/:id', authenticate, asyncHandler(async (req, res) => {
  const productIndex = products.findIndex(p => p.id === req.params.id);
  
  if (productIndex === -1) {
    throw new NotFoundError(`Product with id ${req.params.id} not found`);
  }
  
  const deletedProduct = products.splice(productIndex, 1)[0];
  
  res.json({
    message: 'Product deleted successfully',
    data: deletedProduct
  });
}));

// ==================== ERROR HANDLING ====================

// 404 handler for undefined routes
app.use((req, res, next) => {
  next(new NotFoundError(`Route ${req.url} not found`));
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${err.name}: ${err.message}`);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    error: {
      name: err.name,
      message: message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
});

// ==================== SERVER START ====================

// Start the server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

// Export the app for testing purposes
module.exports = app;