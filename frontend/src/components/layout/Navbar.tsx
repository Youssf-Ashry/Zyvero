import { Menu, X } from 'lucide-react';
import { useState } from 'react';

const navItems = ['Product', 'Solutions', 'AI', 'Resources', 'Pricing'];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-[#1B1F2A] bg-[#08090D]/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <a
          href="#"
          className="flex items-center gap-3 text-sm font-semibold tracking-[0.22em] text-[#F5F5F7]"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#7C5CFC] via-[#8B70FF] to-[#2ED3C6] text-[10px] font-bold text-white shadow-lg shadow-[#7C5CFC]/20">
            Z
          </span>
          ZYVERO
        </a>

        <div className="hidden items-center gap-8 text-sm text-[#969BAA] md:flex">
          {navItems.map((item) => (
            <a key={item} href="#" className="transition hover:text-[#F5F5F7]">
              {item}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-4 md:flex">
          <button
            type="button"
            className="rounded-full border border-[#252936] px-4 py-2 text-sm font-medium text-[#F5F5F7] transition hover:border-[#7C5CFC] hover:text-white"
          >
            Sign In
          </button>
          <button
            type="button"
            className="rounded-full bg-[#7C5CFC] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#8B70FF]"
          >
            Get Started
          </button>
        </div>

        <button
          type="button"
          aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#252936] text-[#F5F5F7] md:hidden"
          onClick={() => setIsMenuOpen((value) => !value)}
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {isMenuOpen ? (
        <div className="border-t border-[#1B1F2A] bg-[#08090D] px-4 py-4 md:hidden">
          <div className="flex flex-col gap-4 text-sm text-[#F5F5F7]">
            {navItems.map((item) => (
              <a key={item} href="#" className="rounded-lg px-2 py-2 hover:bg-[#101218]">
                {item}
              </a>
            ))}
            <div className="mt-2 flex items-center gap-3 pt-2">
              <button
                type="button"
                className="flex-1 rounded-full border border-[#252936] px-4 py-2"
              >
                Sign In
              </button>
              <button
                type="button"
                className="flex-1 rounded-full bg-[#7C5CFC] px-4 py-2 font-medium"
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
