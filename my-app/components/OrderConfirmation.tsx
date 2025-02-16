"use client"

import { Home, CheckCircle } from 'lucide-react';

export default function OrderConfirmation() {
  return (
    <div className="container mx-auto max-w-md px-6 py-10 text-center">
      <div className="bg-purple-100 p-4 rounded-full inline-block mb-6">
        <CheckCircle size={48} className="text-purple-600" strokeWidth={1.5} />
      </div>
      
      <h2 className="text-3xl font-bold text-gray-800 mb-4">¡Pedido Enviado!</h2>
      
      <p className="text-md text-green-600 mb-8 font-medium">
        ¡Puedes ver el estado de tu pedido en la página de inicio en la sesión Estado del Pedido!
      </p>
      
      <div className="flex justify-center">
        <button
          onClick={() => (window.location.href = "/")}
          className="bg-purple-600 text-white px-8 py-4 rounded-full text-lg font-semibold 
                     hover:bg-purple-700 transition duration-300 
                     flex items-center justify-center gap-3"
        >
          <Home size={24} />
          Volver al Inicio
        </button>
      </div>
    </div>
  )
}