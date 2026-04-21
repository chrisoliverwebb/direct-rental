export const lastMinuteAvailabilityTemplateYaml = String.raw`name: Last-minute availability
channel: EMAIL
description: A sharp availability email with a strong hero, two supporting highlights, and one direct-booking CTA.
subject: A last-minute stay has just opened up
previewText: Give past guests first refusal on an unexpected opening.
thumbnailUrl: null
contentDocument:
  name: Last-minute availability
  subject: A last-minute stay has just opened up
  previewText: Give past guests first refusal on an unexpected opening.
  blocks:
    - type: group
      styles:
        backgroundColor: "#eff6ff"
        paddingTop: 32
        paddingRight: 32
        paddingBottom: 28
        paddingLeft: 32
      blocks:
        - type: text
          textStyle: h3
          styles:
            fontFamily: Arial, sans-serif
            fontSize: 13px
            fontWeight: "700"
            lineHeight: "1.4"
            textColor: "#2563eb"
            paddingTop: 0
            paddingRight: 0
            paddingBottom: 12
            paddingLeft: 0
          content:
            text: DIRECT BOOKING FIRST LOOK
        - type: text
          textStyle: h1
          styles:
            fontFamily: Arial, sans-serif
            fontSize: 34px
            fontWeight: "700"
            lineHeight: "1.15"
            textColor: "#0f172a"
            paddingTop: 0
            paddingRight: 0
            paddingBottom: 16
            paddingLeft: 0
          content:
            text: A three-night opening just became available.
        - type: text
          textStyle: p
          styles:
            fontFamily: Arial, sans-serif
            fontSize: 17px
            fontWeight: "400"
            lineHeight: "1.7"
            textColor: "#334155"
            paddingTop: 0
            paddingRight: 0
            paddingBottom: 20
            paddingLeft: 0
          content:
            text: We have unexpected availability for a short break next month, and we wanted to offer it to past guests before opening it up more widely.
        - type: button
          alignment: left
          buttonBackgroundColor: "#2563eb"
          buttonTextColor: "#ffffff"
          href: https://directrental.test/offers/last-minute
          styles:
            fontFamily: Arial, sans-serif
            fontSize: 15px
            fontWeight: "700"
            lineHeight: "1.2"
            textAlign: center
            paddingTop: 0
            paddingRight: 0
            paddingBottom: 0
            paddingLeft: 0
          label:
            text: View the stay
    - type: spacer
      height: 24
    - type: columns
      layout: 50-50
      columns:
        - blocks:
            - type: text
              textStyle: h3
              styles:
                fontFamily: Arial, sans-serif
                fontSize: 18px
                fontWeight: "700"
                lineHeight: "1.4"
                textColor: "#0f172a"
                paddingTop: 0
                paddingRight: 18
                paddingBottom: 8
                paddingLeft: 24
              content:
                text: Why it works
            - type: text
              textStyle: p
              styles:
                fontFamily: Arial, sans-serif
                fontSize: 15px
                fontWeight: "400"
                lineHeight: "1.7"
                textColor: "#475569"
                paddingTop: 0
                paddingRight: 18
                paddingBottom: 0
                paddingLeft: 24
              content:
                text: Short-notice openings convert well when the offer is clear and the direct path is obvious.
        - blocks:
            - type: text
              textStyle: h3
              styles:
                fontFamily: Arial, sans-serif
                fontSize: 18px
                fontWeight: "700"
                lineHeight: "1.4"
                textColor: "#0f172a"
                paddingTop: 0
                paddingRight: 24
                paddingBottom: 8
                paddingLeft: 18
              content:
                text: Suggested offer
            - type: text
              textStyle: p
              styles:
                fontFamily: Arial, sans-serif
                fontSize: 15px
                fontWeight: "400"
                lineHeight: "1.7"
                textColor: "#475569"
                paddingTop: 0
                paddingRight: 24
                paddingBottom: 0
                paddingLeft: 18
              content:
                text: Add a small direct-booking perk such as a bottle on arrival or flexible late checkout.`;

