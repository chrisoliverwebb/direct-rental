import { LegalPage } from "../components/LegalPage";
import { usePageMeta } from "../lib/usePageMeta";

const lastUpdated = "13 April 2026";

const sections = [
  {
    title: "1. Who We Are",
    content: (
      <>
        <p>Direct Rental is a UK-based service providing booking and website solutions for property owners.</p>
        <p>
          Contact: <a href="mailto:hello@directrental.uk">hello@directrental.uk</a>
        </p>
      </>
    ),
  },
  {
    title: "2. Data We Collect",
    content: (
      <>
        <section>
          <h3 className="text-lg font-semibold text-ink">Account Data</h3>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>Name</li>
            <li>Email</li>
            <li>Phone number</li>
            <li>Business details</li>
          </ul>
        </section>
        <section>
          <h3 className="text-lg font-semibold text-ink">Payment Data</h3>
          <p>Payments are processed via Stripe.</p>
          <p>We do not store full card details.</p>
          <p>
            Stripe processes payment data in accordance with its policy:{" "}
            <a href="https://stripe.com/privacy" target="_blank" rel="noreferrer">
              https://stripe.com/privacy
            </a>
          </p>
        </section>
        <section>
          <h3 className="text-lg font-semibold text-ink">Booking Data (Processed on behalf of customers)</h3>
          <p>We process guest data on behalf of property owners, including:</p>
          <ul className="list-disc space-y-2 pl-6">
            <li>Names</li>
            <li>Contact details</li>
            <li>Booking information</li>
            <li>The property owner is the <strong>data controller</strong></li>
            <li>Direct Rental is the <strong>data processor</strong></li>
          </ul>
        </section>
        <section>
          <h3 className="text-lg font-semibold text-ink">Usage Data</h3>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>IP address</li>
            <li>Device information</li>
            <li>Browser type</li>
            <li>Site activity</li>
          </ul>
        </section>
      </>
    ),
  },
  {
    title: "3. How We Use Data",
    content: (
      <ul className="list-disc space-y-2 pl-6">
        <li>Provide our services</li>
        <li>Manage accounts and subscriptions</li>
        <li>Process payments</li>
        <li>Improve the platform</li>
        <li>Comply with legal obligations</li>
      </ul>
    ),
  },
  {
    title: "4. Legal Basis",
    content: (
      <ul className="list-disc space-y-2 pl-6">
        <li>Contractual necessity</li>
        <li>Legitimate interests</li>
        <li>Legal obligations</li>
      </ul>
    ),
  },
  {
    title: "5. Data Sharing",
    content: (
      <>
        <p>We may share data with:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>Payment providers (e.g. Stripe)</li>
          <li>Hosting providers</li>
          <li>Analytics services</li>
        </ul>
        <p>We do not sell personal data.</p>
      </>
    ),
  },
  {
    title: "6. Data Retention",
    content: (
      <>
        <p>We retain data only as necessary:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>Account data: while active</li>
          <li>Booking data: controlled by our customers</li>
          <li>Financial data: as required by law</li>
        </ul>
      </>
    ),
  },
  {
    title: "7. Security",
    content: (
      <>
        <p>We implement appropriate security measures, including:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>HTTPS encryption</li>
          <li>Secure infrastructure</li>
          <li>Access controls</li>
        </ul>
      </>
    ),
  },
  {
    title: "8. Your Rights",
    content: (
      <>
        <p>Under UK GDPR, you have the right to:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>Access your data</li>
          <li>Request correction</li>
          <li>Request deletion</li>
          <li>Object to processing</li>
        </ul>
        <p>
          Contact: <a href="mailto:hello@directrental.uk">hello@directrental.uk</a>
        </p>
      </>
    ),
  },
  {
    title: "9. Cookies",
    content: (
      <>
        <p>We may use cookies for:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>Session management</li>
          <li>Analytics</li>
        </ul>
        <p>You can manage cookies via browser settings.</p>
      </>
    ),
  },
  {
    title: "10. Third Parties",
    content: <p>We are not responsible for third-party services or websites.</p>,
  },
  {
    title: "11. Changes",
    content: <p>We may update this policy from time to time.</p>,
  },
  {
    title: "12. Contact",
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

export function PrivacyPolicyPage() {
  usePageMeta(
    "Privacy Policy | Direct Rental",
    "Privacy Policy for Direct Rental covering account, booking, payment, and usage data.",
  );

  return (
    <LegalPage
      eyebrow="Privacy policy"
      title="Privacy Policy"
      lastUpdated={lastUpdated}
      intro={<p>This Privacy Policy explains how Direct Rental (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) collects and uses personal data.</p>}
      sections={sections}
    />
  );
}
