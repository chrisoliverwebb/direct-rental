import { Link } from "react-router-dom";

type SiteFooterProps = {
  description?: string;
};

export function SiteFooter({
  description = "Direct-booking websites for holiday rental owners who want to keep more of every stay.",
}: SiteFooterProps) {
  return (
    <footer className="border-t border-pine/10 bg-mist/45">
      <div className="container-shell py-10">
        <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-pine/70">
              Direct Rental
            </p>
            <p className="mt-3 max-w-md text-base leading-7 text-ink/70">
              {description}
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">Contact</p>
            <div className="mt-3 grid gap-2 text-sm text-ink/65">
              <p>hello@directrental.uk</p>
            </div>
          </div>
        </div>
        <div className="mt-8 flex flex-col gap-3 border-t border-pine/10 pt-6 text-sm text-ink/55 sm:flex-row sm:items-center sm:justify-between">
          <p>{"\u00a9"} 2026 Direct Rental. All rights reserved.</p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
            <Link to="/terms" className="transition hover:text-ink">
              Terms &amp; Conditions
            </Link>
            <Link to="/privacy" className="transition hover:text-ink">
              Privacy Policy
            </Link>
            <Link to="/dpa" className="transition hover:text-ink">
              Data Processing Agreement
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
