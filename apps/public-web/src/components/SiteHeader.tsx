import { Link, NavLink } from "react-router-dom";

type SiteHeaderProps = {
  ctaHref?: string;
  ctaLabel?: string;
};

export function SiteHeader({
  ctaHref = "/#lead-form",
  ctaLabel = "Get Started",
}: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="container-shell flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-10">
          <Link
            to="/"
            className="flex items-center gap-3 text-center text-sm font-semibold uppercase tracking-[0.24em] text-ink sm:text-left"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-md bg-ink text-white">
              <LogoMark />
            </span>
            Direct Rental
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium text-ink/70">
            <NavLink
              to="/"
              className={({ isActive }: { isActive: boolean }) =>
                isActive
                  ? "text-ink"
                  : "transition hover:text-ink"
              }
              end
            >
              Websites
            </NavLink>
            <NavLink
              to="/marketing"
              className={({ isActive }: { isActive: boolean }) =>
                isActive
                  ? "text-ink"
                  : "transition hover:text-ink"
              }
            >
              Marketing
            </NavLink>
            <NavLink
              to="/demo"
              className={({ isActive }: { isActive: boolean }) =>
                isActive
                  ? "text-ink"
                  : "transition hover:text-ink"
              }
            >
              Demo
            </NavLink>
          </nav>
        </div>
        <a
          href={ctaHref}
          className="button-primary !hidden text-sm sm:!inline-flex sm:w-auto"
        >
          {ctaLabel}
        </a>
      </div>
    </header>
  );
}

function LogoMark() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 stroke-current"
      fill="none"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path d="M4 19V9.5L12 4l8 5.5V19" />
      <path d="M9 19v-5h6v5" />
      <path d="M8 11h.01" />
      <path d="M16 11h.01" />
    </svg>
  );
}
