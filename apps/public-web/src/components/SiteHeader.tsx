import { Link, NavLink } from "react-router-dom";
import { DirectRentalLogoTile, brandName } from "@repo/brand";

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
            <DirectRentalLogoTile className="bg-ink text-white" />
            {brandName}
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
