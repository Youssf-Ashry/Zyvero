# Zyvero

Zyvero is a long-term AI-powered Project & Team Management SaaS platform. This repository currently represents the initial foundation for that product rather than the finished application.

## Current development stage

This project is in the foundational setup phase. It establishes the project structure, tooling, environment configuration, and dev workflow needed for future product build-out.

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

## Future scope

Planned product areas include project management, task workflows, team collaboration, AI integrations, document handling, analytics, notifications, and deployment. These are intentionally not implemented in this foundation.

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
```

## Development guidelines

- Keep the codebase clean and easy to extend.
- Prefer small, intentional changes over unnecessary abstraction.
- Add new business modules only when the corresponding functionality is needed.
- Validate formatting and linting before finalizing work.
- Treat this repository as a durable foundation for future product development.
