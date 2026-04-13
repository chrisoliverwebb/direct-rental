import { ReactNode } from "react";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

type LegalSection = {
  title: string;
  content: ReactNode;
};

type LegalPageProps = {
  eyebrow: string;
  title: string;
  lastUpdated: string;
  intro?: ReactNode;
  sections: LegalSection[];
};

export function LegalPage({ eyebrow, title, lastUpdated, intro, sections }: LegalPageProps) {
  return (
    <main>
      <SiteHeader />

      <section className="container-shell section-spacing">
        <div className="card-surface mx-auto max-w-4xl px-6 py-10 sm:px-10 sm:py-12">
          <p className="text-sm uppercase tracking-[0.28em] text-pine/80">{eyebrow}</p>
          <h1 className="mt-4 text-4xl text-ink sm:text-5xl">{title}</h1>
          <p className="mt-4 text-sm text-ink/55">Last updated: {lastUpdated}</p>
          {intro ? <div className="mt-6 text-lg leading-8 text-ink/70">{intro}</div> : null}

          <div className="mt-10 grid gap-8">
            {sections.map((section, index) => (
              <section
                key={section.title}
                className={index === 0 ? "" : "border-t border-pine/10 pt-8"}
              >
                <h2 className="text-2xl text-ink sm:text-3xl">{section.title}</h2>
                <div className="mt-4 grid gap-4 text-base leading-8 text-ink/72">{section.content}</div>
              </section>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
