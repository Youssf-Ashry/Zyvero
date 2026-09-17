# Development Guide

## Prerequisites

- Node.js 20+
- npm

## Frontend

1. Open the `frontend` directory.
2. Copy `.env.example` to a local `.env` file if needed.
3. Run `npm install`.
4. Start the app with `npm run dev`.

## Backend

1. Open the `backend` directory.
2. Copy `.env.example` to a local `.env` file if needed.
3. Run `npm install`.
4. Start PostgreSQL from the repository root with `docker compose up -d postgres`.
5. Start the API with `npm run start:dev`.

## Contact / Inquiry flow

The completed Task 2 flow is available at `POST /api/contact`.

- The frontend Contact page submits `name`, `email`, `subject`, and `message`.
- NestJS validates required, non-empty fields and email format.
- Valid inquiries are persisted to PostgreSQL through Prisma.
- The frontend displays loading, success, and user-safe error feedback.

The Prisma migration is located under `backend/prisma/migrations/`.

## Authenticated application flow

The local application foundation supports:

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- Workspace-scoped project, task, and project content CRUD
- Workspace Knowledge CRUD at `/api/workspaces/:workspaceId/content`

Start PostgreSQL before the backend, then use the frontend routes `/signup`, `/login`, `/dashboard`, `/projects`, `/projects/:id/content`, and `/knowledge`.

Task 4 — User Registration & Authentication is completed. Signup and login requests are validated by NestJS DTOs, passwords are hashed with bcrypt, and successful authentication issues a JWT. Backend APIs use `AuthGuard`, frontend application routes use `ProtectedRoute`, and the authenticated user is exposed through the frontend auth context. Authentication uses a local JWT token and an HTTP-only cookie.

Task 5 — Customer Dashboard is completed. The protected `/dashboard` route displays real authenticated profile data and keeps personal profile information separate from workspace data. Users can update their name with `PATCH /api/auth/me` and upload an image avatar with `POST /api/auth/avatar`. Avatar uploads are authenticated, image-only, limited to 5 MB, persisted through the nullable `User.avatarUrl` field, and stored locally in `backend/uploads/avatars` during development. The backend serves these files from `/uploads`, and the frontend refreshes its authenticated user context after profile changes.

Workspace Knowledge is shared across the selected workspace and supports creating, listing, reading, updating, and deleting `WorkspaceContent` items. Project Knowledge remains separate at `/projects/:id/content` and operates on `ProjectContent`.

## Quality checks

- `npm run lint`
- `npm run build`
- `npx prettier --check .`

These checks guard the current foundation and completed Task 1, Task 2, Task 3, and Task 4 implementations while keeping future changes consistent.
