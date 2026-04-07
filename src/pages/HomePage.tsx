import { Link } from "react-router-dom";
import { BrowserPreview } from "../components/BrowserPreview";
import { LeadForm } from "../components/LeadForm";
import { SiteHeader } from "../components/SiteHeader";
import { features, howItWorks, platformPainPoints } from "../data/content";
import { usePageMeta } from "../lib/usePageMeta";

export function HomePage() {
  usePageMeta(
    "Direct Rental | Direct-booking websites for holiday rental hosts",
    "Launch a premium direct-booking website for your holiday rental and reduce reliance on Airbnb and Booking.com.",
  );

  return (
    <main className="pb-12">
      <SiteHeader />
      <section className="container-shell section-spacing">
        <div className="grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="max-w-2xl">
            <p className="mb-5 inline-flex rounded-full border border-pine/15 bg-white/70 px-4 py-2 text-sm text-pine shadow-sm">
              Direct-booking websites for holiday rental hosts
            </p>
            <h1 className="max-w-xl text-5xl leading-tight text-ink sm:text-6xl">
              Get more direct bookings and pay less to Airbnb
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-ink/70">
              Your own booking website with direct reservations and calendar sync in minutes.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#lead-form"
                className="rounded-full bg-pine px-6 py-4 text-center text-base font-medium text-white transition hover:bg-pine/90"
              >
                Book a demo
              </a>
              <Link
                to="/demo"
                className="rounded-full border border-ink/10 bg-white/80 px-6 py-4 text-center text-base font-medium text-ink transition hover:border-ink/20 hover:bg-white"
              >
                View example property
              </Link>
            </div>
            <div className="mt-10 grid max-w-lg gap-4 sm:grid-cols-3">
              {[
                ["No commissions", "Keep more revenue"],
                ["Setup in days", "Not months"],
                ["Host-friendly", "Built to convert"],
              ].map(([title, copy]) => (
                <div key={title} className="rounded-[24px] border border-white/70 bg-white/70 p-4 shadow-sm">
                  <p className="text-sm font-semibold text-ink">{title}</p>
                  <p className="mt-2 text-sm text-ink/60">{copy}</p>
                </div>
              ))}
            </div>
          </div>
          <BrowserPreview />
        </div>
      </section>

      <section className="container-shell section-spacing">
        <div className="card-surface relative overflow-hidden px-6 py-8 sm:px-8 sm:py-10">
          <div className="absolute inset-0 bg-grid-fade bg-[size:32px_32px] opacity-50" />
          <div className="relative">
            <p className="text-sm uppercase tracking-[0.28em] text-pine/80">The problem</p>
            <div className="mt-6 grid gap-5 lg:grid-cols-3">
              {platformPainPoints.map((item) => (
                <div key={item.title} className="rounded-[24px] bg-white/90 p-6 shadow-sm">
                  <h2 className="text-2xl text-ink">{item.title}</h2>
                  <p className="mt-3 text-base leading-7 text-ink/65">{item.copy}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="container-shell section-spacing">
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="max-w-xl">
            <p className="text-sm uppercase tracking-[0.28em] text-pine/80">Keep more revenue</p>
            <h2 className="mt-4 text-4xl text-ink sm:text-5xl">
              A few direct bookings can change the month.
            </h2>
            <p className="mt-5 text-lg leading-8 text-ink/70">
              Even one or two direct stays can offset platform fees and start building a booking channel you actually own.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[28px] bg-[#2a3340] p-6 text-white shadow-soft">
              <p className="text-sm uppercase tracking-[0.24em] text-white/60">Airbnb</p>
              <h3 className="mt-4 text-3xl">£1,000 booking</h3>
              <p className="mt-4 text-white/80">Approx. £150 lost in host + guest fees and platform margin pressure.</p>
              <div className="mt-8 rounded-[22px] bg-white/10 p-4 text-sm text-white/75">
                Less profit, less pricing control, weaker repeat-booking potential.
              </div>
            </div>
            <div className="rounded-[28px] bg-pine p-6 text-white shadow-soft">
              <p className="text-sm uppercase tracking-[0.24em] text-white/60">Direct Rental</p>
              <h3 className="mt-4 text-3xl">Keep more of it</h3>
              <p className="mt-4 text-white/80">
                Your guest books direct, your brand leads the journey, and you keep more of every stay.
              </p>
              <div className="mt-8 rounded-[22px] bg-white/10 p-4 text-sm text-white/75">
                Better margins, stronger brand, more repeat guest opportunities.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="container-shell section-spacing">
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-pine/80">How it works</p>
            <h2 className="mt-4 text-4xl text-ink">A simple setup built for fast validation.</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {howItWorks.map((step, index) => (
              <div key={step} className="card-surface p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-clay/10 text-lg font-semibold text-clay">
                  {index + 1}
                </div>
                <p className="mt-5 text-xl text-ink">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-shell section-spacing">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div key={feature} className="card-surface p-6">
              <p className="text-lg text-ink">{feature}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-shell section-spacing">
        <div className="card-surface overflow-hidden">
          <div className="grid gap-8 px-6 py-8 sm:px-8 sm:py-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="max-w-lg">
              <p className="text-sm uppercase tracking-[0.28em] text-pine/80">Demo preview</p>
              <h2 className="mt-4 text-4xl text-ink">Show hosts what their direct-booking website could look like.</h2>
              <p className="mt-4 text-lg leading-8 text-ink/70">
                A polished example makes the offer tangible. It is easier to sell direct bookings when the site already feels real.
              </p>
              <Link
                to="/demo"
                className="mt-8 inline-flex rounded-full bg-clay px-6 py-4 text-base font-medium text-white transition hover:bg-clay/90"
              >
                View example property
              </Link>
            </div>
            <BrowserPreview />
          </div>
        </div>
      </section>

      <section id="lead-form" className="container-shell section-spacing">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-pine/80">Book a demo</p>
            <h2 className="mt-4 text-4xl text-ink sm:text-5xl">
              Stop relying only on Airbnb. Start building your own booking channel.
            </h2>
            <p className="mt-5 max-w-xl text-lg leading-8 text-ink/70">
              Tell us about your property and we will show you a direct-booking site that looks ready to launch.
            </p>
          </div>
          <div className="card-surface p-6 sm:p-8">
            <LeadForm />
          </div>
        </div>
      </section>
    </main>
  );
}
