# Backend Technical Documentation

## Table of Contents
- [Overview](#overview)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
- [Error Handling](#error-handling)
- [Validation](#validation)
- [Middleware](#middleware)
- [Database Schema](#database-schema)
- [Development Setup](#development-setup)

## Overview

The Bacteria-Phages Graph backend is a RESTful API built with **Node.js**, **Express.js**, and **TypeScript**. It provides authentication, user management, and Excel file processing capabilities for analyzing bacteria-phage relationships.

### Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: Prisma ORM
- **Validation**: Zod
- **Authentication**: JWT (JSON Web Tokens)
- **File Processing**: Custom Excel parser
- **Testing**: Vitest

### Key Features
- JWT-based authentication with refresh tokens
- Excel file upload and processing
- User management
- Comprehensive error handling
- Input validation with detailed error messages
- Cookie-based session management

## Architecture

The backend follows a **layered architecture** pattern:

```
Client Request
    ↓
Middleware (Auth, Validation, File Processing)
    ↓
Controllers (Business Logic)
    ↓
Services (Data Access)
    ↓
Database (Prisma ORM)
```

### Design Patterns
- **Router Pattern**: Base router class with route configuration
- **Middleware Pattern**: Modular request processing
- **Service Layer**: Separation of business logic and data access
- **Schema Validation**: Zod schemas for type-safe validation

## Project Structure

```
backend/
├── src/
│   ├── configs/          # Configuration files
│   │   ├── app.config.ts
│   │   ├── auth.config.ts
│   │   └── file.config.ts
│   ├── controllers/      # Request handlers
│   │   ├── auth.controller.ts
│   │   ├── excel.controller.ts
│   │   └── user.controller.ts
│   ├── middlewares/      # Request processing middleware
│   │   ├── auth.middleware.ts
│   │   ├── excel.middleware.ts
│   │   ├── file.middleware.ts
│   │   └── validation.middleware.ts
│   ├── routes/          # Route definitions
│   │   ├── auth.routes.ts
│   │   ├── excel.routes.ts
│   │   ├── router.ts
│   │   └── user.routes.ts
│   ├── services/        # Business logic layer
│   │   ├── auth.services.ts
│   │   ├── excel.services.ts
│   │   └── user.services.ts
│   ├── types/          # TypeScript type definitions
│   │   └── excel.types.ts
│   ├── utils/          # Utility functions
│   │   ├── excelParser.utils.ts
│   │   └── response.utils.ts
│   ├── validations/    # Zod validation schemas
│   │   ├── auth.schema.ts
│   │   └── excel.schema.ts
│   ├── app.ts          # Express app configuration
│   ├── db.ts           # Database connection
│   └── index.ts        # Application entry point
├── prisma/             # Database schema and migrations
│   ├── schema.prisma
│   └── migrations/
├── package.json
└── tsconfig.json
```

## Configuration

### Environment Variables
```bash
# Application
APP_HOST=localhost
APP_PORT=3000
NODE_ENV=development

# Database
DATABASE_URL="your-database-connection-string"

# JWT Authentication
JWT_SECRET="your-jwt-secret"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="your-refresh-secret"
JWT_REFRESH_EXPIRES_IN="7d"
```

### CORS Configuration
```typescript
origin: ['http://localhost:3000']
credentials: true
methods: ["GET", "POST", "DELETE", "PUT", "PATCH"]
```

## Authentication

The API uses **JWT-based authentication** with the following features:

### Token Types
1. **Access Token**: Short-lived (15 minutes) for API access
2. **Refresh Token**: Long-lived (7 days) for token renewal

### Cookie Management
- `accessToken`: HttpOnly, Secure, SameSite=Strict
- `refreshToken`: HttpOnly, Secure, SameSite=Strict

### Authentication Flow
1. User logs in with email/password
2. Server validates credentials
3. Server generates access and refresh tokens
4. Tokens stored as HTTP-only cookies
5. Access token used for API requests
6. Refresh token used to get new access tokens

## API Endpoints

### Base URL
```
http://localhost:3000/api
```

### Authentication Endpoints (`/api/auth`)

#### POST `/api/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "password_confirmation": "SecurePass123!",
  "username": "myusername"
}
```

**Success Response (200):**
```json
{
  "ok": true,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "username": "myusername"
  }
}
```

**Error Responses:**
- **400 Bad Request**: Email already exists
```json
{
  "ok": false,
  "message": "An account with email \"user@example.com\" already exists. Please use a different email address or sign in to your existing account.",
  "data": null
}
```

- **422 Validation Error**: Invalid input data
```json
{
  "ok": false,
  "message": "Validation error",
  "errors": {
    "email": ["Invalid email format"],
    "password": ["Password must be at least 8 characters long"],
    "password_confirmation": ["Passwords do not match"],
    "username": ["Username must be at least 6 characters long"]
  }
}
```

#### POST `/api/auth/login`
Authenticate user and create session.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Success Response (200):**
```json
{
  "ok": true,
  "message": "Logged in successfully",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "username": "myusername"
  }
}
```

**Error Responses:**
- **400 Bad Request**: Invalid credentials
```json
{
  "ok": false,
  "message": "No account found with email address \"user@example.com\". Please check your email or register for a new account.",
  "data": null
}
```

```json
{
  "ok": false,
  "message": "The password you entered is incorrect. Please try again or reset your password.",
  "data": null
}
```

#### POST `/api/auth/logout`
**Authentication Required**

Logout user and clear session.

**Success Response (200):**
```json
{
  "ok": true,
  "message": "Logged out successfully",
  "data": null
}
```

#### POST `/api/auth/refresh-token`
**Authentication Required (Refresh Token)**

Refresh the access token.

**Success Response (200):**
```json
{
  "ok": true,
  "message": "Access token refreshed successfully",
  "data": {
    "message": "Access token refreshed successfully"
  }
}
```

**Error Response:**
- **401 Unauthorized**: Invalid or expired refresh token
```json
{
  "ok": false,
  "message": "Invalid refresh token",
  "data": null
}
```

### User Endpoints (`/api/user`)

#### GET `/api/user/info`
**Authentication Required**

Get current user information.

**Success Response (200):**
```json
{
  "ok": true,
  "message": "User information retrieved successfully",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "username": "myusername",
    "createdAt": "2025-09-05T10:30:00.000Z"
  }
}
```

### Excel File Endpoints (`/api/excel`)

#### POST `/api/excel/upload`
**Authentication Required**

Upload and process an Excel file.

**Request:**
- Content-Type: `multipart/form-data`
- Field name: `excelFile`
- Accepted formats: `.xlsx`, `.xls`
- Max size: 10MB

**Success Response (200):**
```json
{
  "ok": true,
  "message": "Excel file \"bacteria_data.xlsx\" processed successfully.",
  "data": {
    "filename": "bacteria_data.xlsx",
    "recordsProcessed": 150,
    "size": 2048576
  }
}
```

**Error Responses:**
- **400 Bad Request**: File validation errors
```json
{
  "ok": false,
  "message": "No file was uploaded. Please select an Excel file (.xlsx or .xls) to upload.",
  "data": null
}
```

```json
{
  "ok": false,
  "message": "File size (15MB) exceeds the 10MB limit. Please upload a smaller file.",
  "data": null
}
```

```json
{
  "ok": false,
  "message": "No phage data found in the Excel file. Please ensure your file contains phage information in the expected format.",
  "data": null
}
```

- **422 Validation Error**: File format issues
```json
{
  "ok": false,
  "message": "Validation error",
  "errors": {
    "mimetype": ["Invalid file type. Only Excel files are allowed."],
    "size": ["File size must be positive"]
  }
}
```

#### GET `/api/excel/all`
**Authentication Required**

Get all uploaded Excel files.

**Success Response (200):**
```json
{
  "ok": true,
  "message": "Successfully retrieved 3 Excel file(s).",
  "data": {
    "files": [
      {
        "id": 1,
        "filename": "bacteria_data.xlsx",
        "originalName": "bacteria_data.xlsx",
        "uploadedAt": "2025-09-05T10:30:00.000Z",
        "size": 2048576,
        "recordCount": 150
      }
    ]
  }
}
```

**Empty Response (200):**
```json
{
  "ok": true,
  "message": "No Excel files found in the database.",
  "data": {
    "files": []
  }
}
```

#### PATCH `/api/excel/update-name/:id`
**Authentication Required**

Update the name of an Excel file.

**URL Parameters:**
- `id` (string): Numeric file ID

**Request Body:**
```json
{
  "newFileName": "updated_bacteria_data.xlsx"
}
```

**Success Response (200):**
```json
{
  "ok": true,
  "message": "File name updated successfully to \"updated_bacteria_data.xlsx\".",
  "data": null
}
```

**Error Responses:**
- **400 Bad Request**: Invalid input
```json
{
  "ok": false,
  "message": "File ID must be a numeric value. Received: \"abc\"",
  "data": null
}
```

```json
{
  "ok": false,
  "message": "File name must end with a valid Excel extension (.xlsx, .xls). Received: \"document.pdf\"",
  "data": null
}
```

```json
{
  "ok": false,
  "message": "A file with the name \"existing_file.xlsx\" already exists. Please choose a different name.",
  "data": null
}
```

- **404 Not Found**: File doesn't exist
```json
{
  "ok": false,
  "message": "Excel file with ID \"999\" was not found.",
  "data": null
}
```

#### DELETE `/api/excel/delete/:id`
**Authentication Required**

Delete an Excel file.

**URL Parameters:**
- `id` (string): Numeric file ID

**Success Response (200):**
```json
{
  "ok": true,
  "message": "File deleted successfully.",
  "data": null
}
```

**Error Responses:**
- **400 Bad Request**: Invalid ID or constraint violations
```json
{
  "ok": false,
  "message": "File ID must be a numeric value. Received: \"abc\"",
  "data": null
}
```

```json
{
  "ok": false,
  "message": "Cannot delete file: it may be referenced by other data.",
  "data": null
}
```

- **404 Not Found**: File doesn't exist
```json
{
  "ok": false,
  "message": "Excel file with ID \"999\" was not found.",
  "data": null
}
```

## Error Handling

### HTTP Status Codes
- **200**: Success
- **400**: Bad Request (client error)
- **401**: Unauthorized (authentication required)
- **403**: Forbidden (access denied)
- **404**: Not Found (resource doesn't exist)
- **422**: Unprocessable Entity (validation errors)
- **500**: Internal Server Error (unexpected server error)

### Response Format
All responses follow a consistent format:

**Success Response:**
```json
{
  "ok": true,
  "message": "Success message",
  "data": {/* response data */}
}
```

**Error Response:**
```json
{
  "ok": false,
  "message": "Error message",
  "data": null
}
```

**Validation Error Response:**
```json
{
  "ok": false,
  "message": "Validation error",
  "errors": {
    "fieldName": ["Error message 1", "Error message 2"]
  }
}
```

## Validation

### Input Validation
All endpoints use **Zod schemas** for input validation:

#### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (@$!%*?&)

#### Username Requirements
- 6-20 characters
- Letters, numbers, hyphens, and underscores only
- Cannot be only numbers
- Cannot contain special characters

#### Email Requirements
- Valid email format
- Required and non-empty

#### File Requirements
- Excel files only (.xlsx, .xls)
- Maximum size: 10MB
- Valid MIME types
- Non-empty file buffer

## Middleware

### Authentication Middleware
- **authenticateUser**: Validates access tokens
- **refreshTokenValidation**: Validates refresh tokens

### Validation Middleware
- **validateBody**: Validates request body against Zod schema
- **validateFile**: Validates uploaded files against Zod schema

### File Processing Middleware
- **uploadExcelFile**: Handles Excel file uploads with Multer

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  username VARCHAR NOT NULL,
  password VARCHAR NOT NULL,
  refreshToken VARCHAR,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);
```

### Excel Files Table
```sql
CREATE TABLE excel_files (
  id SERIAL PRIMARY KEY,
  filename VARCHAR NOT NULL,
  originalName VARCHAR NOT NULL,
  userId INTEGER REFERENCES users(id),
  uploadedAt TIMESTAMP DEFAULT NOW(),
  size INTEGER,
  recordCount INTEGER
);
```

## Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- PostgreSQL (or your chosen database)

### Installation
```bash
# Clone repository
git clone <repository-url>
cd bacteria-phages-graph/backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run test         # Run tests
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

### Testing
```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

---

## API Testing Examples

### Authentication Flow
```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!",
    "password_confirmation": "SecurePass123!",
    "username": "testuser"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'

# Get user info (using saved cookies)
curl -X GET http://localhost:3000/api/user/info \
  -b cookies.txt

# Upload Excel file
curl -X POST http://localhost:3000/api/excel/upload \
  -b cookies.txt \
  -F "excelFile=@path/to/your/file.xlsx"
```

---

*Last updated: September 5, 2025*
