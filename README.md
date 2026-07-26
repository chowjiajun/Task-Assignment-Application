# Task Assignment Application

A full-stack task management application with AI-powered skill classification. Create tasks, assign them to developers, track status, and organize work into nested sub-tasks — all with automatic skill tagging via OpenAI.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Quick Start (Docker)](#quick-start-docker)
- [Development Setup](#development-setup)
- [Tech Stack](#tech-stack)
- [System Design](#system-design)
- [Project Structure](#project-structure)
- [API Overview](#api-overview)
- [Environment Variables](#environment-variables)
- [Scripts Reference](#scripts-reference)

---

## Architecture Overview

```
┌─────────────────┐        ┌─────────────────┐        ┌──────────────┐
│                 │  HTTP  │                 │  SQL   │              │
│   Frontend      │◄──────►│   Backend       │◄──────►│  PostgreSQL  │
│   (Next.js)     │  REST  │   (Express.js)  │        │              │
│   Port 3000     │        │   Port 8080     │        │  Port 5432   │
└─────────────────┘        └────────┬────────┘        └──────────────┘
                                    │
                                    │ OpenAI API
                                    ▼
                          ┌──────────────────┐
                          │                  │
                          │   OpenAI         │
                          │   (Skill         │
                          │   Classification)│
                          └──────────────────┘
```

The application consists of three services orchestrated via Docker Compose:

- **Frontend** — Next.js 16 application (React 19) with Mantine UI
- **Backend** — Express.js 5 REST API with TypeScript
- **PostgreSQL** — Relational database (Alpine 16)

---

## Quick Start (Docker)

The fastest way to run the full stack:

1. **Clone the repository**

   ```bash
   git clone <repo-url>
   cd Task-Assignment-Application
   ```

2. **Configure environment**

   ```bash
   cp .env.template .env
   ```

   Edit `.env` and set a valid `OPENAI_API_KEY`:

   ```env
   OPENAI_API_KEY=sk-your-real-api-key-here
   ```

3. **Run with Docker Compose**

   ```bash
   docker compose up --build
   ```

   This starts all three services:
   - **PostgreSQL** on port `5432`
   - **Backend** on port `8080`
   - **Frontend** on port `3000`

4. **Open the application**

   Visit [http://localhost:3000](http://localhost:3000).

5. **Seed the database** (optional, provides initial developers and skills)

   ```bash
   docker compose exec backend npm run seed
   ```

6. **Stop the services**

   ```bash
   docker compose down
   ```

   To also remove the database volume:

   ```bash
   docker compose down -v
   ```

---

## Development Setup

For development without Docker, follow these steps.

### Prerequisites

- **Node.js** >= 24
- **npm** >= 10
- **PostgreSQL** 16 running locally

### 1. Set up environment

```bash
cp .env.template .env
```

Edit `.env` with your local PostgreSQL connection details and your OpenAI API key.

### 2. Set up the database

```bash
cd backend
npm install
npm run migrate
npm run seed    # optional, populates initial data
```

### 3. Start the backend

```bash
npm run dev
```

The API starts at `http://localhost:8080`.

### 4. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

The app starts at `http://localhost:3000`.

---

## Tech Stack

### Backend

| Technology       | Version   | Purpose                         |
| ---------------- | --------- | ------------------------------- |
| **Node.js**      | >= 24     | JavaScript runtime              |
| **TypeScript**   | ^7.0.2    | Static type checking            |
| **Express.js**   | ^5.2.1    | HTTP server framework           |
| **PostgreSQL**   | 16        | Relational database             |
| **Drizzle ORM**  | ^0.45.2   | Type-safe SQL ORM               |
| **OpenAI SDK**   | ^6.49.0   | AI-powered skill classification |
| **AJV**          | ^8.20.0   | JSON schema validation          |
| **Helmet**       | ^8.3.0    | Security HTTP headers           |

### Frontend

| Technology               | Version   | Purpose                         |
| ------------------------ | --------- | ------------------------------- |
| **Next.js**              | 16.2.11   | React framework                 |
| **React**                | 19.2.4    | UI library                      |
| **TypeScript**           | ^5        | Static type checking            |
| **Mantine UI**           | ^9.4.2    | Component library & design system |
| **Tailwind CSS**         | ^4        | Utility-first CSS               |
| **Phosphor Icons**       | ^2.1.10   | Icon library                    |

### Infrastructure

| Technology          | Purpose                         |
| ------------------- | ------------------------------- |
| **Docker**          | Containerization                |
| **Docker Compose**  | Multi-service orchestration     |
| **PostgreSQL 16**   | Database (official Alpine image)|

---

## System Design

### Layered Backend Architecture

Each backend module follows a strict **Router → Service → Repository** pattern:

```
Client Request
     │
     ▼
┌─────────────┐  Parses request, validates input (AJV), delegates to service
│   Router    │
└──────┬──────┘
       │
       ▼
┌─────────────┐  Business logic, AI classification, domain validation
│   Service   │
└──────┬──────┘
       │
       ▼
┌─────────────┐  Database queries via Drizzle ORM
│ Repository  │
└─────────────┘
```

- **Routers** handle HTTP concerns (status codes, parameter parsing).
- **Services** contain business rules (e.g., "parent task cannot be Done while sub-tasks are incomplete").
- **Repositories** encapsulate all database access, making the data layer swappable.

### AI Skill Classification

The **SkillClassificationAgent** is invoked when a task is created with an empty `skillsRequired` array:

1. The task title and list of available skills are sent to OpenAI.
2. OpenAI returns a JSON object with the relevant skills.
3. The response is validated against an AJV schema before being applied.
4. This classification runs recursively for all nested sub-tasks.

This design decision reduces manual data entry and ensures consistency in skill tagging.

### Recursive Sub-Task Model

Tasks support unlimited nesting through a self-referencing foreign key (`parent_task_id`):

- **Storage**: All tasks live in a single `tasks` table. Sub-tasks reference their parent via `parent_task_id`. A `CASCADE` delete ensures removing a parent removes all descendants.
- **Creation**: Sub-tasks are created recursively within a single database transaction, ensuring atomicity.
- **Retrieval**: The API returns a flat list from the database and assembles the tree in memory using a `Map<id, Task>` lookup.
- **Business rules**: A parent task cannot be set to "Done" until all sub-tasks are also "Done".

### Frontend Component Design

The frontend uses recursive components to mirror the backend's nested task model:

- **TaskInput** — Renders a task form and recursively renders child `TaskInput` components for sub-tasks. Maintains form state via Mantine's `useForm` with dynamic array paths.
- **TaskRow** — Renders a table row and recursively renders child `TaskRow` components with increasing indent depth.

Both components use a `depth` prop to visually distinguish nesting levels.

### Data Flow

```
Frontend                          Backend                           Database
────────                       ────────                           ────────
  │                                │                                  │
  │  POST /tasks/create            │                                  │
  │───────────────────────────────►│                                  │
  │                                │  Validate skills exist           │
  │                                │  Classify skills (if empty)      │
  │                                │  ──► OpenAI API                  │
  │                                │  BEGIN TRANSACTION               │
  │                                │  ───────────────────────────────►│
  │                                │  Insert parent task              │
  │                                │  Insert task skills              │
  │                                │  Insert sub-tasks (recursive)    │
  │                                │  COMMIT                          │
  │                                │◄─────────────────────────────────│
  │  201 Created                   │                                  │
  │◄───────────────────────────────│                                  │
  │                                │                                  │
  │  GET /tasks/list               │                                  │
  │───────────────────────────────►│                                  │
  │                                │  SELECT tasks LEFT JOIN skills   │
  │                                │─────────────────────────────────►│
  │                                │◄─────────────────────────────────│
  │  [ { tasks with nested         │                                  │
  │      subTasks tree } ]         │                                  │
  │◄───────────────────────────────│                                  │
```

### Security Considerations

- **Helmet** middleware sets secure HTTP headers (CSP, X-Frame-Options, etc.).
- **CORS** is restricted to development environments only.
- **Input validation** via AJV prevents malformed or malicious request bodies.
- **Docker non-root user** reduces the attack surface in production deployments.
- **API key** is required for OpenAI — the backend will not start without `OPENAI_API_KEY`.
- **Foreign key enforcement** at the database level ensures referential integrity.

---

## Project Structure

```
Task-Assignment-Application/
├── .env.template               # Environment variable template
├── docker-compose.yml          # Multi-service orchestration
├── README.md                   # This file
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   ├── drizzle.config.ts
│   └── src/
│       ├── app.ts
│       ├── config/
│       │   ├── env.ts
│       │   └── openai.ts
│       ├── constants/
│       ├── errors/
│       ├── infrastructure/
│       │   └── database/
│       │       ├── index.ts
│       │       ├── schema.ts
│       │       ├── seed.ts
│       │       └── migrations/
│       ├── middlewares/
│       ├── agents/
│       │   └── skill-classification-agent/
│       └── modules/
│           ├── developers/
│           ├── skills/
│           └── tasks/
└── frontend/
    ├── Dockerfile
    ├── package.json
    ├── next.config.ts
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx
    │   └── globals.css
    ├── components/
    │   ├── Shell/
    │   └── TaskListing/
    ├── types/
    └── utils/
```

---

## API Overview

| Resource      | Endpoints                                                      | Description                     |
| ------------- | -------------------------------------------------------------- | ------------------------------- |
| **Developers**| `GET /developers/list`, `GET /developers/:id`                  | List and retrieve developers    |
| **Skills**    | `GET /skills/list`, `GET /skills/:skill`                       | List and retrieve skills        |
| **Tasks**     | `GET /tasks/list`, `GET /tasks/:id`, `POST /tasks/create`, `PATCH /tasks/update/:id`, `GET /tasks/statuses` | Full task CRUD with sub-task support |

See the [backend README](backend/README.md#api-documentation) for detailed API documentation.

---

## Environment Variables

All configurable environment variables are documented in `.env.template`:

| Variable             | Description                        | Default                        | Required |
| -------------------- | ---------------------------------- | ------------------------------ | -------- |
| `ENVIRONMENT`        | Runtime environment                | `development`                  | No       |
| `EXPRESS_PORT`       | Backend API port                   | `8080`                         | No       |
| `FRONTEND_PORT`      | Frontend port (Docker)             | `3000`                         | No       |
| `DATABASE_USERNAME`  | PostgreSQL username                | `postgres`                     | No       |
| `DATABASE_PASSWORD`  | PostgreSQL password                | `postgres`                     | No       |
| `DATABASE_HOST`      | PostgreSQL host                    | — (set automatically in Docker)| Yes*     |
| `DATABASE_PORT`      | PostgreSQL port                    | `5432`                         | No       |
| `DATABASE_NAME`      | PostgreSQL database name           | `task_assignment`              | No       |
| `OPENAI_API_KEY`     | OpenAI API key                     | —                              | **Yes**  |
| `OPENAI_MODEL`       | OpenAI model for inference         | `gpt-5-nano-2025-08-07`               | No       |
| `NEXT_PUBLIC_API_URL`| Backend URL (from frontend)        | `http://localhost:8080`        | No       |

\* `DATABASE_HOST` is required for local development but set automatically when using Docker Compose.

---

## Scripts Reference

### Backend

| Script                    | Description                                |
| ------------------------- | ------------------------------------------ |
| `npm run dev`             | Start development server with hot-reload   |
| `npm run build`           | Compile TypeScript to JavaScript           |
| `npm start`               | Run compiled production server             |
| `npm run build-start`     | Build and start in one command             |
| `npm run generate`        | Generate a new Drizzle migration           |
| `npm run migrate`         | Apply pending migrations to the database   |
| `npm run seed`            | Populate database with seed data           |

### Frontend

| Script          | Description                              |
| --------------- | ---------------------------------------- |
| `npm run dev`   | Start Next.js development server         |
| `npm run build` | Build for production                     |
| `npm start`     | Start production server                  |

---

## Library Justification Summary

### Why Drizzle ORM instead of Prisma or raw SQL?

- **Type safety**: Drizzle provides full TypeScript inference from the database schema, catching errors at compile time.
- **Lightweight**: Unlike Prisma, Drizzle does not require a separate generator process or binary engine.
- **SQL-like API**: Developers with SQL knowledge can write queries that feel familiar, with joins, subqueries, and transactions.
- **Migration control**: Drizzle Kit generates raw SQL migration files that can be reviewed and version-controlled.

### Why Mantine instead of Material UI or Ant Design?

- **Accessibility**: Mantine components are WCAG-compliant out of the box.
- **Hooks ecosystem**: `@mantine/form`, `@mantine/hooks`, and `@mantine/notifications` provide a cohesive experience without extra dependencies.
- **Dark mode**: Built-in color scheme management without additional configuration.
- **Bundle size**: Smaller than Material UI, resulting in faster page loads.

### Why AJV instead of zod or joi?

- **Performance**: AJV is the fastest JSON schema validator for Node.js.
- **Standard compliance**: Uses the JSON Schema specification, making schemas portable.
- **Shared validation**: The same AJV schemas are used to validate both HTTP request bodies and LLM responses from OpenAI.
