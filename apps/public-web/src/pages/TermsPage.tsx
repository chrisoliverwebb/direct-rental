import { LegalPage } from "../components/LegalPage";
import { usePageMeta } from "../lib/usePageMeta";

const lastUpdated = "13 April 2026";

const sections = [
  {
    title: "1. About Us",
    content: (
      <>
        <p>Direct Rental is a UK-based platform providing website and booking solutions for property owners.</p>
        <p>
          Contact: <a href="mailto:hello@directrental.uk">hello@directrental.uk</a>
        </p>
      </>
    ),
  },
  {
    title: "2. Services",
    content: (
      <>
        <p>We provide:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>Booking management tools</li>
          <li>Website hosting and management</li>
          <li>Integration with third-party platforms</li>
        </ul>
        <p>We may modify or update the service at any time.</p>
      </>
    ),
  },
  {
    title: "3. Accounts",
    content: (
      <>
        <p>You are responsible for:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>Maintaining account security</li>
          <li>Ensuring your information is accurate</li>
          <li>All activity under your account</li>
        </ul>
      </>
    ),
  },
  {
    title: "4. Payments & Subscriptions",
    content: (
      <>
        <p>Payments are processed via Stripe.</p>
        <p>By subscribing:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>You agree to recurring billing (if applicable)</li>
          <li>Fees are billed in advance unless stated otherwise</li>
          <li>You authorise us to charge your selected payment method</li>
        </ul>
        <p>
          Stripe processes payment data in accordance with its policies:
          <br />
          <a href="https://stripe.com/privacy" target="_blank" rel="noreferrer">
            https://stripe.com/privacy
          </a>
          <br />
          <a href="https://stripe.com/legal" target="_blank" rel="noreferrer">
            https://stripe.com/legal
          </a>
        </p>
      </>
    ),
  },
  {
    title: "5. Refunds",
    content: (
      <>
        <p>Unless otherwise stated, all payments are non-refundable.</p>
        <p>
          You may cancel your subscription at any time, and cancellation will take effect at the
          end of the current billing period.
        </p>
      </>
    ),
  },
  {
    title: "6. Customer Data",
    content: (
      <>
        <p>You may collect and manage booking data through the platform.</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>You are the <strong>data controller</strong></li>
          <li>Direct Rental acts as a <strong>data processor</strong></li>
        </ul>
      </>
    ),
  },
  {
    title: "7. Data Processing Agreement",
    content: <p>By using our services, you agree to our Data Processing Agreement (DPA), which forms part of these Terms.</p>,
  },
  {
    title: "8. Acceptable Use",
    content: (
      <>
        <p>You agree not to:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>Use the service for unlawful purposes</li>
          <li>Store or process illegal or harmful content</li>
          <li>Attempt to interfere with system security</li>
        </ul>
      </>
    ),
  },
  {
    title: "9. Availability",
    content: (
      <>
        <p>We aim to provide reliable service but do not guarantee:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>Continuous availability</li>
          <li>Error-free operation</li>
        </ul>
      </>
    ),
  },
  {
    title: "10. Service Disclaimer",
    content: (
      <>
        <p>The Direct Rental platform is provided on an &quot;as is&quot; and &quot;as available&quot; basis.</p>
        <p>While we aim to provide a reliable and effective service, we do not guarantee:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>That your property will receive bookings</li>
          <li>Any specific level of revenue, occupancy, or performance</li>
          <li>That the service will meet your individual business requirements</li>
        </ul>
        <p>
          Direct Rental is a software platform only and does not act as a booking agent, broker, or
          property manager.
        </p>
        <p>
          You acknowledge that results depend on external factors outside our control, including
          pricing, property quality, location, and market conditions.
        </p>
      </>
    ),
  },
  {
    title: "11. Limitation of Liability",
    content: (
      <>
        <p>To the fullest extent permitted by law:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>We are not liable for indirect or consequential losses</li>
          <li>Our total liability is limited to the amount you paid us in the last 12 months</li>
        </ul>
      </>
    ),
  },
  {
    title: "12. Termination",
    content: (
      <>
        <p>We may suspend or terminate your account if:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>You breach these Terms</li>
          <li>Required by law</li>
        </ul>
        <p>You may cancel your subscription at any time.</p>
      </>
    ),
  },
  {
    title: "13. Intellectual Property",
    content: <p>All platform content, software, and branding remain the property of Direct Rental.</p>,
  },
  {
    title: "14. Changes to Terms",
    content: <p>We may update these Terms from time to time. Continued use of the service constitutes acceptance of updated Terms.</p>,
  },
  {
    title: "15. Governing Law",
    content: <p>These Terms are governed by the laws of England and Wales.</p>,
  },
  {
    title: "16. Contact",
    content: (
      <>
        <p>Direct Rental</p>
        <p>
          Email: <a href="mailto:hello@directrental.uk">hello@directrental.uk</a>
        </p>
      </>
    ),
  },
];

export function TermsPage() {
  usePageMeta(
    "Terms and Conditions | Direct Rental",
    "Terms and Conditions for using Direct Rental services.",
  );

  return (
    <LegalPage
      eyebrow="Terms and conditions"
      title="Terms and Conditions"
      lastUpdated={lastUpdated}
      intro={<p>These Terms and Conditions (&quot;Terms&quot;) govern your use of Direct Rental (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;).</p>}
      sections={[
        {
          title: "Agreement",
          content: <p>By using our services, you agree to these Terms.</p>,
        },
        ...sections,
      ]}
    />
  );
}
