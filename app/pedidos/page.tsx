import { Suspense } from "react";
import { OrdersList } from "@/components/OrdersList";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function PedidosPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Pedidos</h1>
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-8">
            <div className="animate-pulse text-lg text-gray-600">Cargando pedidos...</div>
          </div>
        }
      >
        <OrdersList />
      </Suspense>
    </div>
  );
}
