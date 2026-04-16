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
  "Returning guest discount",
  "Availability reminder",
  "Last-minute weekend offer",
  "Early access for past guests",
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
        ctaLabel="Start for £15/month"
      />

      <section className="container-shell section-spacing">
        <div className="card-surface overflow-hidden">
          <div className="grid gap-10 px-6 py-10 sm:px-8 sm:py-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="max-w-2xl">
              <h1 className="mt-3 text-4xl leading-tight text-ink sm:text-5xl">
                Get more direct bookings and keep guests coming back
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-8 text-ink/70">
                A simple marketing system for holiday rental owners to manage
                past guests, send offers, and bring guests back again.
              </p>
              <p className="mt-5 text-sm font-semibold text-ink/60 sm:text-base">
                £15/month · Cancel anytime · Works with your current setup
              </p>
              <div className="mt-8">
                <a href={MARKETING_STRIPE_CHECKOUT_URL} className="button-primary">
                  Start for £15/month
                </a>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 rounded-[28px] bg-[radial-gradient(circle_at_top,_rgba(31,77,63,0.18),_transparent_58%)]" />
              <div className="relative rounded-[28px] border border-pine/10 bg-white/90 p-5 shadow-soft sm:p-6">
                <div className="rounded-[22px] bg-[#f7fbf9] p-5">
                  <div className="grid gap-3">
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

      <section className="container-shell section-spacing pt-0">
        <div className="card-surface p-6 sm:p-7">
          <div className="max-w-2xl">
            <p className="eyebrow-label">Examples</p>
            <h2 className="mt-3 text-3xl text-ink sm:text-4xl">
              Simple campaigns you can send
            </h2>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {campaignExamples.map((example) => (
              <div
                key={example}
                className="rounded-[24px] border border-pine/10 bg-[#f7fbf9] px-5 py-6 text-base font-semibold leading-7 text-ink shadow-soft"
              >
                {example}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="start-now" className="container-shell section-spacing pt-0">
        <div className="card-surface p-6 sm:p-7">
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

type MarketingChannelSectionProps = {
  eyebrow: string;
  title: string;
  copy: string;
  points: string[];
  visual: "email" | "sms" | "setup";
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
  const hasVisual = true;

  return (
    <div className="card-surface overflow-hidden">
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
      <div className="flex h-full rounded-[26px] border border-pine/10 bg-[radial-gradient(circle_at_top,_rgba(217,230,224,0.7),_transparent_48%),linear-gradient(180deg,_#fbfdfc_0%,_#f2f8f4_100%)] p-8 sm:p-10">
        <div className="flex w-full flex-col justify-center gap-6">
          <img
            src="/marketing/email-list.svg"
            alt="Email list newsletter illustration"
            className="mx-auto block w-full max-w-[230px]"
          />
          <div className="mx-auto w-full max-w-[320px] rounded-[22px] border border-pine/10 bg-white/80 p-3 shadow-soft backdrop-blur">
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
                  className="flex items-center justify-between rounded-[18px] border border-pine/10 bg-white px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">
                      {contact.name}
                    </p>
                    <p className="truncate text-xs text-ink/55">
                      {contact.email}
                    </p>
                  </div>
                  <span className="ml-3 shrink-0 rounded-full bg-pine/10 px-2.5 py-1 text-[11px] font-semibold text-pine">
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
      <div className="flex h-full items-center rounded-[26px] border border-pine/10 bg-[radial-gradient(circle_at_top,_rgba(217,230,224,0.55),_transparent_48%),linear-gradient(180deg,_#fbfdfc_0%,_#f2f8f4_100%)] p-4 sm:p-5">
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
    <div className="flex h-full items-center rounded-[26px] border border-pine/10 bg-[radial-gradient(circle_at_top,_rgba(217,230,224,0.55),_transparent_48%),linear-gradient(180deg,_#fbfdfc_0%,_#f2f8f4_100%)] p-6 sm:p-8">
      <img
        src="/marketing/existing-website.svg"
        alt="Existing website and marketing integration illustration"
        className="mx-auto block w-full max-w-[360px]"
      />
    </div>
  );
}

