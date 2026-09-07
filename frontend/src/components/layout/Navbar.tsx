import { Menu, X } from 'lucide-react';
import { useState } from 'react';

const navItems = ['Product', 'Solutions', 'AI', 'Resources', 'Pricing', 'Contact'];
export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-[#1B1F2A] bg-background/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <a
          href="#"
          className="flex items-center gap-3 text-sm font-semibold tracking-[0.22em] text-foreground"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-primary-hover to-[#2ED3C6] text-[10px] font-bold text-white shadow-lg shadow-primary/20">
            Z
          </span>
          ZYVERO
        </a>

        <div className="hidden items-center gap-8 text-sm text-muted md:flex">
          {navItems.map((item) => (
            <a
              key={item}
              href={item === 'Contact' ? '/contact' : '#'}
              className="transition hover:text-foreground"
            >
              {item}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-4 md:flex">
          <button
            type="button"
            className="rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:border-primary hover:text-white"
          >
            Sign In
          </button>
          <button
            type="button"
            className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-hover"
          >
            Get Started
          </button>
        </div>

        <button
          type="button"
          aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground md:hidden"
          onClick={() => setIsMenuOpen((value) => !value)}
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {isMenuOpen ? (
        <div className="border-t border-[#1B1F2A] bg-background px-4 py-4 md:hidden">
          <div className="flex flex-col gap-4 text-sm text-foreground">
            {navItems.map((item) => (
              <a
                key={item}
                href={item === 'Contact' ? '/contact' : '#'}
                className="rounded-lg px-2 py-2 hover:bg-surface"
                onClick={() => setIsMenuOpen(false)}
              >
                {item}
              </a>
            ))}
            <div className="mt-2 flex items-center gap-3 pt-2">
              <button type="button" className="flex-1 rounded-full border border-border px-4 py-2">
                Sign In
              </button>
              <button
                type="button"
                className="flex-1 rounded-full bg-primary px-4 py-2 font-medium"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
