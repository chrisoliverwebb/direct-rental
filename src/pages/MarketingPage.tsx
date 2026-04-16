import { LeadForm } from "../components/LeadForm";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";
import { usePageMeta } from "../lib/usePageMeta";

const MARKETING_STRIPE_CHECKOUT_URL =
  "https://buy.stripe.com/28EcN69Ykf399EtcnZ63K01";

const marketingChannels = [
  {
    eyebrow: "Email List",
    title: "Build a guest list you can use to drive repeat bookings",
    copy: "Keep past guests organised in one place, send seasonal offers and simple newsletters, and stay visible after checkout so more guests come back direct.",
    points: [
      "Import and grow your guest list",
      "Send newsletters and updates",
      "Promote seasonal offers and late availability",
      "Keep repeat bookings moving without manual follow-up",
    ],
    visual: "email" as const,
  },
  {
    eyebrow: "SMS",
    title: "Use SMS for fast offers and last-minute availability",
    copy: "Send short, timely messages when you want quick visibility, perfect for late availability, returning guest offers, and direct booking reminders.",
    points: [
      "Send short offers that get seen quickly",
      "Promote last-minute availability",
      "Drive guests straight back to your direct booking flow",
    ],
    visual: "sms" as const,
  },
  {
    eyebrow: "Works with your current setup",
    title: "Keep your current website and booking system",
    copy: "Already using your own website, Lodgify, Supercontrol, Booking.com, Airbnb or another setup? Direct Rental Marketing layers on top of what you already have and gives you simple marketing tools to bring more people back to your existing site.",
    points: [
      "No need to replace your current booking system",
      "Layer marketing on top of your existing website",
      "Ideal if you already get guests but rarely market to them",
    ],
    visual: "setup" as const,
  },
];

const campaignExamples = [
  {
    label: "Returning guest discount",
    icon: "percent" as const,
    href: "/marketing/examples#returning-guest-discount",
  },
  {
    label: "Availability reminder",
    icon: "calendar" as const,
    href: "/marketing/examples#availability-reminder",
  },
  {
    label: "Last-minute weekend offer",
    icon: "clock" as const,
    href: "/marketing/examples#last-minute-weekend-offer",
  },
  {
    label: "Early access for past guests",
    icon: "star" as const,
    href: "/marketing/examples#early-access-for-past-guests",
  },
];

