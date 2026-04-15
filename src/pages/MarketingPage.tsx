import type { ReactNode } from "react";
import { LeadForm } from "../components/LeadForm";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";
import { usePageMeta } from "../lib/usePageMeta";

const marketingChannels = [
  {
    eyebrow: "Email List",
    title: "Build and maintain a guest email list you can actually use.",
    copy:
      "Keep past guests organised in one place, send simple newsletters, share seasonal offers, and stay visible long after checkout.",
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
    title: "Reach guests instantly with short, timely SMS campaigns.",
    copy:
      "Use SMS for last-minute offers, reminders, and direct booking prompts when you need fast visibility and quick responses.",
    points: [
      "Send short offers that get seen quickly",
      "Promote last-minute availability",
      "Drive guests straight back to your direct booking flow",
      "Add another channel beyond email alone",
    ],
    visual: "sms" as const,
  },
  {
    eyebrow: "Paid Ads",
    title: "Run practical paid campaigns to bring direct bookings",
    copy:
      "Use Google Ads for high-intent search traffic and Facebook or Instagram ads to stay in front of past guests and similar audiences.",
    points: [
      "Google Ads, Facebook and Instagram campaigns",
      "Promote special offers and peak dates",
      "Bring paid traffic back to your own booking funnel",
    ],
    visual: "ads" as const,
  },
];

