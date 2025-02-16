import { getOrders } from "@/lib/actions";

export async function GET() {
  const codificador = new TextEncoder();
  const flujo = new ReadableStream({
    async start(controlador) {
      let intervaloDePolling: NodeJS.Timeout | null = null;
      let estaCerrado = false;

      const enviarPedidos = async () => {
        try {
          if (estaCerrado) return;

          const pedidos = await getOrders();
          const pedidosOrdenados = pedidos.sort(
            (a: any, b: any) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
          controlador.enqueue(codificador.encode(`data: ${JSON.stringify(pedidosOrdenados)}\n\n`));
        } catch (error) {
          console.error("Error enviando pedidos:", error);
          if (intervaloDePolling) {
            clearInterval(intervaloDePolling);
          }
          if (!estaCerrado) {
            controlador.close();
            estaCerrado = true;
          }
        }
      };

      await enviarPedidos();

      intervaloDePolling = setInterval(async () => {
        try {
          if (estaCerrado) return;
          await enviarPedidos();
        } catch (error) {
          console.error("Error en el intervalo de polling:", error);
          if (intervaloDePolling) {
            clearInterval(intervaloDePolling);
          }
          if (!estaCerrado) {
            controlador.close();
            estaCerrado = true;
          }
        }
      }, 5000);

      controlador.close = (() => {
        if (!estaCerrado) {
          clearInterval(intervaloDePolling);
          console.log("Controlador de flujo cerrado.");
          estaCerrado = true;
        }
      });
    },
    cancel() {
      console.log("Cliente cerró la conexión");
    },
  });

  return new Response(flujo, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
