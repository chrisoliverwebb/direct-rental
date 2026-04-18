import { LegalPage } from "../components/LegalPage";
import { usePageMeta } from "../lib/usePageMeta";

const lastUpdated = "13 April 2026";

const sections = [
  {
    title: "Parties",
    content: (
      <>
        <p>This Agreement forms part of the Terms and Conditions between:</p>
        <p><strong>Customer (Controller)</strong></p>
        <p>and</p>
        <p><strong>Direct Rental (Processor)</strong></p>
      </>
    ),
  },
  {
    title: "1. Scope",
    content: <p>Direct Rental processes personal data on behalf of the Customer to provide booking and website services.</p>,
  },
  {
    title: "2. Nature of Data",
    content: (
      <>
        <p>Includes:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>Guest names</li>
          <li>Contact details</li>
          <li>Booking information</li>
        </ul>
      </>
    ),
  },
  {
    title: "3. Processor Obligations",
    content: (
      <>
        <p>Direct Rental will:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>Process data only on instructions from the Customer</li>
          <li>Ensure confidentiality</li>
          <li>Implement appropriate security measures</li>
          <li>Notify of data breaches without undue delay</li>
          <li>Assist with GDPR obligations where reasonably possible</li>
        </ul>
      </>
    ),
  },
  {
    title: "4. Sub-processors",
    content: (
      <>
        <p>We may use sub-processors, including:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>Stripe (payments)</li>
          <li>Cloud hosting providers</li>
        </ul>
        <p>All sub-processors are subject to appropriate safeguards.</p>
      </>
    ),
  },
  {
    title: "5. Controller Obligations",
    content: (
      <>
        <p>The Customer must:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>Ensure lawful basis for processing</li>
          <li>Provide privacy notices to guests</li>
          <li>Comply with UK GDPR</li>
        </ul>
      </>
    ),
  },
  {
    title: "6. Data Retention & Deletion",
    content: <p>Data will be retained for the duration of the service and deleted or returned upon termination, unless legally required otherwise.</p>,
  },
  {
    title: "7. International Transfers",
    content: <p>Data will not be transferred outside the UK without appropriate safeguards.</p>,
  },
  {
    title: "8. Governing Law",
    content: <p>This Agreement is governed by the laws of England and Wales.</p>,
  },
  {
    title: "9. Acceptance",
    content: <p>By using Direct Rental, the Customer agrees to this Agreement.</p>,
  },
];

export function DpaPage() {
  usePageMeta(
    "Data Processing Agreement | Direct Rental",
    "Data Processing Agreement for Direct Rental customers and controller-processor responsibilities.",
  );

  return (
    <LegalPage
      eyebrow="Data processing agreement"
      title="Data Processing Agreement (DPA)"
      lastUpdated={lastUpdated}
      sections={sections}
    />
  );
}
