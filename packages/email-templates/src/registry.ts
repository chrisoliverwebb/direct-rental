export const lastMinuteAvailabilityTemplateYaml = String.raw`name: Last-minute availability
channel: EMAIL
description: A sharp availability email with a strong hero, two supporting highlights, and one direct-booking CTA.
category: promotional
tags:
  - availability
  - last-minute
  - direct-booking
subject: A last-minute stay has just opened up
previewText: Give past guests first refusal on an unexpected opening.
layoutId: promo-hero
audience: past-guests
goal: rebook
starterContent:
  eyebrow: DIRECT BOOKING FIRST LOOK
  headline: A three-night opening just became available.
  intro: We have unexpected availability for a short break next month, and we wanted to offer it to past guests before opening it up more widely.
  ctaLabel: View the stay
  ctaUrl: https://directrental.test/offers/last-minute
  leftTitle: Why it works
  leftBody: Short-notice openings convert well when the offer is clear and the direct path is obvious.
  rightTitle: Suggested offer
  rightBody: Add a small direct-booking perk such as a bottle on arrival or flexible late checkout.`;

export const summerReturnOfferTemplateYaml = String.raw`name: Summer return offer
channel: EMAIL
description: A warmer repeat-stay template with a strong title, persuasive body copy, and a second supporting section.
category: seasonal
tags:
  - summer
  - repeat-guests
  - offer
subject: A summer return-guest offer
previewText: Encourage repeat bookings with a direct-only incentive.
layoutId: warm-offer
audience: past-guests
goal: rebook
starterContent:
  headline: A summer stay, reserved for returning guests.
  intro: We are opening a limited summer window for past guests first. Keep the tone generous, make the direct value clear, and give one simple action to take next.
  ctaLabel: See summer availability
  ctaUrl: https://directrental.test/offers/summer
  supportTitle: What to highlight
  supportBody: "Use this section for one or two concrete reasons to book direct now: ideal dates, returning guest pricing, or a direct-only inclusion."`;

export const repeatGuestDiscountTemplateYaml = String.raw`name: Repeat guest discount
channel: EMAIL
description: A cleaner loyalty-style email with a simple intro, offer section, and CTA-led close.
category: loyalty
tags:
  - repeat-guests
  - loyalty
  - offer
subject: A thank-you discount for returning guests
previewText: A simple win-back campaign for your guest list.
layoutId: loyalty-offer
audience: past-guests
goal: rebook
starterContent:
  headline: Thank you for staying with us before.
  intro: This template is designed for a simple loyalty message. Keep the copy personal, remind guests why they enjoyed the stay, and make the direct-booking benefit feel genuinely useful.
  offerTitle: Your returning guest offer
  offerBody: Add a single direct incentive here, such as a returning guest rate, early access window, or welcome extra.
  ctaLabel: Book direct as a returning guest
  ctaUrl: https://directrental.test/returning-guests`;

export const bankHolidayReminderTemplateYaml = String.raw`name: Bank holiday reminder
channel: SMS
description: A concise SMS reminder for fast-moving availability around a long weekend.
category: reminder
tags:
  - bank-holiday
  - reminder
  - availability
previewText: Short reminder for upcoming long weekends.
audience: all
goal: inform
starterContent:
  text: Bank holiday dates are nearly gone. If you want first choice, reply or book direct today.`;

export const directBookingNudgeTemplateYaml = String.raw`name: Direct booking nudge
channel: SMS
description: A short follow-up SMS for guests who have already shown interest and just need a clear next step.
category: follow-up
tags:
  - direct-booking
  - warm-lead
  - follow-up
previewText: A clear direct-booking nudge for warm leads.
audience: all
goal: engage
starterContent:
  text: Thanks for your interest. We can hold your preferred dates for a short time if you would like to book direct.`;
