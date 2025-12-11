# Task Manager Backend

A scalable NestJS backend for managing tasks with MongoDB integration, JWT auth, validation, and Swagger docs.

## Features

- CRUD operations for tasks
- Task status management (TODO, IN_PROGRESS, DONE)
- Task prioritization
- Task assignment
- Due date tracking
- Swagger API documentation
- Comprehensive test coverage
- Role-aware access control (creator/assignee vs admin)
- Rate limiting, health checks, consistent error responses

## What problem this solves (practical)

- Central place for teams to know “who’s doing what, by when.”
- Secure multi-user task API with ownership and roles so only the right people can see/change tasks.
- Reliable integration surface (Swagger, validation, error shaping, health checks, rate limiting) for frontends or other services.
- Keeps task data clean (future due dates, completion ties to status) and queryable (filters, pagination, indexes) for dashboards and reporting.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd task-manager
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory (values can be overridden per environment):
```
MONGODB_URI=mongodb://localhost:27017/task-manager
PORT=3000
NODE_ENV=development
JWT_SECRET=dev_jwt_secret
```

## Running the Application

1. Start MongoDB:
```bash
# Make sure MongoDB is running on your system
```

2. Start the application:
```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

## API Documentation

Once the application is running, you can access the Swagger API documentation at:
```
http://localhost:3000/api
```

## Testing

Run the test suite:
```bash
# Unit tests
npm run test

# e2e tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## API Endpoints

### Auth
- `POST /auth/register` - Create a user
- `POST /auth/login` - Login with email/password (returns JWT)

### Tasks
All task routes require a Bearer JWT.

- `POST /tasks` - Create a new task
- `GET /tasks` - Get tasks (supports `status`, `assignedTo`, `page`, `limit`, `sortBy`, `sortOrder`, `search`)
- `GET /tasks/:id` - Get a specific task
- `PATCH /tasks/:id` - Update a task
- `DELETE /tasks/:id` - Delete a task

Ownership/permissions:
- Admins see all tasks.
- Regular users see tasks they created or are assigned to; they can update/delete only those.

### Health
- `GET /health` - Liveness probe

## Task Schema

```typescript
{
  title: string;          // Required
  description?: string;   // Optional
  status: string;         // Required (TODO, IN_PROGRESS, DONE)
  dueDate: Date;          // Required (must be future)
  priority?: number;      // Optional (1-5)
  assignedTo?: string;    // Optional (email)
  isCompleted: boolean;   // Derived from status
  createdBy: string;      // User id of creator
}
```

## Platform features
- JWT auth with password hashing, local and JWT strategies
- Per-user task ownership checks (admin bypass)
- Rate limiting (global): 100 req/min default
- Global validation + consistent error envelope
- Swagger at `/api`
- Health endpoint at `/health`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
