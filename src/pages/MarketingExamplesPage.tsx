import { useEffect, useRef, useState } from "react";
import bedroomJpg from "../static/bedroom.jpg";
import featureJpg from "../static/feature.jpg";
import livingRoomJpg from "../static/living-room.jpg";
import outsideJpg from "../static/outside.jpg";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";
import { usePageMeta } from "../lib/usePageMeta";

const MARKETING_STRIPE_CHECKOUT_URL =
  "https://buy.stripe.com/28EcN69Ykf399EtcnZ63K01";

const examples = [
  {
    id: "returning-guest-discount",
    eyebrow: "Returning guest discount",
    title: "Reward past guests with a direct booking offer",
    summary:
      "A short loyalty-style email that gives past guests a reason to come back and book direct.",
    subject: "A little thank you for staying with us before",
    previewText: "Past guest offer: save on your next stay when you book direct.",
    html: buildEmailHtml({
      imageUrl: featureJpg,
      preheader:
        "Past guest offer: save on your next stay when you book direct.",
      eyebrow: "Past guest offer",
      heading: "Come back and save 10% on your next stay",
      body:
        "Because you've stayed with us before, we're giving past guests first access to a direct booking discount before we promote these dates anywhere else.",
      highlight: "Use code RETURN10 for 10% off your next booking.",
      details: ["Foxglove Hollow Cottage", "Mereford, England", "Sleeps 6"],
      ctaLabel: "See available dates",
      footer:
        "Best for quiet periods, off-peak gaps, or loyalty offers after checkout.",
    }),
  },
  {
    id: "availability-reminder",
    eyebrow: "Availability reminder",
    title: "Bring your property back to mind when dates are open",
    summary:
      "A simple reminder email for guests who already know the property and just need a prompt.",
    subject: "Dates now open again for your next stay",
    previewText:
      "A quick reminder that we've got availability if you're planning another trip.",
    html: buildEmailHtml({
      imageUrl: outsideJpg,
      preheader:
        "A quick reminder that we've got availability if you're planning another trip.",
      eyebrow: "Availability update",
      heading: "We've opened up new dates",
      body:
        "If you've been thinking about another stay, we've just released new availability and wanted to let past guests know first before the calendar fills up.",
      highlight: "A good fit for seasonal reminders and newly opened dates.",
      details: ["Fresh autumn dates", "Book direct", "Past guests first"],
      ctaLabel: "View availability",
      footer:
        "Best for staying visible with guests who may already be planning a return visit.",
    }),
  },
  {
    id: "last-minute-weekend-offer",
    eyebrow: "Last-minute weekend offer",
    title: "Turn a gap in the calendar into a quick booking",
    summary:
      "A direct-response style email designed for speed when you need to fill a short gap fast.",
    subject: "Weekend gap just opened up",
    previewText:
      "We've had a cancellation for this weekend and past guests can book direct first.",
    html: buildEmailHtml({
      imageUrl: livingRoomJpg,
      preheader:
        "We've had a cancellation for this weekend and past guests can book direct first.",
      eyebrow: "Last-minute offer",
      heading: "This weekend has just opened up",
      body:
        "We've had a short-notice gap in the calendar and wanted to offer it to past guests before listing it more widely. If you fancy a last-minute break, this is the best time to grab it.",
      highlight: "2 nights from £395 when booked direct this week.",
      details: ["17-19 May", "2 nights", "From £395"],
      ctaLabel: "Claim this weekend",
      footer:
        "Best for short-notice cancellations, empty weekends, and unsold gap nights.",
    }),
  },
  {
    id: "early-access-for-past-guests",
    eyebrow: "Early access for past guests",
    title: "Make past guests feel like insiders",
    summary:
      "An early access email that creates exclusivity and gives repeat guests first look at peak dates.",
    subject: "Past guests get first access",
    previewText:
      "We're opening our next set of dates and wanted to share them with past guests first.",
    html: buildEmailHtml({
      imageUrl: bedroomJpg,
      preheader:
        "We're opening our next set of dates and wanted to share them with past guests first.",
      eyebrow: "Early access",
      heading: "Past guests can book before dates go public",
      body:
        "We're opening our next round of dates and wanted to give previous guests a head start. If you'd like to come back, you can book direct before we release these dates more broadly.",
      highlight:
        "Early access works especially well for holidays, school breaks, and summer weeks.",
      details: ["Summer weeks", "School holidays", "Direct bookings"],
      ctaLabel: "Browse new dates",
      footer:
        "Best for stronger guest relationships and protecting peak dates for direct repeat bookings.",
    }),
  },
];

