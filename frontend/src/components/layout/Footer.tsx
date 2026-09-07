const productLinks = ['Overview', 'Projects', 'Tasks', 'AI'];
const resourceLinks = ['Documentation', 'Guides', 'Support', 'Partners'];
const companyLinks = ['About', 'Careers', 'Contact', 'Privacy'];
const legalLinks = ['Terms', 'Security', 'Cookies', 'Status'];

export default function Footer() {
  return (
    <footer className="border-t border-[#1B1F2A] bg-background">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr_0.8fr] lg:px-8">
        <div>
          <div className="mb-5 flex items-center gap-3 text-sm font-semibold tracking-[0.22em] text-foreground">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary via-primary-hover to-[#2ED3C6] text-[10px] font-bold text-white">
              Z
            </span>
            ZYVERO
          </div>
          <p className="max-w-xs text-sm leading-6 text-muted">
            A premium workspace for turning ideas into intelligent execution.
          </p>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-foreground">
            Product
          </h3>
          <ul className="space-y-3 text-sm text-muted">
            {productLinks.map((link) => (
              <li key={link}>
                <a href="#" className="transition hover:text-foreground">
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-foreground">
            Resources
          </h3>
          <ul className="space-y-3 text-sm text-muted">
            {resourceLinks.map((link) => (
              <li key={link}>
                <a href="#" className="transition hover:text-foreground">
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-foreground">
            Company
          </h3>
          <ul className="space-y-3 text-sm text-muted">
            {companyLinks.map((link) => (
              <li key={link}>
                <a
                  href={link === 'Contact' ? '/contact' : '#'}
                  className="transition hover:text-foreground"
                >
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-foreground">
            Legal
          </h3>
          <ul className="space-y-3 text-sm text-muted">
            {legalLinks.map((link) => (
              <li key={link}>
                <a href="#" className="transition hover:text-foreground">
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-[#1B1F2A]">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© 2026 Zyvero. All rights reserved.</p>
          <p>Built for teams that want clarity, momentum, and AI support.</p>
        </div>
      </div>
    </footer>
  );
}
