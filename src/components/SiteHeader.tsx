import { Link } from "react-router-dom";

export function SiteHeader() {
  return (
    <header className="container-shell pt-6">
      <div className="card-surface flex items-center justify-between px-5 py-4">
        <Link
          to="/"
          className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.24em] text-pine"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-pine text-white">
            DR
          </span>
          Direct Rental
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-ink/70 md:flex">
          <a href="/#how-it-works" className="transition hover:text-ink">
            How it works
          </a>
          <a href="/#pricing" className="transition hover:text-ink">
            ROI
          </a>
          <Link to="/demo" className="transition hover:text-ink">
            Demo property
          </Link>
        </nav>
        <a
          href="/#lead-form"
          className="rounded-full bg-pine px-5 py-3 text-sm font-medium text-white transition hover:bg-pine/90"
        >
          Book a demo
        </a>
      </div>
    </header>
  );
}