export function MarketingExamplesPage() {
  usePageMeta(
    "Direct Rental Marketing Examples | HTML email templates",
    "Example HTML emails for repeat booking campaigns, availability reminders, last-minute offers, and past guest early access.",
  );

  return (
    <main>
      <SiteHeader
        ctaHref={MARKETING_STRIPE_CHECKOUT_URL}
        ctaLabel="Get Started"
      />

      <section className="container-shell section-spacing">
        <div className="max-w-3xl">
          <p className="eyebrow-label">Marketing Examples</p>
          <h1 className="mt-3 text-4xl leading-tight text-ink sm:text-5xl">
            Example Email Campaigns
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-ink/70">
            Here are some examples based on templates you can send out to your
            customers.
          </p>
        </div>
      </section>

      <section className="section-frame">
        <div className="container-shell section-spacing">
          <div className="grid gap-12">
            {examples.map((example) => (
              <section
                id={example.id}
                key={example.id}
                className="scroll-mt-28 border-t border-slate-200 pt-10 first:border-t-0 first:pt-0"
              >
                <div className="grid gap-8 lg:grid-cols-[0.38fr_0.62fr] lg:items-start">
                  <div className="max-w-md">
                    <p className="eyebrow-label">{example.eyebrow}</p>
                    <h2 className="mt-3 text-3xl text-ink sm:text-4xl">
                      {example.title}
                    </h2>
                    <p className="mt-4 text-base leading-7 text-ink/70">
                      {example.summary}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-soft sm:p-4">
                    <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                      <p className="text-xs text-ink/45">Email Preview</p>
                      <p className="mt-2 text-sm font-semibold text-ink">
                        Subject: {example.subject}
                      </p>
                      <p className="mt-1 text-sm text-ink/60">
                        Preview text: {example.previewText}
                      </p>
                    </div>
                    <EmailPreviewFrame title={example.title} html={example.html} />
                  </div>
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

function EmailPreviewFrame({
  title,
  html,
}: {
  title: string;
  html: string;
}) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [mobileHeight, setMobileHeight] = useState(960);

  useEffect(() => {
    const updateHeight = () => {
      const iframe = iframeRef.current;
      if (!iframe || window.innerWidth >= 640) return;

      try {
        const doc = iframe.contentWindow?.document;
        if (!doc) return;
        const nextHeight = Math.max(
          doc.body.scrollHeight,
          doc.documentElement.scrollHeight,
        );
        if (nextHeight) setMobileHeight(nextHeight);
      } catch {
        // Keep fallback height if the iframe cannot be measured.
      }
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, [html]);

  return (
    <>
      <iframe
        ref={iframeRef}
        title={`${title} mobile preview`}
        srcDoc={html}
        onLoad={() => {
          if (window.innerWidth >= 640) return;
          const iframe = iframeRef.current;
          if (!iframe) return;

          try {
            const doc = iframe.contentWindow?.document;
            if (!doc) return;
            const nextHeight = Math.max(
              doc.body.scrollHeight,
              doc.documentElement.scrollHeight,
            );
            if (nextHeight) setMobileHeight(nextHeight);
          } catch {
            // Keep fallback height if the iframe cannot be measured.
          }
        }}
        style={{ height: `${mobileHeight}px` }}
        className="mt-4 block w-full rounded-lg border border-slate-200 bg-white sm:hidden"
      />
      <iframe
        title={`${title} desktop preview`}
        srcDoc={html}
        className="mt-4 hidden h-[820px] w-full rounded-lg border border-slate-200 bg-white sm:block lg:h-[880px]"
      />
    </>
  );
}

function buildEmailHtml({
  imageUrl,
  preheader,
  eyebrow,
  heading,
  body,
  highlight,
  details,
  ctaLabel,
  footer,
}: {
  imageUrl: string;
  preheader: string;
  eyebrow: string;
  heading: string;
  body: string;
  highlight: string;
  details: string[];
  ctaLabel: string;
  footer: string;
}) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${heading}</title>
  </head>
  <body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f8fafc;">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;background:#ffffff;border:1px solid #e2e8f0;">
            <tr>
              <td style="padding:18px 28px 0 28px;font-size:12px;line-height:18px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#2563eb;">
                Foxglove Hollow Cottage
              </td>
            </tr>
            <tr>
              <td style="padding:14px 28px 0 28px;">
                <img src="${imageUrl}" alt="Foxglove Hollow Cottage" style="display:block;width:100%;height:220px;object-fit:cover;border:0;" />
              </td>
            </tr>
            <tr>
              <td style="padding:24px 28px 12px 28px;border-bottom:1px solid #e2e8f0;">
                <div style="font-size:12px;line-height:18px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#2563eb;">${eyebrow}</div>
                <h1 style="margin:12px 0 0 0;font-size:30px;line-height:38px;font-weight:700;color:#0f172a;">${heading}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 28px 0 28px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="table-layout:fixed;">
                  <tr>
                    ${details
                      .map(
                        (detail, index) => `
                    <td width="33.33%" style="padding:0 ${index === 2 ? 0 : 8}px 0 0;vertical-align:top;">
                      <span style="display:flex;align-items:center;justify-content:center;height:58px;width:100%;border:1px solid #dbeafe;background:#f8fbff;padding:8px 10px;font-size:12px;line-height:16px;font-weight:700;color:#1d4ed8;box-sizing:border-box;text-align:center;">${detail}</span>
                    </td>`,
                      )
                      .join("")}
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 28px 0 28px;font-size:16px;line-height:28px;color:#334155;">
                ${body}
              </td>
            </tr>
            <tr>
              <td style="padding:20px 28px 0 28px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#eff6ff;border:1px solid #bfdbfe;">
                  <tr>
                    <td style="padding:16px 18px;font-size:15px;line-height:24px;font-weight:700;color:#1d4ed8;">
                      ${highlight}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 28px 0 28px;">
                <span style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 20px;cursor:default;">${ctaLabel}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 28px 28px 28px;font-size:14px;line-height:24px;color:#64748b;">
                ${footer}
                <br /><br />
                Foxglove Hollow Cottage<br />
                Mereford, England<br />
                Book direct at directrental.uk
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