export function MarketingPage() {
  usePageMeta(
    "Direct Rental Marketing | Get more repeat bookings from past guests",
    "A simple marketing system for holiday rental owners to manage past guests, send offers, and fill empty dates.",
  );

  return (
    <main>
      <SiteHeader
        ctaHref={MARKETING_STRIPE_CHECKOUT_URL}
        ctaLabel="Get Started"
      />

      <section className="container-shell section-spacing">
        <div className="grid items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="max-w-2xl">
            <h1 className="max-w-3xl text-4xl leading-tight text-ink sm:text-5xl">
              Get more direct bookings and keep guests coming back
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-ink/70">
              A simple marketing system for holiday rental owners to manage
              past guests, send offers, and bring guests back again.
            </p>
            <div className="mt-7">
              <a href={MARKETING_STRIPE_CHECKOUT_URL} className="button-primary">
                Get Started
              </a>
            </div>
            <p className="mt-4 text-sm text-ink/55">
              £15/month · Cancel anytime · Works with your current setup
            </p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 rounded-xl bg-[radial-gradient(circle_at_top,_rgba(29,78,216,0.16),_transparent_58%)]" />
            <div className="relative rounded-xl border border-pine/10 bg-white/90 p-5 shadow-soft sm:p-6">
              <div className="rounded-lg bg-slate-50 p-5">
                <div className="grid gap-3">
                  {[
                    "Past guests collected in one place",
                    "Email and SMS campaigns sent in minutes",
                    "Keep contact with customers between stays",
                    "More direct repeat bookings over time",
                  ].map((item, index) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 rounded-lg border border-pine/10 bg-white px-4 py-3"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-pine text-sm font-semibold text-white">
                        {index + 1}
                      </span>
                      <span className="text-sm text-ink/75">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-frame">
        <div className="container-shell section-spacing">
          <div className="grid gap-0">
            {marketingChannels.map((channel, index) => (
              <MarketingChannelSection
                key={channel.eyebrow}
                {...channel}
                reverse={index % 2 === 1}
                isLast={index === marketingChannels.length - 1}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="section-frame">
        <div className="container-shell section-spacing">
          <div className="max-w-2xl">
            <p className="eyebrow-label">Examples</p>
            <h2 className="mt-3 text-3xl text-ink sm:text-4xl">
              Simple campaigns you can send
            </h2>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {campaignExamples.map((example) => (
              <a
                key={example.label}
                href={example.href}
                className="rounded-lg border border-slate-200 bg-white px-5 py-6 shadow-soft transition hover:border-pine/25 hover:shadow-md"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-md bg-pine/10 text-pine">
                  <CampaignExampleIcon icon={example.icon} />
                </span>
                <p className="mt-4 text-base font-semibold leading-7 text-ink">
                  {example.label}
                </p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section id="start-now" className="section-frame">
        <div className="container-shell section-spacing">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow-label">Start Now</p>
            <h2 className="mt-3 text-3xl text-ink sm:text-4xl">
              Start using your guest list to bring guests back
            </h2>
            <p className="mt-4 text-base leading-7 text-ink/70">
              Tell us a little about your property and we'll help you get set up
              with a simple repeat-booking marketing system.
            </p>
          </div>
          <div className="mx-auto mt-8 w-full max-w-3xl">
            <LeadForm
              checkoutUrl={MARKETING_STRIPE_CHECKOUT_URL}
              emailOnly
            />
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

function CampaignExampleIcon({
  icon,
}: {
  icon: "percent" | "calendar" | "clock" | "star";
}) {
  if (icon === "percent") {
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5 stroke-current"
        fill="none"
        strokeWidth="1.8"
        aria-hidden="true"
      >
        <path d="M6 18 18 6" />
        <circle cx="7.5" cy="7.5" r="2.5" />
        <circle cx="16.5" cy="16.5" r="2.5" />
      </svg>
    );
  }

  if (icon === "calendar") {
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5 stroke-current"
        fill="none"
        strokeWidth="1.8"
        aria-hidden="true"
      >
        <path d="M7 3v3" />
        <path d="M17 3v3" />
        <rect x="4" y="5" width="16" height="15" rx="2" />
        <path d="M4 10h16" />
      </svg>
    );
  }

  if (icon === "clock") {
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5 stroke-current"
        fill="none"
        strokeWidth="1.8"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8v5l3 2" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 stroke-current"
      fill="none"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path d="m12 4 2.3 4.7 5.2.8-3.8 3.7.9 5.2-4.6-2.4-4.6 2.4.9-5.2-3.8-3.7 5.2-.8Z" />
    </svg>
  );
}

type MarketingChannelSectionProps = {
  eyebrow: string;
  title: string;
  copy: string;
  points: string[];
  visual: "email" | "sms" | "setup";
  isLast?: boolean;
  reverse?: boolean;
};

function MarketingChannelSection({
  eyebrow,
  title,
  copy,
  isLast = false,
  points,
  visual,
  reverse = false,
}: MarketingChannelSectionProps) {
  const hasVisual = true;

  return (
    <div className={isLast ? "" : "border-b border-slate-200"}>
      <div
        className={[
          "grid gap-8 px-6 py-7 sm:px-7 sm:py-8 lg:items-stretch",
          hasVisual ? "lg:grid-cols-[1fr_0.95fr]" : "",
          reverse ? "lg:grid-cols-[0.95fr_1fr]" : "",
        ].join(" ")}
      >
        <div
          className={[
            "flex h-full flex-col justify-center",
            reverse ? "lg:order-2" : "",
          ].join(" ")}
        >
          <p className="eyebrow-label">{eyebrow}</p>
          <h2 className="mt-3 max-w-2xl text-3xl text-ink sm:text-4xl">
            {title}
          </h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-ink/70">
            {copy}
          </p>
          <div className="mt-6 grid gap-3">
            {points.map((point) => (
              <div
                key={point}
                className="flex items-start gap-3 rounded-lg border border-pine/10 bg-slate-50 px-4 py-4 text-sm leading-6 text-ink/75"
              >
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-pine/10 text-pine">
                  <CheckIcon />
                </span>
                <span>{point}</span>
              </div>
            ))}
          </div>
        </div>
        {hasVisual ? (
          <div className={reverse ? "lg:order-1" : undefined}>
            <ChannelVisual visual={visual} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function ChannelVisual({ visual }: { visual: "email" | "sms" | "setup" }) {
  if (visual === "email") {
    return (
      <div className="flex h-full rounded-xl border border-slate-200 bg-white p-8 sm:p-10">
        <div className="flex w-full flex-col justify-center gap-6">
          <img
            src="/marketing/email-list.svg"
            alt="Email list newsletter illustration"
            className="mx-auto block w-full max-w-[230px]"
          />
          <div className="mx-auto w-full max-w-[320px] rounded-lg border border-pine/10 bg-white/80 p-3 shadow-soft backdrop-blur">
            <div className="space-y-2">
              {[
                {
                  name: "Sarah Walker",
                  email: "sarah@guestmail.com",
                  tag: "3 months ago",
                },
                {
                  name: "Tom Bennett",
                  email: "tom@holidayguest.co.uk",
                  tag: "6 weeks ago",
                },
                {
                  name: "Emma Reed",
                  email: "emma@coastalstay.com",
                  tag: "2 months ago",
                },
              ].map((contact) => (
                <div
                  key={contact.email}
                  className="flex items-center justify-between rounded-md border border-pine/10 bg-white px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">
                      {contact.name}
                    </p>
                    <p className="truncate text-xs text-ink/55">
                      {contact.email}
                    </p>
                  </div>
                  <span className="ml-3 shrink-0 rounded-md bg-pine/10 px-2.5 py-1 text-[11px] font-semibold text-pine">
                    {contact.tag}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (visual === "sms") {
    return (
      <div className="flex h-full items-center rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="mx-auto max-w-[340px] rounded-[18px] border border-slate-200 bg-slate-100 p-2.5 shadow-soft">
          <div className="rounded-[14px] border border-white/80 bg-slate-50 px-4 pb-4 pt-3">
            <div className="mx-auto h-1.5 w-16 rounded-sm bg-slate-300" />
            <div className="mt-3 flex items-center justify-between text-[11px] font-medium text-ink/45">
              <span>9:41</span>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#a7b3ac]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#a7b3ac]" />
                <span className="h-2.5 w-4 rounded-sm border border-[#a7b3ac]" />
              </div>
            </div>
            <div className="mt-4 grid gap-3">
              <div className="flex justify-center">
                <span className="rounded-md bg-slate-200 px-3 py-1 text-[11px] font-medium text-ink/45">
                  Today
                </span>
              </div>
              <div className="mr-8 rounded-md bg-white px-4 py-3 text-sm leading-6 text-ink/75 shadow-sm">
                Hi Sarah, 17-19 May has just opened up again at Seabrook
                Cottage. As a past guest, you can book direct before we release
                the dates elsewhere.
                <br />
                <br />
                Return guest offer: 2 nights for GBP395. Use code RETURN10:
                directrental.uk/seabrook
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="flex h-full items-center rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
      <img
        src="/marketing/existing-website.svg"
        alt="Existing website and marketing integration illustration"
        className="mx-auto block w-full max-w-[360px]"
      />
    </div>
  );
}


