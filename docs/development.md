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

Task 6 — Company Service Management is completed. Users default to the global `USER` role; an `ADMIN` can manage services through:

- `GET /api/services` for active public services
- `GET /api/admin/services`
- `POST /api/admin/services`
- `GET /api/admin/services/:id`
- `PATCH /api/admin/services/:id`
- `DELETE /api/admin/services/:id`

Admin endpoints require both `AuthGuard` authentication and `AdminGuard` authorization. The admin UI is available at `/admin` and `/admin/services`, while the public home page fetches the current service catalog from the API and handles loading, empty, and error states. Workspace membership roles remain independent from the global company admin role.

Workspace Knowledge is shared across the selected workspace and supports creating, listing, reading, updating, and deleting `WorkspaceContent` items. Project Knowledge remains separate at `/projects/:id/content` and operates on `ProjectContent`.

Task 7 — Customer Request Management is completed. Authenticated customers use `/requests` to select an active service from `GET /api/services`, submit a title and description, and track their own requests at `/requests/:id`. Customer APIs are:

- `POST /api/requests`
- `GET /api/requests`
- `GET /api/requests/:id`

Admins use `/admin/requests` and `/admin/requests/:id` to review requests and update status through `PATCH /api/admin/requests/:id/status`. Customer ownership is enforced from the authenticated JWT user; `customerId` is never accepted from the client. Admin endpoints require `AuthGuard` and `AdminGuard`. Request statuses are `NEW`, `IN_PROGRESS`, `COMPLETED`, and `CANCELLED`.

Customer requests reference the existing Task 6 `Service` model and remain distinct from `ContactInquiry`. Inactive services cannot receive new requests, but existing requests remain associated with them.

Task 8 — Search & Filtering is completed for `/admin/requests` and `/tasks`. The admin request page sends `search`, `status`, `serviceId`, and `dateRange` to `GET /api/admin/requests`. The Tasks page sends `search`, `status`, `priority`, `assigneeId`, and `projectId` to `GET /api/workspaces/:workspaceId/tasks`.

All filters are validated and applied in Prisma/PostgreSQL, including relational request search across customers and services. Filter state is synchronized with URL query parameters for refresh and navigation behavior. The frontend displays result counts and loading, empty, error, and cleared-filter states without fetching the full dataset for local filtering. Request search remains protected by `AuthGuard` and `AdminGuard`; task search preserves workspace membership authorization.

## Role-based access control

Task 9 is completed with global and workspace authorization kept separate:

- `UserRole.ADMIN` is a platform role enforced by `AdminGuard`.
- `WorkspaceRole.OWNER`, `ADMIN`, and `MEMBER` are membership roles resolved from the database.
- `Permission` and `workspaceRolePermissions` are the single workspace permission source of truth.
- `@RequirePermissions(...)` and `WorkspacePermissionGuard` protect workspace-scoped controllers after `AuthGuard`.
- Project, task, project-knowledge, workspace-knowledge, and member APIs verify the requested workspace membership.
- `TASK_ASSIGN` is checked server-side when a task assignee is created or changed.
- Existing ownership checks remain in project/task/content services and further restrict member-owned operations.

Add a future permission by updating the centralized enum and role mapping, then applying `@RequirePermissions` to the relevant route. Do not add frontend-only security checks or trust role values supplied by clients. Use `401` for unauthenticated requests and `403` for authenticated non-members or insufficient permissions.

## Workspace Members management

Open `/settings/members` from the authenticated application shell to manage the current workspace. Owners and workspace admins can add existing Zyvero users by email as `MEMBER` or `ADMIN`, update non-owner roles, and remove non-owner members according to their permissions. The page never offers `OWNER`; the backend DTO validation and service checks reject `OWNER` even if a request is manually crafted. Duplicate memberships and unknown users are reported by the API. Members can view the list when `MEMBER_VIEW` is granted but cannot perform management actions.

## Quality checks

- `npm run lint`
- `npm run build`
- `npx prettier --check .`

These checks guard the current foundation and completed Task 1, Task 2, Task 3, and Task 4 implementations while keeping future changes consistent.
