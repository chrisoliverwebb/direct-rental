import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LeadForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);

  const trimmedEmail = email.trim();
  const isValidEmail = useMemo(() => EMAIL_PATTERN.test(trimmedEmail), [trimmedEmail]);

  const handleEmailChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTouched(true);

    if (!isValidEmail) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    const payload = {
      name: String(formData.get("name") || "").trim(),
      email: trimmedEmail,
      properties: String(formData.get("properties") || ""),
      platforms: String(formData.get("platforms") || "").trim(),
      submittedAt: new Date().toISOString(),
    };

    console.log("New early access request:", payload);
    event.currentTarget.reset();
    setEmail("");
    setTouched(false);
    navigate("/thank-you");
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
        disabled={!isValidEmail}
        className="rounded-full bg-pine px-6 py-3 text-base font-medium text-white transition hover:bg-pine/90 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 disabled:hover:bg-slate-200"
      >
        Join early access
      </button>
    </form>
  );
}
