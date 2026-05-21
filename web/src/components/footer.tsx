import Link from 'next/link'
import { MessageCircle, Send } from 'lucide-react'

const FOOTER_LINKS = {
  Product: [
    { label: 'Features', href: '/#features' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Documentation', href: '/docs' },
  ],
  Company: [
    { label: 'About', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Contact', href: '#' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/legal/privacy' },
    { label: 'Terms of Service', href: '/legal/terms' },
  ],
}

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <MessageCircle className="size-6 text-emerald-400 fill-emerald-400 stroke-slate-900" strokeWidth={2} />
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full border-2 border-slate-900" />
      </div>
      <span className="text-lg font-bold text-white">Zenda</span>
    </div>
  )
}

export function Footer() {
  return (
    <footer className="bg-neutral-200 py-6 px-4 md:px-8">
      <div className="bg-slate-950 rounded-[2rem] overflow-hidden">
        <div className="max-w-7xl mx-auto px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
            {/* Brand column */}
            <div className="col-span-2">
              <Logo />
              <p className="text-sm text-slate-400 leading-relaxed mt-4 max-w-xs">
                AI receptionist for appointment-based businesses in Latin America. Available 24/7 on WhatsApp.
              </p>
            </div>

            {/* Link columns */}
            {Object.entries(FOOTER_LINKS).map(([title, links]) => (
              <div key={title}>
                <h4 className="text-sm font-semibold text-white mb-4">{title}</h4>
                <ul className="space-y-2.5">
                  {links.map(l => (
                    <li key={l.label}>
                      <Link href={l.href} className="text-sm text-slate-400 hover:text-white transition">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="mt-16 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500">&copy; {new Date().getFullYear()} Zenda. All rights reserved.</p>
            <div className="flex items-center gap-2 text-slate-400">
              <Send className="size-4" />
              <span className="text-xs">Built in Latin America</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
