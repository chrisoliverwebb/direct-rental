import { ChangeEvent, FormEvent, useMemo, useState } from "react";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SHEETS_URL = import.meta.env.VITE_GOOGLE_SHEETS_WEB_APP_URL as
  | string
  | undefined;
const SHEETS_SECRET = import.meta.env.VITE_GOOGLE_SHEETS_SECRET as
  | string
  | undefined;
const STRIPE_CHECKOUT_URL = "https://buy.stripe.com/3cI6oI0nKcV18Apew763K00";

export function LeadForm() {
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const trimmedEmail = email.trim();
  const isValidEmail = useMemo(
    () => EMAIL_PATTERN.test(trimmedEmail),
    [trimmedEmail],
  );

  const handleEmailChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTouched(true);
    setSubmitError("");

    const form = event.currentTarget;
    if (!form) {
      console.error("Lead form submit failed: missing form element.");
      setSubmitError("We couldn't submit your request. Please try again.");
      return;
    }

    if (!isValidEmail) {
      return;
    }

    if (!SHEETS_URL) {
      const message =
        "Lead capture is not configured. Set VITE_GOOGLE_SHEETS_WEB_APP_URL in .env.local and try again.";
      console.error(message);
      setSubmitError(message);
      return;
    }

    const formData = new FormData(form);
    const payload = {
      name: String(formData.get("name") || "").trim(),
      email: trimmedEmail,
      properties: String(formData.get("properties") || ""),
      platforms: String(formData.get("platforms") || "").trim(),
      submittedAt: new Date().toISOString(),
      pageUrl: window.location.href,
      referrer: document.referrer || "",
      userAgent: navigator.userAgent,
    };

    try {
      setIsSubmitting(true);

      const body = new URLSearchParams();
      Object.entries(payload).forEach(([key, value]) =>
        body.set(key, String(value)),
      );
      if (SHEETS_SECRET) body.set("secret", SHEETS_SECRET);

      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 12000);

      try {
        await fetch(SHEETS_URL, {
          method: "POST",
          mode: "no-cors",
          body,
          signal: controller.signal,
        });
      } finally {
        window.clearTimeout(timeout);
      }

      form.reset();
      setEmail("");
      setTouched(false);
      window.location.assign(STRIPE_CHECKOUT_URL);
    } catch (error) {
      console.error("Failed to submit early access lead:", error, payload);
      setSubmitError("We couldn't submit your request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const showError = touched && trimmedEmail.length > 0 && !isValidEmail;

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-ink">
          Name
          <input
            name="name"
            placeholder="Jane Smith"
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base outline-none transition focus:border-pine focus:ring-2 focus:ring-pine/15"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-ink">
          <span>
            Email <span className="text-pine">*</span>
          </span>
          <input
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            value={email}
            onBlur={() => setTouched(true)}
            onChange={handleEmailChange}
            placeholder="you@yourproperty.com"
            aria-invalid={showError}
            aria-describedby="lead-email-help lead-email-error"
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base outline-none transition focus:border-pine focus:ring-2 focus:ring-pine/15"
          />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-ink">
          Number of properties
          <select
            name="properties"
            defaultValue=""
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base outline-none transition focus:border-pine focus:ring-2 focus:ring-pine/15"
          >
            <option value="">Select an option</option>
            <option>1</option>
            <option>2-3</option>
            <option>4-10</option>
            <option>10+</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium text-ink">
          Where do you currently list your property?
          <input
            name="platforms"
            placeholder="e.g. booking platforms, direct, other"
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base outline-none transition focus:border-pine focus:ring-2 focus:ring-pine/15"
          />
        </label>
      </div>
      <div className="grid gap-2">
        <p id="lead-email-help" className="text-sm text-ink/55">
          <span className="text-pine">*</span> Required
        </p>
        {showError ? (
          <p id="lead-email-error" className="text-sm text-rose-700">
            Please enter a valid email address.
          </p>
        ) : null}
      </div>
      <button
        type="submit"
        disabled={!isValidEmail || isSubmitting}
        className="rounded-full bg-pine px-6 py-3 text-base font-medium text-white transition hover:bg-pine/90 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 disabled:hover:bg-slate-200"
      >
        {isSubmitting ? "Submitting..." : "Get Started"}
      </button>
      {submitError ? (
        <p className="text-sm text-rose-700">{submitError}</p>
      ) : null}
    </form>
  );
}
