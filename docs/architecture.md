# Zyvero Architecture

This repository contains the current Zyvero foundation and the completed first three internship milestones.

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
- Workspace-scoped project, task, and project knowledge APIs
- Workspace Knowledge CRUD for shared workspace information
- Protected frontend application shell and dashboard

## Current State

Task 1 provides the responsive company landing page and centralized Zyvero design system. Task 2 adds the Contact / Inquiry flow. Task 3 adds project knowledge CRUD. The current application foundation also includes JWT authentication, workspace membership, project CRUD, task CRUD, a protected dashboard, and Workspace Knowledge backed by PostgreSQL.

## Knowledge architecture

`WorkspaceContent` stores knowledge shared across a workspace, such as general guidelines, product information, and team processes. It belongs directly to `Workspace` and is accessed through workspace membership authorization.

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
