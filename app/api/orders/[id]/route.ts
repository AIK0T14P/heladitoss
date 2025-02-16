import { type NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function GET(solicitud: NextRequest, contexto: { params: { id: string } }) {
  const { params } = await Promise.resolve(contexto);
  const idPedido = params.id;
  const rutaPedidos = path.join(process.cwd(), "data", "orders.json");

  const { searchParams } = new URL(solicitud.url);
  const flujo = searchParams.get("stream") === "true";

  if (flujo) {
    const flujo = new ReadableStream({
      async start(controlador) {
        let abortado = false;

        const intervalo = setInterval(async () => {
          if (abortado) {
            clearInterval(intervalo);
            return;
          }

          try {
            const datosPedidos = await fs.readFile(rutaPedidos, "utf-8");
            const pedidos = JSON.parse(datosPedidos);
            const pedido = pedidos.find((p: any) => p.id === idPedido);

            if (pedido) {
              try {
                controlador.enqueue(`data: ${JSON.stringify(pedido)}\n\n`);
              } catch (err) {
                console.error("Flujo cerrado mientras se encolaba:", err);
                clearInterval(intervalo);
                controlador.close();
              }
            }
          } catch (error) {
            console.error("Error al leer los pedidos:", error);
            controlador.error("El flujo falló debido a un error.");
            clearInterval(intervalo);
          }
        }, 5000);

        controlador.close = () => {
          abortado = true;
          clearInterval(intervalo);
        };
      },
    });

    return new NextResponse(flujo, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } else {
    try {
      const datosPedidos = await fs.readFile(rutaPedidos, "utf-8");
      const pedidos = JSON.parse(datosPedidos);
      const pedido = pedidos.find((p: any) => p.id === idPedido);

      if (!pedido) {
        return new NextResponse(JSON.stringify({ error: "Pedido no encontrado" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new NextResponse(JSON.stringify(pedido), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      return new NextResponse(JSON.stringify({ error: "Error interno del servidor" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }
}