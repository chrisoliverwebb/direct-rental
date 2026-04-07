import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";

const DemoPage = lazy(() =>
  import("./pages/DemoPage").then((module) => ({ default: module.DemoPage })),
);
const HomePage = lazy(() =>
  import("./pages/HomePage").then((module) => ({ default: module.HomePage })),
);
const ThankYouPage = lazy(() =>
  import("./pages/ThankYouPage").then((module) => ({ default: module.ThankYouPage })),
);

export default function App() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f7f2ea]" />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/demo" element={<DemoPage />} />
        <Route path="/thank-you" element={<ThankYouPage />} />
      </Routes>
    </Suspense>
  );
}
