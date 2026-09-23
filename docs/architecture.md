# Zyvero Architecture

This repository contains the current Zyvero foundation and the completed first seven internship milestones.

## Current Scope

- Frontend: React + TypeScript + Vite + Tailwind CSS
- Backend: NestJS + TypeScript
- Shared development tooling: ESLint and Prettier
- Environment-driven configuration via `.env.example` templates
- PostgreSQL through Docker Compose with a persistent volume
- Prisma ORM with ContactInquiry, User, Workspace, WorkspaceContent, Project, Task, and ProjectContent models
- Contact / Inquiry API at `POST /api/contact`
- Frontend Contact page connected to the backend API
- JWT authentication and protected NestJS routes
- User signup and login with DTO validation and bcrypt password hashing
- `AuthGuard` protection for authenticated backend APIs
- `ProtectedRoute` protection for authenticated frontend routes
- Authenticated user state through the frontend auth context
- Workspace-scoped project, task, and project knowledge APIs
- Workspace Knowledge CRUD for shared workspace information
- Protected frontend application shell and dashboard
- Customer Dashboard profile editing and local avatar upload
- Company Service Management and admin dashboard
- Customer Request Management and admin status workflow

## Current State

Task 1 provides the responsive company landing page and centralized Zyvero design system. Task 2 adds the Contact / Inquiry flow. Task 3 adds project knowledge CRUD. Task 4 adds user registration and authentication through `/signup` and `/login`, with validated credentials, bcrypt password hashing, JWT authentication, `AuthGuard`-protected backend APIs, `ProtectedRoute`-protected frontend routes, and authenticated user context. Task 5 completes the Customer Dashboard profile section with real authenticated user data, name editing, and protected local avatar upload. The current application foundation also includes workspace membership, project CRUD, task CRUD, a protected dashboard, and Workspace Knowledge backed by PostgreSQL.

Task 6 adds a global `UserRole` (`USER` or `ADMIN`) for company-level administration without changing `WorkspaceRole`. `AdminGuard` checks the current persisted user role after `AuthGuard` authenticates the JWT. The `Service` model is managed through protected admin APIs and exposed publicly only when active.

Task 7 adds `CustomerRequest`, which connects an authenticated customer to an existing `Service`. `RequestStatus` supports `NEW`, `IN_PROGRESS`, `COMPLETED`, and `CANCELLED`. Customers can create and read only their own requests; admins can list all requests, inspect safe customer details, and update status.

## Company Service Management

The service data flow is:

```text
Public HomePage -> GET /api/services -> ServicesService -> Prisma Service -> PostgreSQL
Admin Services UI -> /api/admin/services -> AuthGuard + AdminGuard -> Prisma Service
```

`Service` stores its name, unique slug, descriptions, icon identifier, display order, active state, and timestamps. The public endpoint returns active services ordered by `sortOrder`; admin users can list, create, update, and delete all services. Admin UI is available at `/admin` and `/admin/services`.

## Customer Request architecture

```text
User -> CustomerRequest -> Service
```

The customer workflow uses `GET /api/services` for active service selection, `POST /api/requests` for submission, and `/requests` for ownership-scoped tracking. The administration workflow uses `/admin/requests` and `PATCH /api/admin/requests/:id/status`. Deactivating a service removes it from public listings and new request selection while preserving existing `CustomerRequest` records. Services with existing requests are protected from deletion.

## Customer Dashboard and profile

The protected `/dashboard` route contains the authenticated user's personal profile separately from workspace context. The profile exposes safe user fields (name, email, and optional avatar URL), allows name updates through `PATCH /api/auth/me`, and accepts image-only uploads through `POST /api/auth/avatar` with a local 5 MB limit. Files are stored under `backend/uploads/avatars` and served at `/uploads`; the storage boundary can later be replaced with object storage without changing the profile contract. Dashboard and profile endpoints require `AuthGuard`, while the frontend dashboard remains protected by `ProtectedRoute`.

## Knowledge architecture

`WorkspaceContent` stores knowledge shared across a workspace, such as general guidelines, product information, and team processes. It belongs directly to `Workspace` and is accessed through workspace membership authorization. User profile data, including local avatar metadata, is intentionally not part of workspace knowledge.

`ProjectContent` remains separate and stores knowledge specific to a `Project`. Projects belong to a workspace, so the structure is:

```text
Workspace
├── WorkspaceContent
└── Project
    └── ProjectContent
```

This separation keeps workspace context and project context distinct for future knowledge and AI capabilities.

## Planned Future Direction

The platform will eventually expand with onboarding, richer team workflows, AI features, analytics, notifications, billing, integrations, and other product capabilities. Those areas are planned and not implemented in the current milestones.
