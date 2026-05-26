import { getTranslations } from "next-intl/server";
import { Footer } from "@/components/footer";
import { HomeAnimations } from "@/components/home-animations";
import { Nav } from "@/components/nav";

export default async function Home() {
  const t = await getTranslations("home");

  return (
    <div className="min-h-screen bg-neutral-200">
      <Nav variant="home" />

      {/* White container with rounded corners for hero + audiences */}
      <div className="overflow-hidden rounded-b-[2rem] bg-white shadow-2xl">
        <main>
          {/* Hero */}
          <section className="relative overflow-hidden px-6 pt-32 pb-24">
            <div className="absolute top-0 right-0 h-[600px] w-[600px] translate-x-1/4 -translate-y-1/2 rounded-full bg-emerald-500/5" />
            <div className="absolute bottom-0 left-0 h-[400px] w-[400px] -translate-x-1/4 translate-y-1/2 rounded-full bg-emerald-500/5" />

            <div className="relative mx-auto max-w-4xl text-center">
              <HomeAnimations variant="hero" />
            </div>
          </section>

          {/* Audiences — Who it's for */}
          <section className="px-6 py-20">
            <div className="mx-auto max-w-6xl">
              <div className="mb-12 text-center">
                <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-1.5 font-semibold text-emerald-700 text-xs uppercase tracking-wider">
                  {t("audiencesBadge")}
                </span>
                <h2 className="mb-4 font-black text-3xl text-slate-900 md:text-4xl">
                  {t("audiencesTitle")}
                </h2>
                <p className="mx-auto mb-12 max-w-2xl text-center text-lg text-slate-500">
                  {t("audiencesDesc")}
                </p>
              </div>
              <HomeAnimations variant="audiences" />
            </div>
          </section>
        </main>
      </div>

      {/* Capabilities */}
      <section className="bg-neutral-200 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-1.5 font-semibold text-emerald-700 text-xs uppercase tracking-wider">
              {t("capabilitiesBadge")}
            </span>
            <h2 className="mb-4 font-black text-3xl text-slate-900 md:text-4xl">
              {t("capabilitiesTitle")}
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-slate-500">
              {t("capabilitiesDesc")}
            </p>
          </div>
          <div className="mt-12">
            <HomeAnimations variant="capabilities" />
          </div>
        </div>
      </section>

      {/* Features with visuals */}
      <section className="bg-neutral-200 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <HomeAnimations variant="features" />
        </div>
      </section>

      {/* Safety (dark section) */}
      <section className="bg-neutral-200 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="overflow-hidden rounded-[2rem] bg-slate-950 p-8 md:p-16">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 font-semibold text-emerald-400 text-xs uppercase tracking-wider">
                {t("safetyBadge")}
              </span>
              <h2 className="mb-4 font-black text-3xl text-white md:text-4xl">
                {t("safetyTitle")}
              </h2>
              <p className="text-lg text-slate-400">{t("safetyDesc")}</p>
            </div>
            <HomeAnimations variant="safety" />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-neutral-200 px-6 py-20" id="how-it-works">
        <div className="mx-auto max-w-4xl">
          <div className="mb-16 text-center">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-1.5 font-semibold text-emerald-700 text-xs uppercase tracking-wider">
              {t("howBadge")}
            </span>
            <h2 className="font-black text-3xl text-slate-900 md:text-4xl">
              {t("howTitle")}
            </h2>
          </div>
          <HomeAnimations variant="how-it-works" />
        </div>
      </section>

      {/* Dashboard mockup */}
      <section className="bg-neutral-200 px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-1.5 font-semibold text-emerald-700 text-xs uppercase tracking-wider">
              {t("dashboardBadge")}
            </span>
            <h2 className="mb-4 font-black text-3xl text-slate-900 md:text-4xl">
              {t("dashboardTitle")}
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-slate-500">
              {t("dashboardDesc")}
            </p>
          </div>
          <HomeAnimations variant="dashboard" />
        </div>
      </section>

      {/* Industries */}
      <section className="bg-neutral-200 px-6 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-8 font-black text-2xl text-slate-900 md:text-3xl">
            {t("industriesTitle")}
          </h2>
          <HomeAnimations variant="industries" />
        </div>
      </section>

      {/* CTA */}
      <section className="bg-neutral-200 px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <HomeAnimations variant="cta" />
        </div>
      </section>

      <Footer />
    </div>
  );
}
