import { FormEvent } from "react";
import { useNavigate } from "react-router-dom";

export function LeadForm() {
  const navigate = useNavigate();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      name: String(formData.get("name") || ""),
      email: String(formData.get("email") || ""),
      properties: String(formData.get("properties") || ""),
      platforms: String(formData.get("platforms") || ""),
      submittedAt: new Date().toISOString(),
    };

    console.log("New demo request:", payload);
    form.reset();
    navigate("/thank-you");
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-ink">
          Name
          <input
            name="name"
            required
            placeholder="Jane Smith"
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base outline-none transition focus:border-pine focus:ring-2 focus:ring-pine/15"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-ink">
          Email
          <input
            name="email"
            type="email"
            required
            placeholder="jane@yourproperty.com"
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base outline-none transition focus:border-pine focus:ring-2 focus:ring-pine/15"
          />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-ink">
          Number of properties
          <select
            name="properties"
            required
            defaultValue=""
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base outline-none transition focus:border-pine focus:ring-2 focus:ring-pine/15"
          >
            <option value="" disabled>
              Select an option
            </option>
            <option>1</option>
            <option>2-3</option>
            <option>4-10</option>
            <option>10+</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium text-ink">
          Current platforms
          <input
            name="platforms"
            placeholder="Airbnb, Booking.com, Vrbo"
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base outline-none transition focus:border-pine focus:ring-2 focus:ring-pine/15"
          />
        </label>
      </div>
      <button
        type="submit"
        className="rounded-full bg-pine px-6 py-3 text-base font-medium text-white transition hover:bg-pine/90"
      >
        Book a demo
      </button>
    </form>
  );
}
