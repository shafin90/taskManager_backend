# Task Manager Backend

A scalable NestJS backend for managing tasks with MongoDB integration.

## Features

- CRUD operations for tasks
- Task status management (TODO, IN_PROGRESS, DONE)
- Task prioritization
- Task assignment
- Due date tracking
- Swagger API documentation
- Comprehensive test coverage

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

3. Create a `.env` file in the root directory with the following content:
```
MONGODB_URI=mongodb://localhost:27017/task-manager
PORT=3000
NODE_ENV=development
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

### Tasks

- `POST /tasks` - Create a new task
- `GET /tasks` - Get all tasks
- `GET /tasks?status=<status>` - Get tasks by status
- `GET /tasks?assignedTo=<email>` - Get tasks by assignee
- `GET /tasks/:id` - Get a specific task
- `PATCH /tasks/:id` - Update a task
- `DELETE /tasks/:id` - Delete a task

## Task Schema

```typescript
{
  title: string;          // Required
  description?: string;   // Optional
  status: string;        // Required (TODO, IN_PROGRESS, DONE)
  dueDate: Date;         // Required
  priority?: number;     // Optional (1-5)
  assignedTo?: string;   // Optional
  isCompleted: boolean;  // Default: false
}
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
