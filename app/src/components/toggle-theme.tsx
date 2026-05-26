import { Moon, Sun } from "lucide-react"
import { toggleTheme } from "@/actions/theme"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

export default function ToggleTheme() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"))
    })
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })
    setIsDark(document.documentElement.classList.contains("dark"))
    return () => observer.disconnect()
  }, [])

  return (
    <Button onClick={toggleTheme} size="icon">
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </Button>
  )
}
