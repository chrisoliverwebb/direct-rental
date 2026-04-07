import { Link } from "react-router-dom";
import featureAvif from "../static/feature.avif";
import featureJpg from "../static/feature.jpg";
import featureWebp from "../static/feature.webp";
import { ResponsiveImage } from "./ResponsiveImage";

export function BrowserPreview() {
  return (
    <div className="card-surface overflow-hidden">
      <div className="flex items-center gap-2 border-b border-slate-200/80 bg-slate-50 px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-rose-300" />
        <span className="h-3 w-3 rounded-full bg-amber-300" />
        <span className="h-3 w-3 rounded-full bg-emerald-300" />
        <div className="ml-3 rounded-full bg-white px-4 py-1 text-xs text-slate-500 shadow-sm">
          foxglovehollow.directrental.co
        </div>
      </div>
      <div className="grid gap-4 bg-white p-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="relative min-h-[320px] overflow-hidden rounded-[24px]">
          <ResponsiveImage
            image={{
              avif: featureAvif,
              webp: featureWebp,
              jpg: featureJpg,
              alt: "Preview of fictional property website hero image",
            }}
            loading="eager"
            sizes="(max-width: 1024px) 100vw, 720px"
            className="absolute inset-0"
            imgClassName="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/10 to-slate-950/45" />
          <div className="relative flex h-full flex-col justify-end p-6 text-white">
            <p className="mb-2 text-xs uppercase tracking-[0.28em] text-white/70">
              Foxglove Hollow Cottage
            </p>
            <h3 className="text-3xl">Book direct for the best rate at your own fictional stay site</h3>
            <p className="mt-3 max-w-md text-sm text-white/80">
              A warm, design-led holiday cottage demo with private garden, three bedrooms, and easy village access.
            </p>
          </div>
        </div>
        <div className="space-y-4 rounded-[24px] bg-sand p-5">
          <div className="rounded-[20px] bg-white p-4 shadow-sm">
            <p className="text-sm text-ink/60">Next available stay</p>
            <p className="mt-2 text-2xl font-semibold text-ink">18-22 May</p>
            <p className="mt-2 text-sm text-ink/60">From £180 / night</p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {["Sleeps 6", "3 bedrooms", "2 bathrooms", "Pet-friendly"].map((item) => (
              <div key={item} className="rounded-[18px] bg-white px-4 py-3 text-ink/70 shadow-sm">
                {item}
              </div>
            ))}
          </div>
          <Link
            to="/demo"
            className="block rounded-full bg-clay px-5 py-3 text-center text-sm font-medium text-white transition hover:bg-clay/90"
          >
            View example property
          </Link>
        </div>
      </div>
    </div>
  );
}
