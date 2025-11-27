# API Endpoints

The Phenom API is a RESTful API built with Express.js. It uses standard HTTP methods and status codes.

**Base URL**: `/api/v1`

## Authentication

| Method | Endpoint | Description | Auth Required |
|:---|:---|:---|:---|
| `POST` | `/auth/signup` | Register a new user | No |
| `POST` | `/auth/login` | Log in a user | No |
| `POST` | `/auth/logout` | Log out (clear refresh token) | Yes |
| `POST` | `/auth/refresh-token` | Refresh access token | No |
| `GET` | `/auth/me` | Get current user profile | Yes |
| `POST` | `/auth/forgot-password` | Request password reset | No |
| `POST` | `/auth/reset-password` | Reset password with token | No |

## Observations

| Method | Endpoint | Description | Auth Required |
|:---|:---|:---|:---|
| `GET` | `/observations` | List observations (with filters) | No |
| `GET` | `/observations/:id` | Get observation details | No |
| `POST` | `/observations` | Create a new observation | Yes |
| `PUT` | `/observations/:id` | Update an observation | Yes (Owner/Admin) |
| `DELETE` | `/observations/:id` | Delete an observation | Yes (Owner/Admin) |
| `GET` | `/observations/nearby` | Find observations near a location | No |

## Users

| Method | Endpoint | Description | Auth Required |
|:---|:---|:---|:---|
| `GET` | `/users/profile` | Get current user profile | Yes |
| `PUT` | `/users/profile` | Update user profile | Yes |
| `GET` | `/users/:id/observations` | Get observations by user | No |

## Comments

| Method | Endpoint | Description | Auth Required |
|:---|:---|:---|:---|
| `GET` | `/observations/:id/comments` | Get comments for an observation | No |
| `POST` | `/observations/:id/comments` | Add a comment | Yes |
| `PUT` | `/comments/:id` | Update a comment | Yes (Owner/Admin) |
| `DELETE` | `/comments/:id` | Delete a comment | Yes (Owner/Admin) |

## Admin

| Method | Endpoint | Description | Auth Required |
|:---|:---|:---|:---|
| `GET` | `/admin/stats` | Get system statistics | Yes (Admin) |
| `GET` | `/admin/users` | List all users | Yes (Admin) |
| `PATCH` | `/admin/users/:id/role` | Change user role | Yes (Admin) |
| `DELETE` | `/admin/observations/:id` | Delete any observation | Yes (Admin) |

## Response Format

Success response:
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

Error response:
```json
{
  "success": false,
  "error": "Error message"
}
```
