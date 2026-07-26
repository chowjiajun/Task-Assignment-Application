# Backend — Task Assignment Application

The backend is a RESTful API server built with **Express.js** and **TypeScript**, powered by a **PostgreSQL** database via the **Drizzle ORM**. It integrates with **OpenAI** to intelligently classify required skills when creating tasks.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Setup & Running](#setup--running)
  - [Local Development](#local-development)
  - [Docker](#docker)
- [Project Structure](#project-structure)
- [System Design](#system-design)
- [API Documentation](#api-documentation)
  - [Developers](#developers)
  - [Skills](#skills)
  - [Tasks](#tasks)
- [Dependencies & Justification](#dependencies--justification)

---

## Prerequisites

- **Node.js** >= 24
- **npm** >= 10
- **PostgreSQL** 16 (when running locally without Docker)
- **OpenAI API key** (required for skill classification)

---

## Environment Variables

All environment variables are documented in [`.env.template`](../.env.template) at the project root. Below is the full list used by the backend:

| Variable            | Description                        | Default         | Required |
| ------------------- | ---------------------------------- | --------------- | -------- |
| `ENVIRONMENT`       | Runtime environment                | `development`   | No       |
| `EXPRESS_PORT`      | Port the API server listens on     | `8080`          | No       |
| `DATABASE_USERNAME` | PostgreSQL username                | `postgres`      | No       |
| `DATABASE_PASSWORD` | PostgreSQL password                | `postgres`      | No       |
| `DATABASE_HOST`     | PostgreSQL host                    | —               | Yes      |
| `DATABASE_PORT`     | PostgreSQL port                    | `5432`          | No       |
| `DATABASE_NAME`     | PostgreSQL database name           | `task_assignment` | No     |
| `OPENAI_API_KEY`    | OpenAI API key                     | —               | **Yes**  |
| `OPENAI_MODEL`      | OpenAI model to use for inference  | `gpt-5-nano-2025-08-07` | No       |

Copy the template and fill in your values:

```bash
cp .env.template .env
```

> **Note:** When running via Docker Compose, the `DATABASE_HOST` is set to the `postgres` service name automatically.

---

## Setup & Running

### Local Development

1. **Install dependencies**

   ```bash
   cd backend
   npm install
   ```

2. **Configure environment**

   ```bash
   cp ../.env.template ../.env
   # Edit .env with your values
   ```

3. **Run database migrations**

   ```bash
   npm run migrate
   ```

4. **(Optional) Seed the database**

   ```bash
   npm run seed
   ```

5. **Start the development server**

   ```bash
   npm run dev
   ```

   The server starts at `http://localhost:8080`.

### Docker

The backend is containerized and intended to be run via Docker Compose from the project root. See the [root README](../README.md) for instructions.

To build just the backend image:

```bash
docker build -f backend/Dockerfile -t task-assignment-backend ./backend
```

---

## Project Structure

```
backend/
├── Dockerfile
├── drizzle.config.ts          # Drizzle Kit configuration
├── package.json
├── tsconfig.json
├── logs/                      # Auto-rotating log files (gitignored)
└── src/
    ├── app.ts                 # Express app entry point
    ├── agents/
    │   └── skill-classification-agent/
    │       ├── agent.ts       # OpenAI skill classification agent
    │       ├── prompt.ts      # LLM prompt builder
    │       └── schema.ts      # Response validation schema
    ├── config/
    │   ├── env.ts             # Environment variable loading & validation
    │   ├── logger.ts          # Winston logging configuration
    │   └── openai.ts          # OpenAI client initialization
    ├── constants/
    │   ├── error-messages.ts  # Shared error message strings
    │   ├── http-status.ts     # HTTP status code constants
    │   └── postgres-error-codes.ts
    ├── errors/
    │   └── database.ts        # Custom database error classes
    ├── infrastructure/
    │   └── database/
    │       ├── index.ts       # Drizzle database client setup
    │       ├── schema.ts      # Database table definitions
    │       ├── seed.ts        # Seed data script
    │       └── migrations/    # Drizzle Kit generated migrations
    ├── middlewares/
    │   ├── cors.ts            # CORS middleware (development only)
    │   ├── global-error-handling.ts  # Global error handler
    │   └── validate-request.ts       # AJV-based request body validation
    └── modules/
        ├── developers/
        │   ├── repository.ts  # Database queries
        │   ├── router.ts      # Express route definitions
        │   └── service.ts     # Business logic
        ├── skills/
        │   ├── repository.ts  # Database queries
        │   ├── router.ts      # Express route definitions
        │   └── service.ts     # Business logic
        └── tasks/
            ├── constants.ts   # Task status enum
            ├── errors.ts      # Task-specific error classes
            ├── repository.ts  # Database queries (incl. recursive sub-task inserts)
            ├── router.ts      # Express route definitions
            ├── service.ts     # Business logic (incl. AI classification, skill validation)
            ├── types.ts       # TypeScript interfaces
            └── validation.ts  # AJV JSON schemas for request validation
```

---

## System Design

### Layered Architecture (3-Tier)

The backend follows a **Repository-Service-Router** pattern for each module:

1. **Router** — Defines HTTP endpoints, parses request parameters, and delegates to the service layer. Uses middleware for request validation.
2. **Service** — Contains business logic, orchestrates calls to external services (e.g., OpenAI), and enforces domain rules (e.g., sub-task completion checks).
3. **Repository** — Handles all database interactions via Drizzle ORM. The database is accessed exclusively through this layer, keeping SQL concerns isolated.

### AI-Powered Skill Classification

When a task is created **without** specifying required skills, the system invokes the **SkillClassificationAgent**, which:

1. Sends the task title and the list of available skills to OpenAI.
2. Parses the JSON response.
3. Validates the response structure using an AJV schema.
4. Falls back gracefully if the LLM response is malformed.

This allows the system to auto-tag tasks with relevant skills, reducing manual data entry.

### Skills Module

The Skills module manages the catalog of available skill tags used across the application:

- **Skill tags** are stored with a `name` (primary key) and timestamps.
- Skills are referenced by both `developer_skills` (which developers possess which skills) and `task_skills` (which skills a task requires).
- The module provides read-only endpoints — skills are populated via the seed script (`npm run seed`) and can be extended by adding entries to the database.
- When creating a task, the Task service validates that all requested skills exist in this catalog before proceeding. If no skills are provided, the AI classification agent selects from this same catalog.

### Recursive Sub-Task Support

Tasks can have arbitrarily nested sub-tasks. The system:

- Stores sub-tasks in the same `tasks` table using a self-referencing `parent_task_id` foreign key.
- Creates all nested tasks atomically within a single database transaction.
- Prevents a parent task from being marked "Done" while any sub-task is incomplete.
- Builds the hierarchical tree structure in-memory when retrieving tasks.

### Database Schema

The database consists of five tables:

| Table              | Purpose                                    |
| ------------------ | ------------------------------------------ |
| `developers`       | Stores developer profiles (name)           |
| `skills`           | Stores available skill tags (name as PK)   |
| `tasks`            | Stores tasks and sub-tasks (self-referencing FK) |
| `developer_skills` | Many-to-many relationship: developers ↔ skills |
| `task_skills`      | Many-to-many relationship: tasks ↔ skills  |

### Logging

The application uses **Winston** for structured logging with the following setup:

- **Console transport** — Colorized output for real-time terminal visibility.
- **File transport (error.log)** — Captures all `error`-level logs for operational monitoring.
- **File transport (combined.log)** — Captures `info` and above for general audit trail.
- **Log rotation** — Each file is capped at 5 MB with up to 5 rotated archives kept, preventing disk exhaustion.
- **Environment-aware** — Log level defaults to `debug` in development and `info` in production.

All log files are stored in `logs/` and ignored by version control.

### Security

- **Helmet** — Sets secure HTTP headers.
- **Input validation** — All request bodies are validated against JSON schemas using AJV before reaching business logic.
- **CORS** — Enabled only in `development` mode.
- **Non-root user** — The Docker image runs the application as a non-root user.

---

## API Documentation

All endpoints are prefixed by their resource name (e.g., `/developers/list`).

### Developers

| Method | Endpoint             | Description               |
| ------ | -------------------- | ------------------------- |
| `GET`  | `/developers/list`   | Retrieve all developers   |
| `GET`  | `/developers/:id`    | Retrieve a developer by ID |

**Response** (`/developers/list`):
```json
[
  { "id": 1, "name": "Alice" },
  { "id": 2, "name": "Bob" }
]
```

### Skills

| Method | Endpoint           | Description            |
| ------ | ------------------ | ---------------------- |
| `GET`  | `/skills/list`     | Retrieve all skills    |
| `GET`  | `/skills/:skill`   | Retrieve a skill by name |

**Response** (`/skills/list`):
```json
[
  { "name": "Frontend" },
  { "name": "Backend" }
]
```

### Tasks

| Method  | Endpoint                  | Description                    |
| ------- | ------------------------- | ------------------------------ |
| `GET`   | `/tasks/list`             | Retrieve all tasks (tree)      |
| `GET`   | `/tasks/:id`              | Retrieve a single task         |
| `POST`  | `/tasks/create`           | Create a new task with sub-tasks |
| `PATCH` | `/tasks/update/:id`       | Update task status or assignee |
| `GET`   | `/tasks/statuses`         | Retrieve available statuses    |

#### `POST /tasks/create`

Creates a task and optionally nested sub-tasks atomically.

**Request Body:**
```json
{
  "title": "Build landing page",
  "status": "To-do",
  "skillsRequired": ["Frontend"],
  "assignedTo": 1,
  "subTasks": [
    {
      "title": "Design header",
      "status": "To-do",
      "skillsRequired": ["Frontend"],
      "subTasks": null
    }
  ]
}
```

- If `skillsRequired` is an empty array, the system calls OpenAI to automatically classify the required skills.
- The `status` must be one of: `"To-do"`, `"In progress"`, `"Done"`.
- All nested sub-tasks are created recursively in a single transaction.

#### `PATCH /tasks/update/:id`

**Request Body:**
```json
{
  "status": "In progress",
  "assignedTo": 2
}
```

- If setting status to `"Done"`, the API validates that all sub-tasks are also `"Done"` first.

#### `GET /tasks/statuses`

**Response:**
```json
["To-do", "In progress", "Done"]
```

---

## Dependencies & Justification

| Dependency         | Purpose                                                                 | Why it was chosen                                                       |
| ------------------ | ----------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| **express**        | HTTP server framework                                                    | Industry standard for Node.js REST APIs; minimal, flexible, well-tested |
| **drizzle-orm**    | TypeScript ORM                                                          | Type-safe SQL with full TypeScript inference; lightweight compared to Prisma; excellent PostgreSQL support |
| **drizzle-kit**    | Database migration tool                                                  | Pairs natively with Drizzle ORM; generates SQL migrations from schema definitions |
| **pg**             | PostgreSQL client driver                                                | The de-facto PostgreSQL driver for Node.js; used internally by Drizzle |
| **openai**         | OpenAI API client                                                       | Official SDK for the OpenAI API; used for AI-powered skill classification |
| **ajv**            | JSON schema validation                                                  | Fastest JSON validator for Node.js; used to validate request bodies and LLM responses |
| **helmet**         | Security HTTP headers                                                   | Standard Express security middleware; sets Content-Security-Policy, X-Frame-Options, etc. |
| **dotenv**         | Environment variable loading                                            | Simple, zero-dependency `.env` file loading |
| **winston**        | Structured logging                                                      | Industry-standard Node.js logger; supports multiple transports (console + file), log levels, and auto-rotation out of the box |
| **tsx**            | TypeScript execution for scripts and dev server                         | Fast TypeScript runner using esbuild; handles ESM natively; replaces ts-node for both `dev` and `seed` scripts |
| **typescript**     | Type checking and compilation                                           | Provides static typing, interfaces, and type safety across the codebase |
