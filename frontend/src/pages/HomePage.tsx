import {
  ArrowRight,
  BellRing,
  Bot,
  CheckCheck,
  Clock3,
  FolderKanban,
  Gauge,
  LayoutDashboard,
  ListTodo,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import Footer from '../components/layout/Footer';
import Navbar from '../components/layout/Navbar';
import SectionEyebrow from '../components/ui/SectionEyebrow';

const valueProps = [
  {
    title: 'Plan work',
    description: 'Turn priorities into clear milestones, scope, and execution path.',
    icon: Target,
  },
  {
    title: 'Coordinate teams',
    description: 'Keep stakeholders aligned with shared goals, owners, and next steps.',
    icon: Users,
  },
  {
    title: 'Understand progress',
    description: 'See what is moving, what is blocked, and where momentum is drifting.',
    icon: TrendingUp,
  },
  {
    title: 'Act with AI',
    description: 'Surface recommendations, blockers, and opportunities in real time.',
    icon: Sparkles,
  },
];

const steps = [
  { number: '01', title: 'Plan', detail: 'Shape goals, priorities, and delivery milestones.' },
  { number: '02', title: 'Organize', detail: 'Assign work, track progress, and align teams.' },
  {
    number: '03',
    title: 'Collaborate',
    detail: 'Keep updates, comments, and decisions in context.',
  },
  { number: '04', title: 'Optimize', detail: 'Use AI to flag risks and recommend actions.' },
];

const featureList = [
  { title: 'Project Management', icon: FolderKanban },
  { title: 'Task Management', icon: ListTodo },
  { title: 'Team Collaboration', icon: Users },
  { title: 'Documents & Knowledge', icon: Search },
  { title: 'AI Insights', icon: Bot },
  { title: 'Analytics', icon: Gauge },
  { title: 'Smart Search', icon: Search },
  { title: 'Notifications', icon: BellRing },
];

const showcaseCards = [
  { title: 'Dashboard', icon: LayoutDashboard },
  { title: 'Projects', icon: FolderKanban },
  { title: 'Tasks', icon: ListTodo },
  { title: 'AI Workspace', icon: Bot },
];

const trustPoints = [
  {
    title: 'Reliable workspace',
    description: 'A structured workspace built for visibility and momentum.',
    icon: CheckCheck,
  },
  {
    title: 'Secure collaboration',
    description: 'Clear ownership and permission-ready team workflows.',
    icon: ShieldCheck,
  },
  {
    title: 'Progress intelligence',
    description: 'Live signals help teams understand what needs attention next.',
    icon: Zap,
  },
];

export default function HomePage() {
  return (
    <div className="bg-background text-foreground">
      <Navbar />

      <main className="overflow-hidden">
        <section className="mx-auto max-w-7xl px-4 pb-16 pt-12 sm:px-6 lg:px-8 xl:pt-20">
          <div className="grid items-center gap-12 lg:grid-cols-[1.08fr_0.92fr]">
            <div>
              <SectionEyebrow text="AI-powered workspace" className="mb-6" />

              <h1 className="max-w-xl text-4xl font-semibold tracking-[-0.06em] text-white sm:text-5xl lg:text-7xl">
                Turn ideas into intelligent execution.
              </h1>

              <p className="mt-6 max-w-xl text-base leading-7 text-muted sm:text-lg">
                Plan projects, coordinate your team, and let AI help you move work forward.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-hover"
                >
                  Get Started — Free
                </button>
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-surface px-5 py-3 text-sm font-semibold text-foreground transition hover:border-primary hover:text-white"
                >
                  Explore Platform
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-muted">
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 rounded-full bg-success" />
                  98.9% team alignment
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 rounded-full bg-warning" />
                  2.3x faster decisions
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 -z-10 rounded-[2rem] bg-[radial-gradient(circle_at_top,_rgba(124,92,252,0.32),_transparent_55%)] blur-3xl" />
              <div className="rounded-[28px] border border-border bg-surface p-4 shadow-[0_24px_80px_rgba(3,7,18,0.7)] sm:p-5">
                <div className="rounded-[22px] border border-border bg-surface-secondary p-4 sm:p-5">
                  <div className="flex items-center justify-between border-b border-border pb-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-muted">Workspace</p>
                      <h2 className="mt-2 text-xl font-semibold text-white">Q4 Delivery</h2>
                    </div>
                    <span className="rounded-full border border-success/40 bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
                      On track
                    </span>
                  </div>

                  <div className="mt-5 space-y-4">
                    <div className="rounded-2xl border border-border bg-[#0D1117] p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-sm font-medium text-white">Product roadmap</p>
                        <span className="text-xs text-muted">72%</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-[#1B1F2A]">
                        <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-primary via-primary-hover to-[#2ED3C6]" />
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-border bg-[#0D1117] p-4">
                        <div className="mb-3 flex items-center justify-between text-xs text-muted">
                          <span>Tasks</span>
                          <span>18/26</span>
                        </div>
                        <div className="space-y-3 text-sm text-foreground">
                          <div className="flex items-center justify-between">
                            <span>Design review</span>
                            <span className="text-success">Done</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Payment flows</span>
                            <span className="text-warning">In progress</span>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-border bg-[#0D1117] p-4">
                        <div className="mb-3 flex items-center justify-between text-xs text-muted">
                          <span>Team</span>
                          <span>7 active</span>
                        </div>
                        <div className="flex -space-x-2">
                          {['AL', 'MK', 'JN', 'SR'].map((member, index) => (
                            <div
                              key={member}
                              className={`flex h-9 w-9 items-center justify-center rounded-full border-2 border-surface text-[10px] font-semibold text-white ${
                                index % 2 === 0 ? 'bg-primary' : 'bg-[#2ED3C6]'
                              }`}
                            >
                              {member}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-border bg-gradient-to-r from-primary/10 via-surface to-[#2ED3C6]/10 p-4">
                      <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-[#B7C0D6]">
                        <Bot className="h-4 w-4 text-primary" />
                        AI insight
                      </div>
                      <p className="text-sm text-foreground">
                        Priority 01: Resolve payment integration blocker before Friday review.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="solutions" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <SectionEyebrow text="Why Zyvero" />
            <h2 className="mt-5 text-3xl font-semibold tracking-[-0.05em] text-white sm:text-4xl">
              Built for clarity, execution, and momentum.
            </h2>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {valueProps.map(({ title, description, icon: Icon }) => (
              <article
                key={title}
                className="rounded-2xl border border-border bg-surface p-6 transition hover:-translate-y-0.5 hover:border-primary/60"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#151A26] text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-semibold text-white">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted">{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <SectionEyebrow text="How it works" />
            <h2 className="mt-5 text-3xl font-semibold tracking-[-0.05em] text-white sm:text-4xl">
              Turn strategy into action, step by step.
            </h2>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {steps.map(({ number, title, detail }) => (
              <div key={number} className="rounded-2xl border border-border bg-surface p-6">
                <div className="mb-5 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                    {number}
                  </span>
                  <span className="h-8 w-8 rounded-full border border-border bg-surface-secondary" />
                </div>
                <h3 className="text-xl font-semibold text-white">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted">{detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid items-center gap-8 lg:grid-cols-[1fr_1.05fr]">
            <div>
              <SectionEyebrow text="Project management" />
              <h2 className="mt-5 text-3xl font-semibold tracking-[-0.05em] text-white sm:text-4xl">
                Keep complex work structured and visible.
              </h2>
              <p className="mt-5 max-w-xl text-base leading-7 text-muted">
                Organize milestones, deadlines, and ownership in one premium workspace built for
                high-velocity teams.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-border bg-surface p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted">Milestones</p>
                  <p className="mt-3 text-2xl font-semibold text-white">12</p>
                </div>
                <div className="rounded-2xl border border-border bg-surface p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted">Due soon</p>
                  <p className="mt-3 text-2xl font-semibold text-white">04</p>
                </div>
                <div className="rounded-2xl border border-border bg-surface p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted">Health</p>
                  <p className="mt-3 text-2xl font-semibold text-success">Strong</p>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-border bg-surface p-4 sm:p-5">
              <div className="rounded-[22px] border border-border bg-surface-secondary p-4 sm:p-5">
                <div className="flex items-center justify-between pb-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted">Roadmap</p>
                    <h3 className="mt-2 text-xl font-semibold text-white">Platform Launch</h3>
                  </div>
                  <span className="rounded-full border border-primary/40 bg-primary/10 px-2.5 py-1 text-xs text-[#D6CDFF]">
                    4 weeks
                  </span>
                </div>

                <div className="space-y-4">
                  {[
                    ['Discovery', 'Complete', '92%'],
                    ['UX system', 'In review', '74%'],
                    ['Integration', 'Blocked', '41%'],
                    ['Launch prep', 'Queued', '18%'],
                  ].map(([label, status, progress]) => (
                    <div key={label} className="rounded-xl border border-border bg-[#0D1117] p-3">
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="font-medium text-foreground">{label}</span>
                        <span className="text-muted">{status}</span>
                      </div>
                      <div className="mt-3 h-2.5 rounded-full bg-[#1B1F2A]">
                        <div
                          className={`h-full rounded-full ${
                            label === 'Integration' ? 'w-[41%] bg-error' : 'w-[72%] bg-primary'
                          }`}
                        />
                      </div>
                      <div className="mt-2 text-right text-[11px] text-muted">{progress}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#0B0D12] px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="rounded-[28px] border border-border bg-surface p-4 sm:p-5">
                <div className="rounded-[22px] border border-border bg-surface-secondary p-4 sm:p-5">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-muted">
                        Team activity
                      </p>
                      <h3 className="mt-2 text-xl font-semibold text-white">Sprint pulse</h3>
                    </div>
                    <span className="flex items-center gap-2 rounded-full border border-success/40 bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
                      <Clock3 className="h-3.5 w-3.5" />
                      Live
                    </span>
                  </div>

                  <div className="space-y-4">
                    {[
                      ['Maya', 'Updated onboarding flow', '2m ago'],
                      ['Jordan', 'Commented on API QA', '11m ago'],
                      ['Alicia', 'Reviewed launch brief', '24m ago'],
                    ].map(([name, action, time]) => (
                      <div
                        key={name}
                        className="flex items-start gap-3 rounded-xl border border-border bg-[#0D1117] p-3"
                      >
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
                          {name.slice(0, 1)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <p className="font-medium text-foreground">{name}</p>
                            <span className="text-[11px] text-muted">{time}</span>
                          </div>
                          <p className="mt-1 text-sm text-muted">{action}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <SectionEyebrow text="Team collaboration" />
                <h2 className="mt-5 text-3xl font-semibold tracking-[-0.05em] text-white sm:text-4xl">
                  Work together without losing context.
                </h2>
                <p className="mt-5 max-w-xl text-base leading-7 text-muted">
                  Keep comments, decisions, documents, and progress in one collaborative system
                  designed for product teams.
                </p>

                <div className="mt-8 space-y-4">
                  {[
                    ['Design handoff', '4 tasks assigned'],
                    ['Sprint sync', 'Updated by team lead'],
                    ['Approval cycle', '2 decisions awaiting review'],
                  ].map(([label, meta]) => (
                    <div
                      key={label}
                      className="flex items-center justify-between rounded-2xl border border-border bg-surface p-4"
                    >
                      <div>
                        <p className="font-medium text-white">{label}</p>
                        <p className="mt-1 text-sm text-muted">{meta}</p>
                      </div>
                      <div className="flex items-center gap-2 rounded-full border border-success/40 bg-success/10 px-2.5 py-1 text-xs text-success">
                        <CheckCheck className="h-3.5 w-3.5" />
                        Ready
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <SectionEyebrow text="Zyvero intelligence" />
            <h2 className="mt-5 text-3xl font-semibold tracking-[-0.05em] text-white sm:text-4xl">
              AI that helps teams prioritize with confidence.
            </h2>
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-[0.96fr_1.04fr]">
            <div className="rounded-[28px] border border-border bg-surface p-5 sm:p-6">
              <div className="mb-5 flex items-center justify-between">
                <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-2.5 py-1 text-xs font-medium text-[#D6CDFF]">
                  <Bot className="h-3.5 w-3.5" />
                  AI Insight
                </span>
                <span className="text-xs text-muted">Today</span>
              </div>

              <h3 className="text-xl font-semibold text-white">
                What should my team prioritize this week?
              </h3>

              <div className="mt-6 space-y-4">
                {[
                  ['Priority 01', 'Resolve payment integration blocker', 'High impact • blocked'],
                  ['Priority 02', 'Review authentication tasks', 'High impact • pending review'],
                  ['Priority 03', 'Move low-priority UI work', 'Lower impact • schedule later'],
                ].map(([label, title, meta]) => (
                  <div key={label} className="rounded-2xl border border-border bg-[#0D1117] p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-[#B7C0D6]">{label}</p>
                    <p className="mt-2 text-base font-medium text-white">{title}</p>
                    <p className="mt-1 text-sm text-muted">{meta}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-border bg-gradient-to-br from-primary/8 via-surface to-[#2ED3C6]/8 p-5 sm:p-6">
              <div className="rounded-[22px] border border-border bg-surface-secondary p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted">
                      Project analysis
                    </p>
                    <h3 className="mt-2 text-xl font-semibold text-white">Execution forecast</h3>
                  </div>
                  <span className="text-xs text-muted">+14% efficiency</span>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="mb-2 flex items-center justify-between text-sm text-muted">
                      <span>Risk detection</span>
                      <span>31%</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-[#1B1F2A]">
                      <div className="h-full w-[31%] rounded-full bg-warning" />
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between text-sm text-muted">
                      <span>Momentum</span>
                      <span>81%</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-[#1B1F2A]">
                      <div className="h-full w-[81%] rounded-full bg-success" />
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between text-sm text-muted">
                      <span>Automation opportunity</span>
                      <span>64%</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-[#1B1F2A]">
                      <div className="h-full w-[64%] rounded-full bg-gradient-to-r from-primary to-[#2ED3C6]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#0B0D12] px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-2xl text-center">
              <SectionEyebrow text="Product showcase" />
              <h2 className="mt-5 text-3xl font-semibold tracking-[-0.05em] text-white sm:text-4xl">
                A workspace designed for modern delivery teams.
              </h2>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {showcaseCards.map(({ title, icon: Icon }) => (
                <div key={title} className="rounded-[24px] border border-border bg-surface p-5">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#151A26] text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">{title}</h3>

                  <div className="mt-5 rounded-2xl border border-border bg-[#0D1117] p-3">
                    <div className="mb-3 h-2.5 w-16 rounded-full bg-[#1B1F2A]" />
                    <div className="space-y-2">
                      <div className="h-2 rounded-full bg-border" />
                      <div className="h-2 w-2/3 rounded-full bg-border" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <SectionEyebrow text="Features" />
            <h2 className="mt-5 text-3xl font-semibold tracking-[-0.05em] text-white sm:text-4xl">
              Everything a modern team needs to move with confidence.
            </h2>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {featureList.map(({ title, icon: Icon }) => (
              <div
                key={title}
                className="rounded-2xl border border-border bg-surface p-5 transition hover:border-primary/60"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#151A26] text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-white">{title}</h3>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="rounded-[30px] border border-border bg-surface p-6 sm:p-8 lg:p-10">
            <div className="grid items-center gap-8 lg:grid-cols-[1fr_1.08fr]">
              <div>
                <SectionEyebrow text="Security & reliability" />
                <h2 className="mt-5 text-3xl font-semibold tracking-[-0.05em] text-white sm:text-4xl">
                  A dependable foundation for serious work.
                </h2>
                <p className="mt-5 max-w-lg text-base leading-7 text-muted">
                  Zyvero is designed to give teams a structured, permission-ready workspace for
                  fast-moving work without sacrificing clarity.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {trustPoints.map(({ title, description, icon: Icon }) => (
                  <div
                    key={title}
                    className="rounded-2xl border border-border bg-surface-secondary p-5"
                  >
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#151A26] text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">{title}</h3>
                    <p className="mt-3 text-sm leading-6 text-muted">{description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
          <div className="rounded-[30px] border border-border bg-gradient-to-r from-surface via-surface to-[#1D1532] p-6 text-center sm:p-10 lg:p-12">
            <p className="text-xs uppercase tracking-[0.2em] text-[#B7C0D6]">Build smarter</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-white sm:text-4xl lg:text-5xl">
              Build smarter. Move faster.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-muted">
              Give your team a clearer system to plan work, align execution, and turn insight into
              momentum.
            </p>
            <button
              type="button"
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-hover"
            >
              Get Started — Free
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
