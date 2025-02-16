import Link from "next/link"
import { IceCream } from "lucide-react"

export function Header() {
  return (
    <header className="bg-gradient-to-b from-white via-white/50 to-transparent relative z-50 pb-8">
      <nav className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <IceCream className="h-8 w-8 text-pink-500" />
            <span className="ml-3 text-xl font-semibold text-gray-800">Heladería Deliciosa</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
          </div>
        </div>
      </nav>
    </header>
  )
}

