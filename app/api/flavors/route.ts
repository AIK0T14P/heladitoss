import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function GET() {
  const rutaDatos = path.join(process.cwd(), "data", "flavors.json");
  try {
    const datos = await fs.readFile(rutaDatos, "utf-8");
    return NextResponse.json(JSON.parse(datos));
  } catch (error) {
    console.error("Error al leer los datos de sabores:", error);
    return NextResponse.json({ error: "Error al leer los datos de sabores" }, { status: 500 });
  }
}