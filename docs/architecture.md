# Zyvero Architecture

This repository contains the current Zyvero foundation and the completed first two internship milestones.

## Current Scope

- Frontend: React + TypeScript + Vite + Tailwind CSS
- Backend: NestJS + TypeScript
- Shared development tooling: ESLint and Prettier
- Environment-driven configuration via `.env.example` templates
- PostgreSQL through Docker Compose with a persistent volume
- Prisma ORM with the `ContactInquiry` model
- Contact / Inquiry API at `POST /api/contact`
- Frontend Contact page connected to the backend API

## Current State

Task 1 provides the responsive company landing page and centralized Zyvero design system. Task 2 adds the Contact / Inquiry flow: the frontend submits contact form data to NestJS, server-side validation checks required fields and email format, and Prisma persists valid inquiries in PostgreSQL.

## Planned Future Direction

The platform will eventually expand into a full SaaS application with authentication, projects, tasks, teams, documents, AI features, analytics, notifications, and other product capabilities. Those areas are planned and not implemented in the current milestones.
