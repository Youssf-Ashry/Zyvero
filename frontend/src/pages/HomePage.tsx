import { ArrowRight, Layers3, Sparkles, Workflow } from 'lucide-react';

const foundationCards = [
  {
    title: 'Frontend foundation',
    description:
      'React, TypeScript, Vite, Tailwind, routing, and app structure are ready to evolve.',
    icon: Layers3,
  },
  {
    title: 'Backend foundation',
    description: 'NestJS, validation, CORS, config, and a minimal API bootstrap are in place.',
    icon: Workflow,
  },
  {
    title: 'Extensibility',
    description:
      'The repo is intentionally lightweight so future feature work can be added cleanly.',
    icon: Sparkles,
  },
];

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-16 text-slate-50 md:px-10">
      <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-8 shadow-2xl shadow-slate-950/20 backdrop-blur-sm md:p-12">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3 py-1 text-sm font-medium text-cyan-200">
          <Sparkles className="h-4 w-4" />
          Zyvero foundation
        </div>

        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-white md:text-6xl">
          A strong starting point for the Zyvero platform.
        </h1>

        <p className="mt-5 max-w-2xl text-base text-slate-300 md:text-lg">
          This project initializes the monorepo foundation only. The next steps will add real
          product features incrementally as the application grows.
        </p>

        <div className="mt-8 flex items-center gap-3 text-sm text-slate-300">
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          Frontend and backend are configured and ready for development.
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {foundationCards.map(({ title, description, icon: Icon }) => (
          <article
            key={title}
            className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 transition hover:border-cyan-400/60 hover:bg-slate-900"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-300">
              <Icon className="h-5 w-5" />
            </div>
            <h2 className="mb-2 text-xl font-semibold text-white">{title}</h2>
            <p className="text-sm leading-6 text-slate-300">{description}</p>
          </article>
        ))}
      </section>

      <section className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/50 p-5 text-sm text-slate-300">
        <span>Current status: foundation setup complete</span>
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-emerald-200">
          Ready
          <ArrowRight className="h-4 w-4" />
        </span>
      </section>
    </main>
  );
}
