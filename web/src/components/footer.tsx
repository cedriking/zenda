import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-border py-12 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-lg font-bold text-primary">Zenda</div>
        <div className="flex gap-6 text-sm text-muted-foreground">
          <Link href="/legal/privacy" className="hover:text-foreground transition">Privacy</Link>
          <Link href="/legal/terms" className="hover:text-foreground transition">Terms</Link>
          <Link href="/pricing" className="hover:text-foreground transition">Pricing</Link>
          <Link href="/docs" className="hover:text-foreground transition">Docs</Link>
        </div>
        <div className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} Zenda</div>
      </div>
    </footer>
  )
}
