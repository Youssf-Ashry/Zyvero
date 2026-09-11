# Zyvero Architecture

This repository contains the current Zyvero foundation and the completed first three internship milestones.

## Current Scope

- Frontend: React + TypeScript + Vite + Tailwind CSS
- Backend: NestJS + TypeScript
- Shared development tooling: ESLint and Prettier
- Environment-driven configuration via `.env.example` templates
- PostgreSQL through Docker Compose with a persistent volume
- Prisma ORM with ContactInquiry, User, Workspace, Project, Task, and ProjectContent models
- Contact / Inquiry API at `POST /api/contact`
- Frontend Contact page connected to the backend API
- JWT authentication and protected NestJS routes
- Workspace-scoped project, task, and project knowledge APIs
- Protected frontend application shell and dashboard

## Current State

Task 1 provides the responsive company landing page and centralized Zyvero design system. Task 2 adds the Contact / Inquiry flow. Task 3 adds project knowledge CRUD. The current application foundation also includes JWT authentication, workspace membership, project CRUD, task CRUD, and a protected dashboard backed by PostgreSQL.

## Planned Future Direction

The platform will eventually expand with onboarding, richer team workflows, AI features, analytics, notifications, billing, integrations, and other product capabilities. Those areas are planned and not implemented in the current milestones.
