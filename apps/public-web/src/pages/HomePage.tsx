import { Link } from "react-router-dom";
import { BrowserPreview } from "../components/BrowserPreview";
import { LeadForm } from "../components/LeadForm";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";
import { usePageMeta } from "../lib/usePageMeta";

const GBP = "\u00a3";
const syncCalendarDays = [
  null,
  null,
  null,
  { day: 1 },
  { day: 2, bookingSource: "airbnb" },
  { day: 3, bookingSource: "airbnb" },
  { day: 4, bookingSource: "airbnb" },
  { day: 5, bookingSource: "airbnb" },
  { day: 6 },
  { day: 7 },
  { day: 8 },
  { day: 9, bookingSource: "direct" },
  { day: 10, bookingSource: "direct" },
  { day: 11, bookingSource: "direct" },
  { day: 12, bookingSource: "direct" },
  { day: 13 },
  { day: 14 },
  { day: 15 },
  { day: 16 },
  { day: 17, bookingSource: "booking" },
  { day: 18, bookingSource: "booking" },
  { day: 19, bookingSource: "vrbo" },
  { day: 20, bookingSource: "vrbo" },
  { day: 21, bookingSource: "vrbo" },
  { day: 22 },
  { day: 23, bookingSource: "direct" },
  { day: 24, bookingSource: "direct" },
  { day: 25, bookingSource: "direct" },
  { day: 26, bookingSource: "direct" },
  { day: 27, bookingSource: "direct" },
  { day: 28, bookingSource: "direct" },
  { day: 29 },
  { day: 30 },
  null,
  null,
];

