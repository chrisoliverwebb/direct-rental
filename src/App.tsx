import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";

const DemoPage = lazy(() =>
  import("./pages/DemoPage").then((module) => ({ default: module.DemoPage })),
);
const HomePage = lazy(() =>
  import("./pages/HomePage").then((module) => ({ default: module.HomePage })),
);
const MarketingPage = lazy(() =>
  import("./pages/MarketingPage").then((module) => ({ default: module.MarketingPage })),
);
const TermsPage = lazy(() =>
  import("./pages/TermsPage").then((module) => ({ default: module.TermsPage })),
);
const PrivacyPolicyPage = lazy(() =>
  import("./pages/PrivacyPolicyPage").then((module) => ({ default: module.PrivacyPolicyPage })),
);
const DpaPage = lazy(() =>
  import("./pages/DpaPage").then((module) => ({ default: module.DpaPage })),
);
const ThankYouPage = lazy(() =>
  import("./pages/ThankYouPage").then((module) => ({ default: module.ThankYouPage })),
);

export default function App() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f7f2ea]" />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/marketing" element={<MarketingPage />} />
        <Route path="/demo" element={<DemoPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/dpa" element={<DpaPage />} />
        <Route path="/thank-you" element={<ThankYouPage />} />
      </Routes>
    </Suspense>
  );
}
