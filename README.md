# Zyvero

Zyvero is a long-term AI-powered Project & Team Management SaaS platform. This repository is being developed through incremental full-stack internship milestones.

## Current state

The project foundation, landing page, Contact / Inquiry system, and initial authenticated SaaS application foundation are implemented locally.

### Implemented

- Zyvero project foundation and monorepo-style structure
- React + TypeScript + Vite frontend
- Tailwind CSS, React Router, and Lucide React
- NestJS backend foundation
- ESLint and Prettier configuration
- Frontend and backend environment configuration foundation
- Responsive company landing page (Task 1)
- Landing-page navbar, footer, hero, product previews, value proposition, workflow, collaboration, intelligence, features, trust, and final CTA sections
- Centralized Zyvero design tokens and semantic color system
- Global design tokens in `frontend/src/index.css`
- Tailwind semantic color utilities in `frontend/tailwind.config.js`
- PostgreSQL database through Docker Compose with a persistent volume
- Prisma ORM foundation and `ContactInquiry` model
- Contact / Inquiry backend API: `POST /api/contact`
- Server-side validation for required fields, non-empty values, and valid email format
- PostgreSQL persistence for valid contact inquiries
- Responsive frontend Contact page with loading, success, and error states
- Contact navigation from the landing-page footer
- JWT authentication with signup, login, logout, and current-user sessions
- Workspace and workspace-member foundations
- Workspace-scoped project CRUD
- Project task CRUD with status, priority, and member assignment
- Project Content / Knowledge CRUD
- Protected frontend application shell with dashboard, projects, tasks, and knowledge routes
- Real PostgreSQL-backed dashboard and project interfaces

## Project progress

| Task                                 | Status        |
| ------------------------------------ | ------------- |
| Task 1 — Company Landing Page        | **COMPLETED** |
| Task 2 — Contact / Inquiry System    | **COMPLETED** |
| Task 3 — Project Content / Knowledge | **COMPLETED** |

Task 1 was the first internship milestone, followed by Task 2 for the Contact / Inquiry system and Task 3 for project knowledge. The authenticated SaaS foundation now provides the base for future Zyvero product capabilities.

## Design direction

- Dark-first modern AI SaaS
- Premium, minimal, technical visual language
- Semantic design tokens for consistent styling
- Responsive desktop and mobile experience

## Frontend stack

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Lucide React
- ESLint
- Prettier

## Backend stack

- NestJS
- TypeScript
- ESLint
- Prettier
- Config-driven environment setup
- Global validation and CORS configuration

## Repository structure

```text
Zyvero/
├── backend/
│   ├── src/
│   ├── test/
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── docs/
│   ├── architecture.md
│   └── development.md
├── frontend/
│   ├── public/
│   ├── src/
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── .gitignore
├── README.md
└── ...
```

## Planned future scope

The following areas are planned and **not implemented yet**:

- Onboarding
- Teams and collaboration workflows
- AI workspace
- LLM-powered features
- RAG and project knowledge
- AI project insights
- Analytics
- Notifications
- Search and command palette
- Settings
- Billing
- Integrations
- Other future SaaS capabilities

AI workspace, RAG, billing, and related future business functionality are not currently implemented.

## Getting started

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
npm install
npm run start:dev
```

## Environment variables

Use the `.env.example` files in each app as templates for local environment configuration. Do not commit real secrets or credentials.

### Frontend

```env
VITE_API_URL=http://localhost:3000/api
```

### Backend

```env
PORT=3000
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
DATABASE_URL=postgresql://zyvero:zyvero@localhost:5432/zyvero?schema=public
```

### Database

Start PostgreSQL through the existing Docker Compose configuration:

```bash
docker compose up -d postgres
```

The backend uses Prisma with the `ContactInquiry` model and the applied migration under `backend/prisma/migrations/`.

## Development guidelines

- Keep the codebase clean and easy to extend.
- Prefer small, intentional changes over unnecessary abstraction.
- Add new business modules only when the corresponding functionality is needed.
- Validate formatting and linting before finalizing work.
- Treat this repository as a durable foundation for future product development.
