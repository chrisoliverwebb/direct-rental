import { Link } from "react-router-dom";

export function SiteHeader() {
  return (
    <header className="container-shell pt-6">
      <div className="card-surface flex items-center justify-between px-5 py-4">
        <Link
          to="/"
          className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.24em] text-pine"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-pine text-white shadow-sm">
            <LogoMark />
          </span>
          Direct Rental
        </Link>
        <a
          href="/#lead-form"
          className="rounded-full bg-pine px-5 py-3 text-sm font-medium text-white transition hover:bg-pine/90"
        >
          Join early access
        </a>
      </div>
    </header>
  );
}

function LogoMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 stroke-current" fill="none" strokeWidth="1.8" aria-hidden="true">
      <path d="M4 19V9.5L12 4l8 5.5V19" />
      <path d="M9 19v-5h6v5" />
      <path d="M8 11h.01" />
      <path d="M16 11h.01" />
    </svg>
  );
}
