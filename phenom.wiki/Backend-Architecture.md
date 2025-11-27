# Backend Architecture

The Phenom backend is built with **Node.js** and **Express.js**, following a layered architecture to separate concerns and ensure maintainability.

## Directory Structure

```
backend/src/
├── config/         # Configuration (DB, JWT, Cloudinary, etc.)
├── controllers/    # Request handlers (Input/Output logic)
├── middleware/     # Express middleware (Auth, Validation, Error handling)
├── models/         # Mongoose models (Data definitions)
├── routes/         # API Route definitions
├── services/       # Business logic (The core of the application)
├── utils/          # Helper functions and utilities
├── validators/     # Input validation schemas
└── app.js          # App entry point and setup
```

## Key Components

### Controllers
Controllers handle incoming HTTP requests, extract data from `req.body` or `req.params`, call the appropriate Service methods, and return standardized responses. They do **not** contain business logic.

**Example**: `auth.controller.js` handles login/signup requests.

### Services
Services contain the business logic. They interact with the Database (via Models) and other external services (like Cloudinary). They are reusable and independent of the HTTP layer.

**Example**: `observation.service.js` handles creating, filtering, and deleting observations.

### Models
Mongoose models define the schema for data stored in MongoDB. They include validation rules, hooks (e.g., password hashing), and helper methods.

**Key Models**:
- `User`: Accounts and authentication.
- `Observation`: UFO sightings data.
- `Comment`: Discussions on observations.

### Middleware
Middleware functions run before the controller. They handle cross-cutting concerns like:
- **Authentication**: `auth.js` verifies JWT tokens.
- **Authorization**: `authorize.js` checks user roles and permissions.
- **Validation**: `validate.js` checks input data against schemas.
- **Rate Limiting**: `rateLimiter.js` prevents abuse.

### Configuration
Configuration files allow easy management of environment variables and third-party service setups (MongoDB, Cloudinary, Swagger).

## Error Handling
Errors are handled centrally using a custom `errorHandler` middleware. We use custom error classes (`NotFoundError`, `BadRequestError`, etc.) to throw errors with specific HTTP status codes.

## Security
- **Helmet**: Sets secure HTTP headers.
- **CORS**: Restricts access to allowed origins.
- **Sanitization**: Prevents NoSQL injection and XSS.
- **Rate Limiting**: Protects against brute-force attacks.