export function HomePage() {
  usePageMeta(
    "Direct Rental | Direct booking websites for holiday rental hosts",
    "Launch a direct booking website for your holiday rental and reduce reliance on booking platforms.",
  );

  return (
    <main>
      <SiteHeader />

      <section className="container-shell section-spacing">
        <div className="grid items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="max-w-2xl">
            <h1 className="max-w-3xl text-4xl leading-tight text-ink sm:text-5xl">
              Stop losing fees to booking platforms. Take bookings directly.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-ink/70">
              We build direct booking websites for holiday rental owners who
              want to move away from manual bookings and reduce reliance on
              booking platforms.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <a
                href="#lead-form"
                className="button-primary"
              >
                Get your site
              </a>
              <Link
                to="/demo"
                className="button-secondary"
              >
                View example property
              </Link>
            </div>
            <p className="mt-4 text-sm text-ink/55">
              {GBP}19/month per property
            </p>
          </div>
          <BrowserPreview />
        </div>
      </section>

      <section className="section-frame">
        <div className="container-shell section-spacing">
          <div>
            <p className="eyebrow-label">How it works</p>
            <h2 className="mt-3 text-3xl text-ink sm:text-4xl">
              Simple to get started
            </h2>

            <div className="mt-7 grid gap-4 lg:grid-cols-3 lg:gap-0 lg:border-y lg:border-slate-200">
              {[
                {
                  title: "We build your website",
                  points: ["Your own branded booking site"],
                },
                {
                  title: "Guests book direct with you",
                  points: ["Accept direct reservations and sync availability"],
                },
                {
                  title: "You stay in control",
                  points: [
                    "Keep more of each booking and build direct guest relationships",
                  ],
                },
              ].map((step, index) => (
                <div
                  key={step.title}
                  className={[
                    "py-5 lg:px-6 lg:py-6",
                    index < 2 ? "lg:border-r lg:border-slate-200" : "",
                  ].join(" ")}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-pine/10 text-base font-semibold text-pine">
                      {index + 1}
                    </div>
                    <p className="text-lg text-ink">{step.title}</p>
                  </div>
                  <div className="mt-4 grid gap-3">
                    {step.points.map((point) => (
                      <div
                        key={point}
                        className="flex items-start gap-3 text-sm text-ink/75"
                      >
                        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-pine/10 text-pine">
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
        </div>
      </section>

      <section className="section-frame">
        <div className="container-shell section-spacing">
          <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr]">
            <div className="max-w-lg">
              <p className="eyebrow-label">Demo</p>
              <h2 className="mt-3 text-3xl text-ink sm:text-4xl">
                This is what your property could look like
              </h2>
              <p className="mt-4 text-base leading-7 text-ink/70">
                A modern, mobile-friendly website designed to help guests book
                direct with you.
              </p>
              <Link
                to="/demo"
                className="button-primary mt-8"
              >
                View example property
              </Link>
            </div>
            <BrowserPreview />
          </div>
        </div>
      </section>

      <section className="section-frame">
        <div className="container-shell section-spacing">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.95fr] lg:items-center">
            <div className="max-w-2xl">
              <p className="eyebrow-label">Calendar sync</p>
              <h2 className="mt-3 text-3xl text-ink sm:text-4xl">
                Keep your availability in sync across booking sites
              </h2>
              <p className="mt-4 text-base leading-7 text-ink/70">
                Sync with Airbnb, Booking.com, Vrbo, and other booking sites.
              </p>
              <p className="mt-3 text-base leading-7 text-ink/70">
                Fewer manual updates and less risk of double bookings.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <PlatformBadge
                  name="Airbnb"
                  accent="bg-[#ff5a5f]"
                  textColor="text-white"
                  logoSrc="/assets/platforms/airbnb.svg"
                />
                <PlatformBadge
                  name="Booking.com"
                  accent="bg-[#003580]"
                  textColor="text-white"
                  logoSrc="/assets/platforms/booking.png"
                />
                <PlatformBadge
                  name="Vrbo"
                  accent="bg-[#0E214B]"
                  textColor="text-white"
                  logoSrc="/assets/platforms/vrbo.svg"
                />
                <PlatformBadge
                  name="Other sites"
                  accent="bg-[#edf5f1]"
                  textColor="text-pine"
                />
              </div>
            </div>

            <div className="rounded-lg border border-pine/10 bg-white p-4">
              <div className="rounded-md border border-slate-200/80 bg-white p-4">
                <div className="grid grid-cols-7 gap-2 text-center text-[11px] uppercase tracking-[0.18em] text-ink/40">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                    (day) => (
                      <span key={day}>{day}</span>
                    ),
                  )}
                </div>
                <div className="mt-3 grid grid-cols-7 gap-2">
                  {syncCalendarDays.map((entry, index) => {
                    if (!entry) {
                      return (
                        <div
                          key={`empty-${index}`}
                          className="aspect-square rounded-lg bg-transparent"
                        />
                      );
                    }

                    return (
                      <div
                        key={entry.day}
                        className={[
                          "flex aspect-square items-center justify-center rounded-md text-sm font-medium",
                          entry.bookingSource === "airbnb"
                            ? "bg-[#ff5a5f] text-white"
                            : entry.bookingSource === "booking"
                              ? "bg-[#003b95] text-white"
                              : entry.bookingSource === "vrbo"
                                ? "bg-[#0E214B] text-white"
                                : entry.bookingSource === "direct"
                                  ? "bg-blue-100 text-blue-700"
                                  : "border border-slate-200/80 bg-white text-ink/70",
                        ].join(" ")}
                      >
                        {entry.day}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-frame">
        <div className="container-shell section-spacing">
          <div className="max-w-3xl">
            <p className="eyebrow-label">Traffic</p>
            <h2 className="mt-3 text-3xl text-ink sm:text-4xl">
              We don&apos;t just build your site, we help you get bookings
            </h2>
          </div>
          <div className="mt-7 grid gap-4 lg:grid-cols-2 lg:gap-0 lg:border-y lg:border-slate-200">
            {[
              {
                title: "Search-friendly from day one",
                copy: "Built to show up clearly in search",
                icon: <SearchIcon />,
              },
              {
                title: "Run simple ad campaigns",
                copy: "Send traffic from Google or social media",
                icon: <MegaphoneIcon />,
              },
              {
                title: "Clear guidance",
                copy: "Practical help without marketing jargon",
                icon: <GuideIcon />,
              },
              {
                title: "Turn visits into direct bookings",
                copy: "Direct guests to your own site, not just platforms",
                icon: <SparkArrowIcon />,
              },
            ].map((item) => (
              <div
                key={item.title}
                className={[
                  "flex items-start gap-4 py-5 lg:px-6 lg:py-6",
                  item.title === "Search-friendly from day one" ||
                  item.title === "Clear guidance"
                    ? "lg:border-r lg:border-slate-200"
                    : "",
                ].join(" ")}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-pine/10 text-pine">
                  {item.icon}
                </span>
                <div>
                  <p className="text-base font-semibold text-ink">
                    {item.title}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-ink/65">
                    {item.copy}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="lead-form" className="section-frame">
        <div className="container-shell section-spacing">
          <div className="mx-auto mb-8 max-w-2xl text-center">
            <p className="eyebrow-label">Get started</p>
            <h2 className="mt-3 text-3xl text-ink sm:text-4xl">
              Get your own direct booking website
            </h2>
            <p className="mt-4 text-base leading-7 text-ink/70">
              Tell us a bit about your property and current setup, and we’ll see
              if Direct Rental is a good fit.
            </p>
          </div>
          <div className="mx-auto w-full max-w-3xl">
            <LeadForm />
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4 stroke-current"
      fill="none"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M5 12.5l4.2 4.2L19 7.5" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 stroke-current"
      fill="none"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4.5 4.5" />
    </svg>
  );
}

function MegaphoneIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 stroke-current"
      fill="none"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path d="M4 12h3l8-4v8l-8-4H4z" />
      <path d="M10 15.5v3.2a1.3 1.3 0 01-2.4.7L6 17" />
      <path d="M18 9.5a3.5 3.5 0 010 5" />
    </svg>
  );
}

function GuideIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 stroke-current"
      fill="none"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path d="M6.5 5.5h11a1.5 1.5 0 011.5 1.5v10.5l-3-2-3 2-3-2-3 2V7a1.5 1.5 0 011.5-1.5z" />
      <path d="M9 9.5h6" />
      <path d="M9 12.5h4.5" />
    </svg>
  );
}

function SparkArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 stroke-current"
      fill="none"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path d="M6 16l10-10" />
      <path d="M9 6h7v7" />
      <path d="M5.5 9.5l1 2 2 1-2 1-1 2-1-2-2-1 2-1z" />
    </svg>
  );
}

type PlatformBadgeProps = {
  name: string;
  accent: string;
  textColor: string;
  logoSrc?: string;
};

function PlatformBadge({
  name,
  accent,
  textColor,
  logoSrc,
}: PlatformBadgeProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3">
      {logoSrc ? (
        <span
          className={[
            "flex h-12 min-w-12 items-center justify-center rounded-full px-2",
            accent,
          ].join(" ")}
        >
          <img
            src={logoSrc}
            alt={`${name} logo`}
            className="h-7 w-auto max-w-[92px]"
          />
        </span>
      ) : (
        <span
          className={[
            "flex h-12 min-w-12 items-center justify-center rounded-full px-3 text-xs font-semibold uppercase tracking-[0.14em]",
            accent,
            textColor,
          ].join(" ")}
        >
          +
        </span>
      )}
      <p className="text-sm font-semibold text-ink">{name}</p>
    </div>
  );
}