export const summerReturnOfferTemplateYaml = String.raw`name: Summer return offer
channel: EMAIL
description: A warmer repeat-stay template with a strong title, persuasive body copy, and a second supporting section.
subject: A summer return-guest offer
previewText: Encourage repeat bookings with a direct-only incentive.
thumbnailUrl: null
contentDocument:
  name: Summer return offer
  subject: A summer return-guest offer
  previewText: Encourage repeat bookings with a direct-only incentive.
  blocks:
    - type: group
      styles:
        backgroundColor: "#fff7ed"
        paddingTop: 30
        paddingRight: 30
        paddingBottom: 30
        paddingLeft: 30
      blocks:
        - type: text
          textStyle: h1
          styles:
            fontFamily: Georgia, serif
            fontSize: 36px
            fontWeight: "700"
            lineHeight: "1.15"
            textColor: "#7c2d12"
            paddingTop: 0
            paddingRight: 0
            paddingBottom: 14
            paddingLeft: 0
          content:
            text: A summer stay, reserved for returning guests.
        - type: text
          textStyle: p
          styles:
            fontFamily: Arial, sans-serif
            fontSize: 16px
            fontWeight: "400"
            lineHeight: "1.75"
            textColor: "#7c2d12"
            paddingTop: 0
            paddingRight: 0
            paddingBottom: 18
            paddingLeft: 0
          content:
            text: We are opening a limited summer window for past guests first. Keep the tone generous, make the direct value clear, and give one simple action to take next.
        - type: button
          alignment: left
          buttonBackgroundColor: "#ea580c"
          buttonTextColor: "#ffffff"
          href: https://directrental.test/offers/summer
          styles:
            fontFamily: Arial, sans-serif
            fontSize: 15px
            fontWeight: "700"
            lineHeight: "1.2"
            textAlign: center
            paddingTop: 0
            paddingRight: 0
            paddingBottom: 0
            paddingLeft: 0
          label:
            text: See summer availability
    - type: divider
      color: "#fdba74"
      thickness: 1
    - type: group
      styles:
        paddingTop: 22
        paddingRight: 30
        paddingBottom: 18
        paddingLeft: 30
      blocks:
        - type: text
          textStyle: h3
          styles:
            fontFamily: Arial, sans-serif
            fontSize: 18px
            fontWeight: "700"
            lineHeight: "1.4"
            textColor: "#0f172a"
            paddingTop: 0
            paddingRight: 0
            paddingBottom: 10
            paddingLeft: 0
          content:
            text: What to highlight
        - type: text
          textStyle: p
          styles:
            fontFamily: Arial, sans-serif
            fontSize: 15px
            fontWeight: "400"
            lineHeight: "1.7"
            textColor: "#475569"
            paddingTop: 0
            paddingRight: 0
            paddingBottom: 0
            paddingLeft: 0
          content:
            text: "Use this section for one or two concrete reasons to book direct now: ideal dates, returning guest pricing, or a direct-only inclusion."`;

export const repeatGuestDiscountTemplateYaml = String.raw`name: Repeat guest discount
channel: EMAIL
description: A cleaner loyalty-style email with a simple intro, offer section, and CTA-led close.
subject: A thank-you discount for returning guests
previewText: A simple win-back campaign for your guest list.
thumbnailUrl: null
contentDocument:
  name: Repeat guest discount
  subject: A thank-you discount for returning guests
  previewText: A simple win-back campaign for your guest list.
  blocks:
    - type: group
      styles:
        paddingTop: 32
        paddingRight: 32
        paddingBottom: 24
        paddingLeft: 32
      blocks:
        - type: text
          textStyle: h1
          styles:
            fontFamily: Arial, sans-serif
            fontSize: 32px
            fontWeight: "700"
            lineHeight: "1.2"
            textColor: "#0f172a"
            paddingTop: 0
            paddingRight: 0
            paddingBottom: 14
            paddingLeft: 0
          content:
            text: Thank you for staying with us before.
        - type: text
          textStyle: p
          styles:
            fontFamily: Arial, sans-serif
            fontSize: 16px
            fontWeight: "400"
            lineHeight: "1.7"
            textColor: "#334155"
            paddingTop: 0
            paddingRight: 0
            paddingBottom: 20
            paddingLeft: 0
          content:
            text: This template is designed for a simple loyalty message. Keep the copy personal, remind guests why they enjoyed the stay, and make the direct-booking benefit feel genuinely useful.
        - type: group
          styles:
            backgroundColor: "#f8fafc"
            borderRadius: 16
            paddingTop: 18
            paddingRight: 18
            paddingBottom: 18
            paddingLeft: 18
          blocks:
            - type: text
              textStyle: h3
              styles:
                fontFamily: Arial, sans-serif
                fontSize: 18px
                fontWeight: "700"
                lineHeight: "1.4"
                textColor: "#0f172a"
                paddingTop: 0
                paddingRight: 0
                paddingBottom: 8
                paddingLeft: 0
              content:
                text: Your returning guest offer
            - type: text
              textStyle: p
              styles:
                fontFamily: Arial, sans-serif
                fontSize: 15px
                fontWeight: "400"
                lineHeight: "1.7"
                textColor: "#475569"
                paddingTop: 0
                paddingRight: 0
                paddingBottom: 0
                paddingLeft: 0
              content:
                text: Add a single direct incentive here, such as a returning guest rate, early access window, or welcome extra.
        - type: spacer
          height: 20
        - type: button
          alignment: left
          buttonBackgroundColor: "#0f172a"
          buttonTextColor: "#ffffff"
          href: https://directrental.test/returning-guests
          styles:
            fontFamily: Arial, sans-serif
            fontSize: 15px
            fontWeight: "700"
            lineHeight: "1.2"
            textAlign: center
            paddingTop: 0
            paddingRight: 0
            paddingBottom: 0
            paddingLeft: 0
          label:
            text: Book direct as a returning guest`;

export const bankHolidayReminderTemplateYaml = String.raw`name: Bank holiday reminder
channel: SMS
description: A concise SMS reminder for fast-moving availability around a long weekend.
subject: null
previewText: Short reminder for upcoming long weekends.
thumbnailUrl: null
contentText: Bank holiday dates are nearly gone. If you want first choice, reply or book direct today.`;

export const directBookingNudgeTemplateYaml = String.raw`name: Direct booking nudge
channel: SMS
description: A short follow-up SMS for guests who have already shown interest and just need a clear next step.
subject: null
previewText: A clear direct-booking nudge for warm leads.
thumbnailUrl: null
contentText: Thanks for your interest. We can hold your preferred dates for a short time if you would like to book direct.`;
