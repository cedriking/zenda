import { Nav } from '@/components/nav'
import { Footer } from '@/components/footer'
import { HomeAnimations } from '@/components/home-animations'
import { getTranslations } from 'next-intl/server'

export default async function Home() {
  const t = await getTranslations('home')

  return (
    <div className="min-h-screen bg-neutral-200">
      <Nav variant="home" />

      {/* White container with rounded corners for hero + audiences */}
      <div className="bg-white rounded-b-[2rem] shadow-2xl overflow-hidden">
        <main>
          {/* Hero */}
          <section className="relative pt-32 pb-24 px-6 overflow-hidden">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/5 rounded-full -translate-y-1/2 translate-x-1/4" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full translate-y-1/2 -translate-x-1/4" />

            <div className="relative max-w-4xl mx-auto text-center">
              <HomeAnimations variant="hero" />
            </div>
          </section>

          {/* Audiences — Who it's for */}
          <section className="py-20 px-6">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <span className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 border border-emerald-100">
                  {t('audiencesBadge')}
                </span>
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">{t('audiencesTitle')}</h2>
                <p className="text-slate-500 text-center mb-12 max-w-2xl mx-auto text-lg">
                  {t('audiencesDesc')}
                </p>
              </div>
              <HomeAnimations variant="audiences" />
            </div>
          </section>
        </main>
      </div>

      {/* Capabilities */}
      <section className="py-20 px-6 bg-neutral-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 border border-emerald-100">
              {t('capabilitiesBadge')}
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">{t('capabilitiesTitle')}</h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">
              {t('capabilitiesDesc')}
            </p>
          </div>
          <div className="mt-12">
            <HomeAnimations variant="capabilities" />
          </div>
        </div>
      </section>

      {/* Features with visuals */}
      <section className="py-20 px-6 bg-neutral-200">
        <div className="max-w-6xl mx-auto">
          <HomeAnimations variant="features" />
        </div>
      </section>

      {/* Safety (dark section) */}
      <section className="py-20 px-6 bg-neutral-200">
        <div className="max-w-6xl mx-auto">
          <div className="bg-slate-950 rounded-[2rem] p-8 md:p-16 overflow-hidden">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <span className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 border border-emerald-500/20">
                {t('safetyBadge')}
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4">{t('safetyTitle')}</h2>
              <p className="text-slate-400 text-lg">
                {t('safetyDesc')}
              </p>
            </div>
            <HomeAnimations variant="safety" />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6 bg-neutral-200">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 border border-emerald-100">
              {t('howBadge')}
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900">{t('howTitle')}</h2>
          </div>
          <HomeAnimations variant="how-it-works" />
        </div>
      </section>

      {/* Dashboard mockup */}
      <section className="py-20 px-6 bg-neutral-200">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 border border-emerald-100">
              {t('dashboardBadge')}
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">{t('dashboardTitle')}</h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">
              {t('dashboardDesc')}
            </p>
          </div>
          <HomeAnimations variant="dashboard" />
        </div>
      </section>

      {/* Industries */}
      <section className="py-20 px-6 bg-neutral-200">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-8">{t('industriesTitle')}</h2>
          <HomeAnimations variant="industries" />
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-neutral-200">
        <div className="max-w-4xl mx-auto">
          <HomeAnimations variant="cta" />
        </div>
      </section>

      <Footer />
    </div>
  )
}
