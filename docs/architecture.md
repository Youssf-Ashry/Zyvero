# Zyvero Architecture

This repository contains the current Zyvero foundation and completed Task 1 through Task 10 milestones.

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
- Database-backed search and filtering for requests and tasks
- Centralized workspace role-based access control
- Backend Document metadata and authenticated local file management

## Current State

Task 1 provides the responsive company landing page and centralized Zyvero design system. Task 2 adds the Contact / Inquiry flow. Task 3 adds project knowledge CRUD. Task 4 adds user registration and authentication through `/signup` and `/login`, with validated credentials, bcrypt password hashing, JWT authentication, `AuthGuard`-protected backend APIs, `ProtectedRoute`-protected frontend routes, and authenticated user context. Task 5 completes the Customer Dashboard profile section with real authenticated user data, name editing, and protected local avatar upload. The current application foundation also includes workspace membership, project CRUD, task CRUD, a protected dashboard, and Workspace Knowledge backed by PostgreSQL.

Task 6 adds a global `UserRole` (`USER` or `ADMIN`) for company-level administration without changing `WorkspaceRole`. `AdminGuard` checks the current persisted user role after `AuthGuard` authenticates the JWT. The `Service` model is managed through protected admin APIs and exposed publicly only when active.

Task 7 adds `CustomerRequest`, which connects an authenticated customer to an existing `Service`. `RequestStatus` supports `NEW`, `IN_PROGRESS`, `COMPLETED`, and `CANCELLED`. Customers can create and read only their own requests; admins can list all requests, inspect safe customer details, and update status.

Task 8 adds backend-connected search and filtering to the existing Admin Customer Requests and workspace Tasks sections. URL query state is validated by NestJS and translated into Prisma `where` conditions executed by PostgreSQL.

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

## Search and filtering architecture

```text
URL query state -> NestJS validation -> Prisma where -> PostgreSQL -> filtered results
```

Admin Customer Requests accepts `search`, `status`, `serviceId`, and `dateRange`. Search is case-insensitive across request title/description, customer name/email, and service name. Status, service, and date filters combine with AND semantics.

Workspace Tasks accepts `search`, `status`, `priority`, `assigneeId`, and `projectId` through `GET /api/workspaces/:workspaceId/tasks`. Search covers task title and description, while project and assignee filters use the existing relations and workspace authorization. The `/admin/requests` and `/tasks` pages keep filter state in the URL and render backend-filtered results; local array filtering is not the source of truth.

## Authorization and RBAC

Zyvero has two intentionally separate authorization levels:

```text
global UserRole (USER | ADMIN) -> AdminGuard -> platform administration
workspace WorkspaceRole (OWNER | ADMIN | MEMBER)
  -> role-to-permission map
  -> WorkspacePermissionGuard
  -> workspace-scoped operation
```

`AdminGuard` remains the authority for `/admin`, services, and customer-request administration. Workspace roles are read from the `WorkspaceMember` record for the requested workspace and never trusted from the frontend or JWT. The centralized permission set covers projects, tasks, task assignment, knowledge, members, and workspace administration. Existing service-level ownership rules remain as a second, domain-specific boundary for member-owned projects, tasks, and project content.

The frontend receives each workspace's current membership role and resolved permissions from the authenticated workspace list. Its permission helper hides or disables actions for usability only; every protected API repeats the database-backed membership and permission check. Unauthenticated requests return `401 Unauthorized`, while authenticated non-members and users without the required permission return `403 Forbidden`.

## Workspace Members management

The protected `/settings/members` page uses the current workspace from `AuthContext` and the existing APIs:

```text
GET    /api/workspaces/:workspaceId
POST   /api/workspaces/:workspaceId/members
PATCH  /api/workspaces/:workspaceId/members/:memberId
DELETE /api/workspaces/:workspaceId/members/:memberId
```

Adding a member looks up an existing Zyvero user by email; it does not send invitations or create accounts. Only `ADMIN` and `MEMBER` can be assigned. The backend explicitly protects the existing `OWNER` membership from role changes/removal and never creates another owner. Member actions are shown by `MEMBER_INVITE`, `MEMBER_UPDATE_ROLE`, and `MEMBER_REMOVE`, but server-side guards remain authoritative.

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

## Document architecture (Task 10)

Binary files are represented by the `Document` model; `WorkspaceContent` and
`ProjectContent` remain the text knowledge models. Every document belongs to a
workspace and may optionally reference a project in that same workspace.
Document metadata stores the original name, generated stored name, MIME type,
size, logical storage key, uploader, and timestamps.

The `DocumentsModule` separates HTTP handling, business rules, Prisma metadata,
and physical storage. `DocumentStorage` is the replaceable abstraction and
`LocalDocumentStorageService` currently stores files below
`backend/uploads/documents`. Storage keys are generated from UUIDs and scoped
by workspace and optional project; original names are never used as paths.

The authenticated routes are:

```text
GET    /api/workspaces/:workspaceId/documents
POST   /api/workspaces/:workspaceId/documents
GET    /api/workspaces/:workspaceId/documents/:id
GET    /api/workspaces/:workspaceId/documents/:id/download
DELETE /api/workspaces/:workspaceId/documents/:id
```

All routes use JWT authentication and the existing workspace permission guard.
Viewing and downloading require `KNOWLEDGE_VIEW`, uploading requires
`KNOWLEDGE_CREATE`, and deletion requires `KNOWLEDGE_DELETE`. The backend
verifies membership, workspace/project isolation, file presence, supported
extension and MIME pairs (PDF, DOC, DOCX, TXT), non-empty content, and the
10 MB limit. Documents are not publicly served; downloads stream through the
authenticated API.

## Document frontend integration (Task 10)

Documents are rendered inside the existing Knowledge routes rather than in a
separate file-manager area. Workspace Knowledge lists workspace-level files and
allows an uploader to optionally choose a project. Project Knowledge lists only
files whose `projectId` matches the current project. Existing text content CRUD
and project/workspace navigation remain unchanged.

`DocumentsSection` uses typed API helpers for listing, multipart upload,
authenticated download, and deletion. It provides responsive cards, human
readable sizes, file metadata, uploader/project context, upload progress state,
validation feedback, retryable loading errors, empty states, and delete
confirmation. Upload and delete controls are hidden using the current
`AuthContext.hasWorkspacePermission` helper when the corresponding knowledge
permission is missing; the backend remains authoritative for every request.

Task 10 is complete within this defined scope. AI/RAG, extraction, OCR,
embeddings, document search, sharing, versioning, collaborative editing, cloud
storage, and antivirus/malware scanning remain intentional future limitations.

## Planned Future Direction

The platform will eventually expand with onboarding, richer team workflows, AI features, analytics, notifications, billing, integrations, and other product capabilities. Those areas are planned and not implemented in the current milestones.
