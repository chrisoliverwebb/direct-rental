import { Link } from "react-router-dom";
import { BrowserPreview } from "../components/BrowserPreview";
import { LeadForm } from "../components/LeadForm";
import { SiteHeader } from "../components/SiteHeader";
import { usePageMeta } from "../lib/usePageMeta";

export function HomePage() {
  usePageMeta(
    "Direct Rental | Direct-booking websites for holiday rental hosts",
    "Launch a premium direct-booking website for your holiday rental and reduce reliance on Airbnb and Booking.com.",
  );

  return (
    <main>
      <SiteHeader />
      <section className="container-shell section-spacing">
        <div className="grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="max-w-2xl">
            <h1 className="max-w-xl text-5xl leading-tight text-ink sm:text-6xl">
              Stop losing fees to booking platforms. Get more direct bookings.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-ink/70">
              We build your own booking website, sync your calendar, and help you get direct bookings
              so you keep more of every stay.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#lead-form"
                className="rounded-full bg-pine px-6 py-4 text-center text-base font-medium text-white transition hover:bg-pine/90"
              >
                Get started
              </a>
              <Link
                to="/demo"
                className="rounded-full border border-ink/10 bg-white/80 px-6 py-4 text-center text-base font-medium text-ink transition hover:border-ink/20 hover:bg-white"
              >
                View example property
              </Link>
            </div>
          </div>
          <BrowserPreview />
        </div>
      </section>

      <section className="container-shell section-spacing">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-pine/80">How it works</p>
          <h2 className="mt-4 text-4xl text-ink sm:text-5xl">Simple to get started</h2>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              {
                title: "We build your booking website",
                points: ["Your own branded booking website"],
              },
              {
                title: "Guests book direct with you",
                points: [
                  "Accept direct reservations from guests",
                  "Sync availability with your existing booking platforms",
                ],
              },
              {
                title: "You keep more of every booking",
                points: ["No commissions on direct bookings"],
              },
            ].map((step, index) => (
              <div key={step.title} className="card-surface p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-pine/10 text-lg font-semibold text-pine">
                  {index + 1}
                </div>
                <p className="mt-5 text-xl text-ink">{step.title}</p>
                <div className="mt-5 grid gap-3">
                  {step.points.map((point) => (
                    <div key={point} className="flex items-start gap-3 text-sm text-ink/75">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-pine/10 text-pine">
                        <CheckIcon />
                      </span>
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="container-shell section-spacing">
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="max-w-xl">
            <p className="text-sm uppercase tracking-[0.28em] text-pine/80">Comparison</p>
            <h2 className="mt-4 text-4xl text-ink sm:text-5xl">Keep more of every booking</h2>
            <p className="mt-5 text-lg leading-8 text-ink/70">
              Every time a guest books through booking platforms, a portion of each booking goes in
              fees.
            </p>
            <p className="mt-4 text-lg leading-8 text-ink/70">
              With direct bookings, you keep more of your revenue and stay in control.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[28px] bg-[#24473d] p-6 text-white shadow-soft">
              <p className="text-sm uppercase tracking-[0.24em] text-white/60">
                Booking platforms
              </p>
              <div className="mt-4 space-y-2">
                <h3 className="text-3xl">£1,000 booking</h3>
                <p className="text-lg text-white/80">-15% fees</p>
              </div>
              <div className="mt-8 rounded-[22px] bg-white/10 p-5">
                <p className="whitespace-nowrap text-3xl font-semibold">≈ £850 received</p>
              </div>
              <div className="mt-8 rounded-[22px] bg-white/10 p-4 text-sm text-white/75">
                Less profit, less control, limited direct relationship with guests.
              </div>
            </div>
            <div className="rounded-[28px] bg-pine p-6 text-white shadow-soft">
              <p className="text-sm uppercase tracking-[0.24em] text-white/60">Direct bookings</p>
              <div className="mt-4 space-y-2">
                <h3 className="text-3xl">£1,000 booking</h3>
                <p className="text-lg text-white/80">0% platform fees</p>
              </div>
              <div className="mt-8 rounded-[22px] bg-white/10 p-5">
                <p className="text-3xl font-semibold">£1,000 received</p>
              </div>
              <div className="mt-8 rounded-[22px] bg-white/10 p-4 text-sm text-white/75">
                Better margins, stronger brand, more repeat guest opportunities.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-shell section-spacing">
        <div className="card-surface overflow-hidden">
          <div className="grid gap-8 px-6 py-8 sm:px-8 sm:py-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="max-w-lg">
              <p className="text-sm uppercase tracking-[0.28em] text-pine/80">Demo</p>
              <h2 className="mt-4 text-4xl text-ink">This is what your property could look like</h2>
              <p className="mt-4 text-lg leading-8 text-ink/70">
                A clean, modern booking website designed to convert visitors into direct bookings.
              </p>
              <Link
                to="/demo"
                className="mt-8 inline-flex rounded-full bg-pine px-6 py-4 text-base font-medium text-white transition hover:bg-pine/90"
              >
                View example property
              </Link>
            </div>
            <BrowserPreview />
          </div>
        </div>
      </section>

      <section className="container-shell section-spacing">
        <div>
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-[0.28em] text-pine/80">Traffic</p>
            <h2 className="mt-4 text-4xl text-ink sm:text-5xl">
              We don&apos;t just build your site, we help you get bookings
            </h2>
          </div>
          <div className="mt-8 card-surface grid gap-4 p-6 sm:p-8">
            {[
              {
                title: "Get found online",
                copy: "Your site is built to appear in search results",
                icon: <SearchIcon />,
              },
              {
                title: "Bring in visitors",
                copy: "Use simple ads and social channels to drive traffic",
                icon: <MegaphoneIcon />,
              },
              {
                title: "We guide you",
                copy: "Clear, practical steps - no marketing experience needed",
                icon: <GuideIcon />,
              },
              {
                title: "Convert to direct bookings",
                copy: "Turn traffic into bookings you control",
                icon: <SparkArrowIcon />,
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-4 rounded-[22px] border border-pine/10 bg-white/60 p-4"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-pine/10 text-pine">
                  {item.icon}
                </span>
                <div>
                  <p className="text-base font-semibold text-ink">{item.title}</p>
                  <p className="mt-1 text-sm leading-6 text-ink/65">{item.copy}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="lead-form" className="container-shell section-spacing">
        <div className="card-surface p-6 sm:p-8">
          <div className="mx-auto mb-8 max-w-2xl text-center">
            <p className="text-sm uppercase tracking-[0.28em] text-pine/80">Early access</p>
            <h2 className="mt-4 text-4xl text-ink sm:text-5xl">
              Stop relying only on booking platforms
            </h2>
            <p className="mt-4 text-lg leading-8 text-ink/70">
              Join early access to get your own direct booking website.
            </p>
          </div>
          <div className="mx-auto w-full max-w-3xl">
            <LeadForm />
          </div>
        </div>
      </section>

      <footer className="border-t border-pine/10 bg-mist/45">
        <div className="container-shell py-10">
          <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-pine/70">Direct Rental</p>
              <p className="mt-3 max-w-md text-base leading-7 text-ink/70">
                Direct-booking websites for holiday rental owners who want to keep more of every
                stay.
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">Contact</p>
              <div className="mt-3 grid gap-2 text-sm text-ink/65">
                <p>hello@directrental.io</p>
                <p>Early access enquiries open</p>
              </div>
            </div>
          </div>
          <div className="mt-8 flex flex-col gap-3 border-t border-pine/10 pt-6 text-sm text-ink/55 sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 Direct Rental. All rights reserved.</p>
            <p>Built for holiday rental owners.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 stroke-current" fill="none" strokeWidth="2" aria-hidden="true">
      <path d="M5 12.5l4.2 4.2L19 7.5" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 stroke-current" fill="none" strokeWidth="1.8" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4.5 4.5" />
    </svg>
  );
}

function MegaphoneIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 stroke-current" fill="none" strokeWidth="1.8" aria-hidden="true">
      <path d="M4 12h3l8-4v8l-8-4H4z" />
      <path d="M10 15.5v3.2a1.3 1.3 0 01-2.4.7L6 17" />
      <path d="M18 9.5a3.5 3.5 0 010 5" />
    </svg>
  );
}

function GuideIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 stroke-current" fill="none" strokeWidth="1.8" aria-hidden="true">
      <path d="M6.5 5.5h11a1.5 1.5 0 011.5 1.5v10.5l-3-2-3 2-3-2-3 2V7a1.5 1.5 0 011.5-1.5z" />
      <path d="M9 9.5h6" />
      <path d="M9 12.5h4.5" />
    </svg>
  );
}

function SparkArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 stroke-current" fill="none" strokeWidth="1.8" aria-hidden="true">
      <path d="M6 16l10-10" />
      <path d="M9 6h7v7" />
      <path d="M5.5 9.5l1 2 2 1-2 1-1 2-1-2-2-1 2-1z" />
    </svg>
  );
}
