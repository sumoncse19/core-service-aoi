# **Pulikids - Childcare Management Platform**

Pulikids is an innovative childcare management platform tailored for nurseries, schools, and childcare providers across the UK. The platform offers streamlined management for bookings, activity tracking, compliance, and communication with parents.

---

## **Table of Contents**

1. [Project Overview](#project-overview)
2. [Technical Stack](#technical-stack)
3. [Project Requirements](#project-requirements)
   - [Technical Requirements](#technical-requirements)
   - [Architecture Requirements](#architecture-requirements)
4. [Getting Started](#getting-started)
5. [Scripts](#scripts)
6. [API Documentation Link](#api-documentation-link)
7. [Folder Structure](#folder-structure)
8. [Package Dependencies](#package-dependencies)
   - [Core Dependencies](#core-dependencies)
   - [Development Dependencies](#development-dependencies)
9. [Key Services](#key-services)
   - [User Service](#1-user-service)
   - [Tracking Service](#2-tracking-service)
   - [Child Service](#3-child-service)
   - [Booking Service](#4-booking-service)
10. [Common Components](#common-components)
11. [Session Management](#session-management)
12. [Database Schema](#database-schema)
13. [Contributing](#contributing)
14. [License](#license)

---

## **Project Overview**

Pulikids provides childcare providers with powerful tools for managing activities, ensuring compliance, and staying connected with parents. Designed with scalability and flexibility in mind, Pulikids is adaptable to various childcare environments. The platform supports multiple user roles, including administrators, staff, and parents, each with specific functionalities tailored to their needs.

---

## **Technical Stack**

- **Backend**: Node.js with TypeScript for a robust and scalable server-side application.
- **Databases**:
  - **PostgreSQL** for structured data storage, ensuring data integrity and complex querying capabilities.
  - **MongoDB** for flexible document storage, allowing for dynamic and unstructured data handling.
- **Authentication**: Clerk for secure and efficient user authentication and management.
- **Validation**: Zod for runtime schema validation, ensuring data consistency and integrity.
- **ORM/ODM**:
  - TypeORM for PostgreSQL, providing a powerful and flexible ORM for database interactions.
  - Mongoose for MongoDB, offering a straightforward ODM for managing MongoDB collections.
- **API Documentation**: Swagger for comprehensive and interactive API documentation.
- **Email Service**: Nodemailer for reliable email communication and notifications.

---

## **Project Requirements**

### **Technical Requirements**

- Implementation in **Node.js** and **TypeScript** to leverage modern JavaScript features and type safety.
- Dual database architecture to handle both structured and unstructured data efficiently.
- Schema validation using **Zod** to ensure data integrity and prevent invalid data entry.
- **Clerk** for authentication to provide secure and scalable user management.
- Optional Docker support for containerized deployment and environment consistency.
- Optional Redis for API Gateway to enhance performance through caching and load balancing.

### **Architecture Requirements**

- **MVC** (Model-View-Controller) pattern to separate concerns and improve code maintainability.
- Robust error handling and input validation to ensure system reliability and security.
- **API Documentation** to provide clear and accessible information for developers.
- Security best practices to protect user data and prevent unauthorized access.

---

## **Getting Started**

1. **Clone the Repository**

   Clone the project repository to your local machine using the following command:

   ```bash
   git clone https://github.com/sumoncse19/core-service-aoi
   ```

2. **Install Dependencies**

   Navigate to the project directory and install the necessary dependencies using Yarn or npm:

   ```bash
   yarn install
   # or
   npm install
   ```

3. **Set Up Environment**  
   Configure the `.env` file with necessary variables for PostgreSQL, MongoDB, Clerk keys, etc. Ensure you have the following prerequisites installed:

   - Node.js (v14 or higher)
   - PostgreSQL
   - MongoDB
   - Redis (for API Gateway)

   ### **Environment Variables**

   Copy the `.env.example` to `.env` and fill in the required values:

   ```plaintext
   # Server Configuration
   NODE_ENV=development
   PORT=5000
   BCRYPT_SALT_ROUNDS=12
   JWT_ACCESS_SECRET=your_jwt_access_secret
   JWT_REFRESH_SECRET=your_jwt_refresh_secret
   JWT_ACCESS_EXPIRES_IN=7d
   JWT_REFRESH_EXPIRES_IN=15m
  
   For create JWT_ACCESS_SECRET and JWT_REFRESH_SECRET run this command in terminal:

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

   # Database Configuration

   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=password
   DB_NAME=pulikids

   # MongoDB Configuration

   MONGODB_URI=your_mongodb_uri

   # Authentication - Clerk

   CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key

   # Redis Configuration

   REDIS_URL=redis://localhost:6379
   REDIS_HOST=localhost
   REDIS_PORT=6379
   GATEWAY_PORT=3000
   SERVICE_REGISTRY_TTL=30
   ```

4. **Database Setup**

   Generate and run TypeORM migrations to set up the database schema:

   ```bash
   # Generate TypeORM migrations
   yarn migration:generate
   # or
   npm run migration:generate

   yarn migration:run
   # or
   npm run migration:run
   ```

5. **Start Development Server**

   Start the development server with hot-reload capabilities:

   ```bash
   yarn start:dev
   # or
   npm run start:dev
   ```

   For production, build and start the server:

   ```bash
   yarn build
   yarn start:prod
   # or
   npm run build
   npm run start:prod
   ```

---

## **Scripts**

- **`yarn start:dev` or `npm run start:dev`** - Run the development server with hot-reload.
- **`yarn build` or `npm run build`** - Build the application for production.
- **`yarn lint` or `npm run lint`** - Run ESLint to check for code quality issues.
- **`yarn prettier` or `npm run prettier`** - Format code using Prettier.
- **`yarn migration:generate` or `npm run migration:generate`** - Generate new TypeORM migrations.
- **`yarn migration:run` or `npm run migration:run`** - Execute database migrations.

## **API Documentation Link**

For detailed API documentation, visit [Swagger UI](http://localhost:5000/api-docs).

---

## **Folder Structure**

The project is organized into the following structure:

```
src/
├── app/
│   ├── config/                 # Application configuration
│   │   ├── clerk.ts           # Clerk authentication config
│   │   ├── database.ts        # Database connection config
│   │   ├── env.validation.ts  # Environment validation
│   │   └── index.ts
│   ├── database/
│   │   └── migrations/        # Database migrations
│   ├── middleware/            # Express middleware
│   │   ├── globalErrorHandler.ts
│   │   ├── notFound.ts
│   │   ├── requireAuth.ts
│   │   └── validateRequest.ts
│   ├── modules/               # Feature modules
│   │   ├── booking/
│   │   ├── child/
│   │   ├── session/
│   │   ├── shared/
│   │   ├── tracking/
│   │   └── user/
│   ├── app.ts                 # Express app setup
│   └── server.ts              # Server entry point
├── .env
├── .env.example
├── package.json
└── tsconfig.json
```

---

## **Package Dependencies**

### **Core Dependencies**

- `@clerk/backend` & `@clerk/express` - Authentication and user management
- `typeorm` & `mongoose` - Database ORMs
- `zod` - Schema validation
- `nodemailer` - Email services

### **Development Dependencies**

- `typescript` - TypeScript compiler
- `eslint` & `prettier` - Code quality and formatting
- `husky` & `lint-staged` - Git hooks and staged file linting

---

## **Key Services**

### **1. User Service**

Handles user authentication and management with key functionalities:

- **User Registration** and **Login**
- Role-based Access Control
- Session Management
- Password Reset

#### **API Endpoints**

- **Register User**  
  `POST /api/v1/users/register`

  **Postman Example:**

  ```json
  {
    "first_name": "John",
    "last_name": "Doe",
    "email": "johndoe@gmail.com",
    "password": "xK9#mP2$vL5nQ8",
    "role": "admin", // parent | admin | staff
    "user_name": "johndoe"
  }
  ```

- **Login**  
  `POST /api/v1/users/login`

  **Postman Example:**

  ```json
  {
    "email": "johndoe@gmail.com",
    "password": "xK9#mP2$vL5nQ8"
  }
  ```

- **Reset Password Request**  
  `POST /api/v1/users/reset-password-request`

  **Postman Example:**

  ```json
  {
    "email": "user@example.com"
  }
  ```

- **Reset Password**  
  `POST /api/v1/users/reset-password`

  **Postman Example:**

  ```json
  {
    "email": "user@example.com",
    "otp": "123456", // OTP from email
    "newPassword": "NewSecurePass123!"
  }
  ```

- **Logout**  
  `POST /api/v1/users/logout`

  **Postman Example:**

  ```json
  {
    "token": "user-session-token"
  }
  ```

- **Get Profile**  
  `GET /api/v1/users/profile`

### **2. Tracking Service**

Tracks and manages activities and attendance:

- **Activity CRUD** Operations
- Scheduling and Capacity Management
- Attendance Status Updates
- Reporting System

#### **API Endpoints**

- **Create Activity**  
  `POST /api/v1/tracking/activities`

  **Postman Example:**

  ```json
  {
    "title": "Morning Yoga Session 2",
    "description": "Morning yoga session for kids aged 5-7",
    "start_time": "2024-03-20T09:00:00Z",
    "end_time": "2024-03-20T10:00:00Z",
    "assigned_staff": [
      "ca3cea30-2a96-40bb-9112-a901bfed2b0c", // staff(user) id
      "01a0a0eb-b056-4cf3-b975-33d1cad65a46"
    ],
    "max_participants": 15,
    "location": "Main Activity Room",
    "metadata": {
      "equipment_needed": ["yoga mats", "blocks"],
      "age_group": "5-7 years",
      "difficulty_level": "beginner"
    }
  }
  ```

- **Get Activities**  
  `GET /api/v1/tracking/activities`

- **Get Activity by ID**  
  `GET /api/v1/tracking/activities/:id`

- **Update Activity**  
  `PATCH /api/v1/tracking/activities/:id`

- **Delete Activity**  
  `DELETE /api/v1/tracking/activities/:id`

- **Record Attendance**  
  `POST /api/v1/tracking/attendance`

  **Postman Example:**

  ```json
  {
    "activity_id": "e28608cf-28c1-4f52-80e5-9d010b813a02",
    "child_id": "2bdba8b7-5bb5-4f79-adea-d5a9fdc4a919", // For this child id we have child service.
    "status": "present",
    "check_in_time": "2024-11-03T18:00:00.000Z",
    "check_out_time": "2024-11-04T18:00:00.000Z",
    "notes": "Participated enthusiastically"
  }
  ```

- **Get Attendance by Activity**  
  `GET /api/v1/tracking/attendance/activity/:activityId`

- **Update Attendance**  
  `PATCH /api/v1/tracking/attendance/:id`

- **Record Bulk Attendance**  
  `POST /api/v1/tracking/attendance/bulk`

- **Get Upcoming Activities**  
  `GET /api/v1/tracking/activities/upcoming`

- **Get Weekly Report**  
  `GET /api/v1/tracking/reports/weekly`

- **Get Monthly Report**  
  `GET /api/v1/tracking/reports/monthly`

- **Get Activity Report**  
  `GET /api/v1/tracking/reports/activity/:activityId`

- **Get Daily Report**  
  `GET /api/v1/tracking/reports/daily`

### **3. Child Service**

Manages child profiles and parent relationships:

- **Profile Management**
- Medical Information
- Activity Tracking

#### **API Endpoints**

- **Register Child**  
  `POST /api/v1/children/register`

  **Postman Example:**

  ```json
  {
    "first_name": "Abdur",
    "last_name": "Rahim",
    "date_of_birth": "2016-05-15",
    "gender": "male", // male | female
    "medical_info": "No allergies",
    "emergency_contact": {
      "name": "parent_name",
      "phone": "1234567890",
      "relationship": "Mother"
    }
  }
  ```

- **Get My Children**  
  `GET /api/v1/children/my-children`

- **Update Child**  
  `PATCH /api/v1/children/:id`

- **Delete Child**  
  `DELETE /api/v1/children/:id`

- **Get Child Activity History**  
  `GET /api/v1/children/:id/activity-history`

- **Get Eligible Activities**  
  `GET /api/v1/children/:id/eligible-activities`

### **4. Booking Service**

Manages bookings, availability, and payments:

- **Booking Management**
- Availability Checking
- Booking Confirmation
- Payment Processing

#### **API Endpoints**

- **Create Booking**  
  `POST /api/v1/booking/bookings`

  **Postman Example:**

  ```json
  {
    "child_id": "child-uuid",
    "activity_id": "activity-uuid",
    "start_date": "2024-03-20T10:00:00Z",
    "end_date": "2024-03-20T11:00:00Z",
    "notes": "First time attending"
  }
  ```

- **Create Recurring Booking**  
  `POST /api/v1/booking/bookings/recurring`

  **Postman Example:**

  ```json
  {
    "child_id": "child-uuid",
    "activity_id": "activity-uuid",
    "start_date": "2024-03-20T10:00:00Z",
    "recurrence": {
      "frequency": "weekly",
      "until": "2024-06-20"
    }
  }
  ```

- **Get Bookings**  
  `GET /api/v1/booking/bookings`

- **Get Booking by ID**  
  `GET /api/v1/booking/bookings/:id`

- **Update Booking**  
  `PATCH /api/v1/booking/bookings/:id`

- **Delete Booking**  
  `DELETE /api/v1/booking/bookings/:id`

- **Create Payment**  
  `POST /api/v1/booking/payments`

  **Postman Example:**

  ```json
  {
    "booking_id": "booking-uuid",
    "amount": 50.0,
    "payment_method": "credit_card",
    "transaction_id": "txn_123456789"
  }
  ```

- **Get Payments by Booking**  
  `GET /api/v1/booking/payments/booking/:bookingId`

- **Check Availability**  
  `GET /api/v1/booking/availability`

- **Confirm Booking**  
  `POST /api/v1/booking/bookings/:id/confirm`

- **Get Booking Confirmation Status**  
  `GET /api/v1/booking/bookings/:id/confirmation-status`

- **Get Booking Participation**  
  `GET /api/v1/booking/bookings/:id/participation`

- **Check Activity Eligibility**  
  `GET /api/v1/booking/activities/:id/eligibility`

---

## **5. API Gateway**

The API Gateway serves as the single entry point for all client requests, providing routing, load balancing, caching, and service discovery capabilities.

### **1. Service Discovery**

The service discovery mechanism allows dynamic registration and discovery of microservices.

```typescript
// Register a service
await serviceRegistry.registerService({
  id: 'user-service-1',
  name: 'user-service',
  url: 'http://localhost:3001',
  status: 'active',
  healthCheck: '/health',
  version: '1.0.0',
})
```

### **2. Request Routing**

Routes requests to appropriate services based on URL patterns and service availability.

```typescript
// Route Configuration Example
{
  path: '/users/*',
  service: 'user-service',
  method: 'GET',
  auth: true,
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  }
}
```

### **3. Load Balancing**

Supports multiple load balancing strategies:

- Round Robin
- Least Connection
- Random

```typescript
// Load Balancer Configuration
{
  strategy: 'round-robin',
  healthCheck: {
    enabled: true,
    interval: 30000, // 30 seconds
    timeout: 5000,   // 5 seconds
    unhealthyThreshold: 3
  }
}
```

### **4. Cache Management**

Redis-based caching system with configurable TTL and pattern-based invalidation.

```typescript
// Cache Configuration
{
  enabled: true,
  ttl: 300, // 5 minutes
  maxSize: 1000
}
```

### **API Gateway Endpoints**

#### Service Registry

- `POST /registry/services` - Register a new service
- `DELETE /registry/services/:id` - Deregister a service
- `GET /registry/services` - List all registered services

#### Health Checks

- `GET /health` - Gateway health check
- `GET /services/:service/health` - Service-specific health check

#### Cache Management

- `DELETE /cache/invalidate/:pattern` - Invalidate cache by pattern
- `DELETE /cache/clear` - Clear entire cache

### **Gateway Features**

1. **Service Discovery**

   - Dynamic service registration
   - Health monitoring
   - Automatic service deregistration
   - Version management

2. **Request Routing**

   - Path-based routing
   - Method-based routing
   - Authentication middleware
   - Rate limiting

3. **Load Balancing**

   - Multiple balancing strategies
   - Health-check based routing
   - Connection tracking
   - Automatic failover

4. **Cache Management**
   - Redis-based caching
   - Configurable TTL
   - Pattern-based invalidation
   - Automatic cache population

### **Implementation Example**

```typescript
// Initialize Gateway
const gateway = new ApiGateway({
  port: 3000,
  redis: {
    host: 'localhost',
    port: 6379,
  },
  loadBalancer: {
    strategy: 'round-robin',
    healthCheck: {
      enabled: true,
      interval: 30000,
    },
  },
  cache: {
    enabled: true,
    ttl: 300,
  },
})

// Start Gateway
gateway.start()
```

### **Service Integration**

Services need to implement:

1. Health check endpoint (`/health`)
2. Version information
3. Service metadata

Example health check response:

```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2024-03-20T10:00:00Z",
  "metrics": {
    "uptime": 3600,
    "memory": {
      "used": 100000000,
      "total": 500000000
    }
  }
}
```

### **Security Considerations**

1. **Authentication**

   - JWT validation
   - Role-based access control
   - Rate limiting per client

2. **Service Communication**

   - TLS encryption
   - Service-to-service authentication
   - Request signing

3. **Monitoring**
   - Request logging
   - Error tracking
   - Performance metrics

### **Error Handling**

The gateway implements comprehensive error handling:

- Service unavailable (503)
- Rate limit exceeded (429)
- Authentication failed (401)
- Authorization failed (403)
- Bad gateway (502)

## **Common Components**

### **Middleware**

1. **Auth Middleware**  
   Handles session validation, role-based access, and token verification.

2. **Request Validation**  
   Utilizes Zod for schema validation and sanitization.

### **Error Handling**

Centralized error handling with development and production configurations.

### **Utilities**

- **Async Handler** - Wraps controllers for error management.
- **OTP Generator** - Generates secure OTPs.
- **Date/Time Utilities** - Functions for date and time manipulation.

---

## **Session Management**

- **JWT-based** authentication
- Sessions stored in MongoDB
- Auto-logout on inactivity

---

## **Database Schema**

### **PostgreSQL Tables**

- **users** - Authentication and profile data
- **activities** - Activity and scheduling details
- **attendance** - Attendance tracking
- **children** - Child profile information

### **MongoDB Collections**

- **activities** - Metadata and updates
- **attendance** - History and notes

---

## **Available Scripts**

```bash
# Development
yarn start:dev         # Start development server
yarn start:prod        # Start production server
yarn build            # Build production code

# Database
yarn migration:generate  # Generate new migration
yarn migration:run      # Run migrations
yarn migration:revert   # Revert last migration

# Code Quality
yarn lint             # Run ESLint
yarn lint:fix         # Fix ESLint errors
yarn prettier         # Run Prettier
yarn prettier:fix     # Fix Prettier issues

# Testing
yarn test             # Run tests
yarn test:gateway     # Run gateway tests
yarn test:watch       # Run tests in watch mode
```

---

## **Contributing**

We welcome contributions! Please follow our [Contribution Guidelines](CONTRIBUTING.md) for more details.

---

## **License**

Pulikids is licensed under the **MIT License**.
