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
        <div className="ml-3 max-w-[calc(100%-3.75rem)] truncate rounded-md bg-white px-4 py-1 text-xs text-ink/50 shadow-sm">
          directrental.uk
        </div>
      </div>
      <div className="grid gap-4 bg-white p-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="relative min-h-[260px] overflow-hidden rounded-xl sm:min-h-[320px] lg:col-span-2">
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
            <p className="text-center text-xs uppercase tracking-[0.28em] text-white/70">
              Mereford, England
            </p>
            <div className="mt-4 flex flex-col items-center gap-4 text-center">
              <div>
                <h3 className="text-2xl sm:text-3xl">Foxglove Hollow Cottage</h3>
                <p className="mt-3 max-w-md text-sm text-white/80">
                  A calm, design-led countryside stay for families and weekend escapes.
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs text-white/80">
                  {[
                    { label: "Sleeps 6", icon: <GuestsIcon /> },
                    { label: "3 bedrooms", icon: <BedIcon /> },
                    { label: "2 bathrooms", icon: <BathIcon /> },
                  ].map((item) => (
                    <span
                      key={item.label}
                      className="inline-flex items-center gap-2 rounded-md border border-white/20 bg-white/10 px-3 py-2 backdrop-blur-sm"
                    >
                      {item.icon}
                      {item.label}
                    </span>
                  ))}
                </div>
              </div>
                <span className="rounded-md bg-white px-5 py-3 text-sm font-medium text-ink">
                  Book now
                </span>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GuestsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 stroke-current" fill="none" strokeWidth="1.8" aria-hidden="true">
      <path d="M16 19a4 4 0 00-8 0" />
      <circle cx="12" cy="11" r="3" />
      <path d="M21 19a4 4 0 00-3-3.87" />
      <path d="M3 19a4 4 0 013-3.87" />
      <path d="M17.5 8.5a2.5 2.5 0 010 5" />
      <path d="M6.5 8.5a2.5 2.5 0 000 5" />
    </svg>
  );
}

function BedIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 stroke-current" fill="none" strokeWidth="1.8" aria-hidden="true">
      <path d="M3 18v-7h18v7" />
      <path d="M3 14h18" />
      <path d="M7 11V8h4a2 2 0 012 2v1" />
      <path d="M3 18v2" />
      <path d="M21 18v2" />
    </svg>
  );
}

function BathIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 stroke-current" fill="none" strokeWidth="1.8" aria-hidden="true">
      <path d="M4 13h16v1a4 4 0 01-4 4H8a4 4 0 01-4-4v-1z" />
      <path d="M6 17v2" />
      <path d="M18 17v2" />
      <path d="M8 13V7a2 2 0 114 0" />
      <path d="M12 9h2" />
    </svg>
  );
}
