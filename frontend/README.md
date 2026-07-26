# Frontend — Task Assignment Application

The frontend is a **Next.js** application built with **React 19**, **Mantine UI**, and **Tailwind CSS**. It provides a modern, responsive interface for managing tasks, developers, and skills.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Setup & Running](#setup--running)
  - [Local Development](#local-development)
  - [Docker](#docker)
- [Project Structure](#project-structure)
- [System Design](#system-design)
- [Dependencies & Justification](#dependencies--justification)

---

## Prerequisites

- **Node.js** >= 24
- **npm** >= 10
- The backend API must be running (see [backend README](../backend/README.md))

---

## Environment Variables

| Variable             | Description                 | Default                    | Required |
| -------------------- | --------------------------- | -------------------------- | -------- |
| `NEXT_PUBLIC_API_URL`| Base URL of the backend API | `http://localhost:8080`    | No       |

Copy the template from the project root:

```bash
cp .env.template .env
```

---

## Setup & Running

### Local Development

1. **Install dependencies**

   ```bash
   cd frontend
   npm install
   ```

2. **Configure environment**

   ```bash
   cp ../.env.template ../.env
   # Ensure NEXT_PUBLIC_API_URL points to your running backend
   ```

3. **Start the development server**

   ```bash
   npm run dev
   ```

   The app starts at `http://localhost:3000`.

4. **Build for production**

   ```bash
   npm run build
   npm start
   ```

### Docker

The frontend is containerized and intended to be run via Docker Compose from the project root. See the [root README](../README.md) for instructions.

To build just the frontend image:

```bash
docker build \
  --build-arg NEXT_PUBLIC_API_URL=http://localhost:8080 \
  -f frontend/Dockerfile \
  -t task-assignment-frontend \
  ./frontend
```

---

## Project Structure

```
frontend/
├── Dockerfile
├── next.config.ts              # Next.js configuration
├── package.json
├── postcss.config.mjs          # PostCSS with Mantine + Tailwind
├── tsconfig.json
├── app/
│   ├── globals.css             # Tailwind CSS entry point + theme variables
│   ├── layout.tsx              # Root layout with Mantine provider
│   └── page.tsx                # Home page — fetches tasks and renders Shell + TaskListing
├── components/
│   ├── Shell/
│   │   ├── Shell.tsx           # App shell with header and Add Task button
│   │   ├── AddTaskModal.tsx    # Modal form for creating tasks
│   │   ├── TaskInput.tsx       # Recursive form component for tasks/sub-tasks
│   │   └── types.ts            # Form-specific TypeScript types
│   └── TaskListing/
│       ├── TaskListing.tsx     # Task table with data fetching & update logic
│       ├── TaskListingBody.tsx # Table body rendering
│       ├── TaskRow.tsx         # Individual task row with inline editing
│       └── types.ts            # Task listing TypeScript types
├── constants/
│   └── status.ts               # Shared status constants
├── types/
│   └── api.ts                  # API response TypeScript interfaces
└── utils/
    └── api.ts                  # API URL builder & error extraction utility
```

---

## System Design

### Component Architecture

The frontend is organized into two main feature component groups:

1. **Shell** — Provides the application chrome (header bar, add-task button, modal form).
2. **TaskListing** — Displays the task hierarchy in a table with inline editing.

### Recursive Task Form (AddTaskModal + TaskInput)

The `AddTaskModal` contains a `TaskInput` component that renders recursively to support arbitrarily nested sub-tasks:

- The `TaskInput` component accepts a `depth` prop to visually indent nested levels.
- Each level has its own title input, skills multi-select, assignee dropdown, and a nested sub-tasks section.
- Sub-tasks can be added or removed dynamically via form array operations from `@mantine/form`.
- On submission, the frontend recursively strips frontend-only fields (like `id`) and sends a structured JSON payload to `POST /tasks/create`.

### Recursive Task Listing (TaskListing + TaskRow)

The `TaskListing` component fetches all tasks from the API and builds a hierarchical tree:

- `TaskRow` renders a single task with inline `Select` components for status and assignee.
- After rendering a task row, it recursively renders all sub-task rows with increasing `depth` indentation.
- Updates are sent to `PATCH /tasks/update/:id` and the task list is automatically refreshed.

### Data Flow

1. **Home page** (`page.tsx`) fetches tasks from the API using `useFetch`.
2. The tasks array is transformed from the API shape (flat with `parentTaskId`) to a nested tree via `toLocalTask()`.
3. `Shell` renders the header and the `AddTaskModal`.
4. `TaskListing` displays the tree and handles inline updates.
5. When a task is created or updated, `refetchTasks()` is called to refresh the data.

### Styling

The UI combines:

- **Mantine UI** — Provides the design system components (Table, Modal, Select, Badge, notifications, etc.).
- **Tailwind CSS** — Used for utility-first layout and spacing via the `@tailwindcss/postcss` plugin.
- **Phosphor Icons** — Lightweight, consistent icon set.

### Responsive Design

Mantine's built-in responsive utilities and the AppShell layout ensure the application works across desktop and tablet viewports.

---

## Dependencies & Justification

| Dependency                      | Purpose                                  | Why it was chosen                                                      |
| ------------------------------- | ---------------------------------------- | ---------------------------------------------------------------------- |
| **next**                        | React framework with SSR/SSG             | Industry standard for React applications; file-based routing, optimized builds, strong community |
| **react** / **react-dom**       | UI library                               | De-facto standard for building interactive user interfaces             |
| **@mantine/core**               | Component library (design system)        | Comprehensive, accessible React components with excellent DX; built-in dark mode, forms, and hooks |
| **@mantine/form**               | Form state management                    | Seamless integration with Mantine components; supports dynamic arrays for nested sub-tasks |
| **@mantine/hooks**              | React hooks (useDisclosure, useFetch)    | Includes `useFetch` for simple API calls and `useDisclosure` for modal state |
| **@mantine/notifications**      | Toast notification system                | Lightweight, customizable notifications that integrate with Mantine theming |
| **@phosphor-icons/react**       | Icon library                             | Clean, consistent icon set; better performance than Font Awesome      |
| **tailwindcss**                 | Utility-first CSS framework              | Enables rapid, consistent styling without leaving JSX                 |
| **@tailwindcss/postcss**        | Tailwind CSS PostCSS plugin (v4)         | Required for Tailwind v4 PostCSS integration                          |
| **postcss-preset-mantine**      | Mantine PostCSS preset                   | Applies Mantine-specific PostCSS transforms (e.g., rem scaling)       |
| **postcss-simple-vars**         | CSS variables in PostCSS                 | Used to define Mantine breakpoint variables for PostCSS processing    |
| **typescript**                  | Type checking                            | Provides static typing across the entire frontend codebase            |
