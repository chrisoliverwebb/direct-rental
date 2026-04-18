import { Link } from "react-router-dom";
import { SiteHeader } from "../components/SiteHeader";
import { usePageMeta } from "../lib/usePageMeta";

export function ThankYouPage() {
  usePageMeta("Thank You | Direct Rental", "Your early access request has been received.");

  return (
    <main className="pb-12">
      <SiteHeader />
      <section className="container-shell section-spacing">
        <div className="card-surface mx-auto max-w-3xl px-6 py-12 text-center sm:px-10">
          <p className="text-sm uppercase tracking-[0.28em] text-pine/80">Thank you</p>
          <h1 className="mt-4 text-5xl text-ink">Thanks, we&apos;ll be in touch soon.</h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-ink/70">
            We&apos;ve recorded your early access interest and will follow up shortly.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/demo"
              className="rounded-full bg-pine px-6 py-4 text-base font-medium text-white transition hover:bg-pine/90"
            >
              View example property
            </Link>
            <Link
              to="/"
              className="rounded-full border border-ink/10 bg-white px-6 py-4 text-base font-medium text-ink transition hover:border-ink/20"
            >
              Return home
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

