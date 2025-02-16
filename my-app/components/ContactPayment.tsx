'use client'

import { useRouter } from 'next/navigation'

export default function ContactPayment({ onNext }: { onNext: () => void }) {
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    router.push('/realizar-pedido')
  }

  return (
    <section id="contacto-pago" className="py-10 bg-white">
      <div className="container mx-auto px-4">
        <form onSubmit={handleSubmit} className="max-w-lg mx-auto">
          <button type="submit" className="w-full bg-purple-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-purple-700 transition duration-300">
            Continuar con el pedido
          </button>
        </form>
      </div>
    </section>
  )
}