export function MarketingPage() {
  usePageMeta(
    "Direct Rental Marketing | Turn past guests into repeat bookings",
    "Simple marketing tools for holiday rental owners to build a guest database, send campaigns, and drive repeat bookings.",
  );

  return (
    <main>
      <SiteHeader ctaHref="#start-now" ctaLabel="Start Now" />

      <section className="container-shell section-spacing">
        <div className="card-surface overflow-hidden">
          <div className="grid gap-10 px-6 py-10 sm:px-8 sm:py-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="max-w-2xl">
              <p className="eyebrow-label">Marketing Suite</p>
              <h1 className="mt-3 text-4xl leading-tight text-ink sm:text-5xl">
                Turn Past Guests Into Repeat Bookings
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-8 text-ink/70">
                Simple marketing tools designed for holiday rental owners.
              </p>
              <div className="mt-8">
                <a href="#start-now" className="button-primary">
                  Get Started
                </a>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 rounded-[28px] bg-[radial-gradient(circle_at_top,_rgba(31,77,63,0.18),_transparent_58%)]" />
              <div className="relative rounded-[28px] border border-pine/10 bg-white/90 p-5 shadow-soft sm:p-6">
                <div className="rounded-[22px] bg-[#f7fbf9] p-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-pine/70">
                    Repeat booking flow
                  </p>
                  <div className="mt-5 grid gap-3">
                    {[
                      "Past guests collected in one place",
                      "Email and SMS campaigns sent in minutes",
                      "Keep contact with customers between stays",
                      "More direct repeat bookings over time",
                    ].map((item, index) => (
                      <div
                        key={item}
                        className="flex items-center gap-3 rounded-2xl border border-pine/10 bg-white px-4 py-3"
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-pine text-sm font-semibold text-white">
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
        </div>
      </section>

      <section className="container-shell section-spacing pt-0">
        <div className="grid gap-6">
          {marketingChannels.map((channel, index) => (
            <MarketingChannelSection
              key={channel.eyebrow}
              {...channel}
              reverse={index % 2 === 1}
            />
          ))}
        </div>
      </section>

      <section id="start-now" className="container-shell section-spacing pt-0">
        <div className="card-surface p-6 sm:p-7">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow-label">Start Now</p>
            <h2 className="mt-3 text-3xl text-ink sm:text-4xl">
              Start turning past guests into repeat bookings.
            </h2>
            <p className="mt-4 text-base leading-7 text-ink/70">
              Enter your details to get started, or book a quick call if you
              want to talk it through first.
            </p>
          </div>
          <div className="mx-auto mt-8 w-full max-w-3xl">
            <LeadForm />
          </div>
          <div className="mt-6 text-center">
            <a
              href="mailto:hello@directrental.uk?subject=Marketing%20quick%20call"
              className="text-sm font-semibold text-pine transition hover:text-pine/80"
            >
              {"\u2192"} Or book a quick call
            </a>
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

type MarketingChannelSectionProps = {
  eyebrow: string;
  title: string;
  copy: string;
  points: string[];
  visual: "email" | "sms" | "ads";
  reverse?: boolean;
};

function MarketingChannelSection({
  eyebrow,
  title,
  copy,
  points,
  visual,
  reverse = false,
}: MarketingChannelSectionProps) {
  return (
    <div className="card-surface overflow-hidden">
      <div
        className={[
          "grid gap-8 px-6 py-7 sm:px-7 sm:py-8 lg:grid-cols-[1fr_0.95fr] lg:items-center",
          reverse ? "lg:grid-cols-[0.95fr_1fr]" : "",
        ].join(" ")}
      >
        <div className={reverse ? "lg:order-2" : undefined}>
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
                className="flex items-start gap-3 rounded-2xl border border-pine/10 bg-[#f7fbf9] px-4 py-4 text-sm leading-6 text-ink/75"
              >
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-pine/10 text-pine">
                  <CheckIcon />
                </span>
                <span>{point}</span>
              </div>
            ))}
          </div>
        </div>
        <div className={reverse ? "lg:order-1" : undefined}>
          <ChannelVisual visual={visual} />
        </div>
      </div>
    </div>
  );
}

function ChannelVisual({ visual }: { visual: "email" | "sms" | "ads" }) {
  if (visual === "email") {
    return (
      <div className="rounded-[26px] border border-pine/10 bg-[#f7fbf9] p-4 sm:p-5">
        <div className="rounded-[22px] border border-pine/10 bg-white p-4 shadow-soft sm:p-5">
          <div className="overflow-hidden rounded-[18px] bg-[radial-gradient(circle_at_top,_rgba(217,230,224,0.7),_transparent_48%),linear-gradient(180deg,_#fbfdfc_0%,_#f2f8f4_100%)]">
            <img
              src="/marketing/email-list.svg"
              alt="Email list newsletter illustration"
              className="mx-auto block w-full max-w-[420px]"
            />
          </div>
        </div>
      </div>
    );
  }

  if (visual === "sms") {
    return (
      <div className="rounded-[26px] border border-pine/10 bg-[linear-gradient(180deg,_#e7f0ea_0%,_#f6fbf8_100%)] p-4 sm:p-5">
        <div className="mx-auto max-w-[340px] rounded-[36px] border border-[#d7e2db] bg-[#eef3ef] p-2.5 shadow-soft">
          <div className="rounded-[30px] border border-white/80 bg-[#f4f7f5] px-4 pb-4 pt-3">
            <div className="mx-auto h-1.5 w-16 rounded-full bg-[#d8dfdb]" />
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
                <span className="rounded-full bg-[#dfe9e2] px-3 py-1 text-[11px] font-medium text-ink/45">
                  Today
                </span>
              </div>
              <div className="mr-8 rounded-[20px] rounded-bl-md bg-white px-4 py-3 text-sm leading-6 text-ink/75 shadow-sm">
                Hi Sarah, we have 17-19 May free again at Seabrook Cottage.
                Past guests can book direct first before we reopen the dates.
                <br />
                <br />
                Return guest offer: 2 nights for GBP395. Use code RETURN10
                here: directrental.uk/seabrook
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[26px] border border-pine/10 bg-[#f3f8f5] p-4 sm:p-5">
      <div className="rounded-[22px] border border-pine/10 bg-white p-5 shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-pine/70">
          Ad Channels
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <AdPlatformTile
            name="TikTok"
            sublabel="Short-form video ads"
            accent="bg-[#111111]"
          >
            <TikTokMark />
          </AdPlatformTile>
          <AdPlatformTile
            name="Google Ads"
            sublabel="Search and display"
            accent="bg-[linear-gradient(135deg,_#4285F4,_#34A853)]"
          >
            <GoogleAdsMark />
          </AdPlatformTile>
          <AdPlatformTile
            name="Facebook"
            sublabel="Audience campaigns"
            accent="bg-[#1877F2]"
          >
            <FacebookMark />
          </AdPlatformTile>
          <AdPlatformTile
            name="Instagram"
            sublabel="Visual promotions"
            accent="bg-[linear-gradient(135deg,_#f58529,_#dd2a7b,_#8134af)]"
          >
            <InstagramMark />
          </AdPlatformTile>
        </div>
      </div>
    </div>
  );
}

type AdPlatformTileProps = {
  name: string;
  sublabel: string;
  accent: string;
  children: ReactNode;
};

function AdPlatformTile({
  name,
  sublabel,
  accent,
  children,
}: AdPlatformTileProps) {
  return (
    <div className="rounded-2xl border border-pine/10 bg-[#fffdf9] p-4">
      <div className="flex items-center gap-3">
        <span
          className={[
            "flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-sm",
            accent,
          ].join(" ")}
        >
          {children}
        </span>
        <div>
          <p className="text-sm font-semibold text-ink">{name}</p>
          <p className="text-xs text-ink/50">{sublabel}</p>
        </div>
      </div>
    </div>
  );
}

function TikTokMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" aria-hidden="true">
      <path d="M14.7 4c.5 1.5 1.4 2.6 2.8 3.3.8.4 1.6.6 2.5.6v2.7c-1.2 0-2.4-.3-3.5-.8v4.8c0 2.9-2.3 5.2-5.2 5.2S6.1 17.5 6.1 14.6s2.3-5.2 5.2-5.2c.3 0 .6 0 .9.1v2.9a2.2 2.2 0 00-.9-.2c-1.3 0-2.4 1.1-2.4 2.4S10 17 11.3 17s2.4-1 2.4-2.4V4z" />
    </svg>
  );
}

function GoogleAdsMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
      <path d="M8.5 4.5a3 3 0 015.2-.1l5.1 8.9a3 3 0 01-5.2 3L8.5 7.4a3 3 0 010-2.9z" fill="white" opacity="0.95" />
      <circle cx="7" cy="18" r="3" fill="#d9e6e0" />
    </svg>
  );
}

function FacebookMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" aria-hidden="true">
      <path d="M13.4 20v-6h2.1l.4-2.6h-2.5v-1.7c0-.8.3-1.3 1.4-1.3H16V6.1c-.3 0-1-.1-2-.1-2 0-3.4 1.2-3.4 3.5v2H8.5V14h2.1v6z" />
    </svg>
  );
}

function InstagramMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 stroke-current" fill="none" strokeWidth="1.8" aria-hidden="true">
      <rect x="5" y="5" width="14" height="14" rx="4" />
      <circle cx="12" cy="12" r="3.2" />
      <circle cx="16.4" cy="7.8" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}
