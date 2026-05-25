import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { JsonLdScript } from "@/components/json-ld";
import { Nav } from "@/components/nav";

export function generateMetadata(): Metadata {
  return {
    title:
      "Blog — WhatsApp Automation Guides for Appointment-Based Businesses | Zenda",
    description:
      "Guides, ROI calculators, and step-by-step tutorials for beauty salons, dental clinics, fitness studios, and spas using WhatsApp to automate appointments and reduce no-shows.",
    alternates: {
      canonical: "https://zenda.bot/blog",
    },
    openGraph: {
      title: "Zenda Blog — WhatsApp Automation Guides",
      description:
        "Learn how appointment-based businesses use WhatsApp to reduce no-shows, book more appointments, and grow revenue.",
      url: "https://zenda.bot/blog",
      type: "website",
    },
  };
}

interface BlogPost {
  category: string;
  description: string;
  lang: "en" | "es";
  slug: string;
  title: string;
}

const posts: BlogPost[] = [
  {
    slug: "whatsapp-citas-salon",
    title: "Cómo Agendar Citas por WhatsApp para tu Salón",
    description:
      "Guía paso a paso para automatizar las citas de tu salón de belleza por WhatsApp. Reduce inasistencias y agenda más clientes.",
    category: "Belleza",
    lang: "es",
  },
  {
    slug: "reducir-ausencias-clinica",
    title: "Reduce las Ausencias en tu Clínica con WhatsApp",
    description:
      "Estrategias probadas para reducir inasistencias en clínicas médicas y dentales usando recordatorios automatizados por WhatsApp.",
    category: "Clínicas",
    lang: "es",
  },
  {
    slug: "automatizar-whatsapp-negocios",
    title: "Cómo Automatizar WhatsApp para tu Negocio",
    description:
      "Guía completa para automatizar la atención por WhatsApp: citas, respuestas automáticas, recordatorios y más.",
    category: "General",
    lang: "es",
  },
  {
    slug: "whatsapp-appointment-reminders",
    title: "WhatsApp Appointment Reminders: Reduce No-Shows by 40%",
    description:
      "Learn how automated WhatsApp appointment reminders reduce no-shows by up to 40%. Includes best practices, stats, and setup guide.",
    category: "General",
    lang: "en",
  },
  {
    slug: "whatsapp-dental-clinic",
    title:
      "WhatsApp for Dental Clinics: Reduce Cancellations & Fill Your Calendar",
    description:
      "How dental clinics use WhatsApp automation to reduce cancellations by 40%, fill last-minute openings, and book more patients.",
    category: "Dental",
    lang: "en",
  },
  {
    slug: "whatsapp-beauty-salon",
    title:
      "WhatsApp for Beauty Salons: Book More Appointments & Keep Your Chair Full",
    description:
      "How beauty salons use WhatsApp automation to book more appointments, reduce no-shows by 40%, and respond to clients instantly.",
    category: "Beauty",
    lang: "en",
  },
  {
    slug: "whatsapp-dentista-citas",
    title: "WhatsApp para Dentistas: Reduce Cancelaciones y Llena tu Agenda",
    description:
      "Cómo las clínicas dentales usan WhatsApp para reducir cancelaciones 40%, llenar cupos y captar más pacientes. Con calculadora de ROI.",
    category: "Dental",
    lang: "es",
  },
  {
    slug: "whatsapp-salon-belleza",
    title: "WhatsApp para Salones de Belleza: Agenda Más Citas",
    description:
      "Cómo los salones de belleza usan WhatsApp para agendar más citas, reducir inasistencias 40% y responder clientes al instante.",
    category: "Belleza",
    lang: "es",
  },
  {
    slug: "whatsapp-fitness-booking",
    title: "WhatsApp for Fitness Studios: Reduce No-Shows & Book More Classes",
    description:
      "How fitness studios and gyms use WhatsApp automation to reduce class no-shows by 40%, automate booking, and keep members engaged.",
    category: "Fitness",
    lang: "en",
  },
  {
    slug: "whatsapp-spa-citas",
    title: "WhatsApp para Spas: Automatiza Citas y Aumenta tus Ingresos",
    description:
      "Cómo los spas usan WhatsApp para automatizar reservas, reducir cancelaciones 40% y aumentar ingresos. Con calculadora de ROI.",
    category: "Spas",
    lang: "es",
  },
];

const categoryColors: Record<string, string> = {
  General: "bg-slate-100 text-slate-700",
  Belleza: "bg-pink-50 text-pink-700",
  Beauty: "bg-pink-50 text-pink-700",
  Clínicas: "bg-blue-50 text-blue-700",
  Dental: "bg-blue-50 text-blue-700",
  Fitness: "bg-orange-50 text-orange-700",
  Spas: "bg-purple-50 text-purple-700",
};

export default function BlogIndexPage() {
  const esPosts = posts.filter((p) => p.lang === "es");
  const enPosts = posts.filter((p) => p.lang === "en");

  const blogLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Zenda Blog",
    description: "WhatsApp automation guides for appointment-based businesses",
    url: "https://zenda.bot/blog",
    publisher: {
      "@type": "Organization",
      name: "Zenda",
      url: "https://zenda.bot",
    },
    blogPost: posts.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      description: p.description,
      url: `https://zenda.bot/blog/${p.slug}`,
    })),
  };

  return (
    <div className="min-h-screen bg-white">
      <JsonLdScript data={blogLd} />
      <Nav variant="simple" />

      <main className="mx-auto max-w-4xl px-6 py-16">
        <header className="mb-12">
          <h1 className="mb-4 font-bold text-3xl text-slate-900 md:text-4xl">
            Blog
          </h1>
          <p className="text-lg text-slate-600">
            Guías, calculadoras de ROI y tutoriales para automatizar tu negocio
            con WhatsApp.
          </p>
        </header>

        <section className="mb-12">
          <h2 className="mb-6 font-bold text-slate-900 text-xl">
            Artículos en Español
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {esPosts.map((post) => (
              <Link
                className="group rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:border-emerald-200 hover:shadow-md"
                href={`/blog/${post.slug}`}
                key={post.slug}
              >
                <span
                  className={`mb-3 inline-block rounded-full px-3 py-1 font-medium text-xs ${categoryColors[post.category] ?? "bg-slate-100 text-slate-700"}`}
                >
                  {post.category}
                </span>
                <h3 className="mb-2 font-bold text-lg text-slate-900 leading-snug group-hover:text-emerald-600">
                  {post.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {post.description}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="mb-6 font-bold text-slate-900 text-xl">
            Articles in English
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {enPosts.map((post) => (
              <Link
                className="group rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:border-emerald-200 hover:shadow-md"
                href={`/blog/${post.slug}`}
                key={post.slug}
              >
                <span
                  className={`mb-3 inline-block rounded-full px-3 py-1 font-medium text-xs ${categoryColors[post.category] ?? "bg-slate-100 text-slate-700"}`}
                >
                  {post.category}
                </span>
                <h3 className="mb-2 font-bold text-lg text-slate-900 leading-snug group-hover:text-emerald-600">
                  {post.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {post.description}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-2xl bg-slate-900 p-8 text-center">
          <h2 className="mb-3 font-bold text-2xl text-white">
            Ready to automate your WhatsApp?
          </h2>
          <p className="mb-6 text-slate-400">
            14-day free trial. No credit card. Set up in 5 minutes.
          </p>
          <Link
            className="inline-block rounded-full bg-emerald-500 px-8 py-3 font-semibold text-white transition-colors hover:bg-emerald-600"
            href="/founding"
          >
            Start free trial
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
