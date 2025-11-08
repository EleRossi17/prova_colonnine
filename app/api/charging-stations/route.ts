import { NextResponse } from "next/server";
import Papa from "papaparse";
import { promises as fs } from "fs";
import path from "path";

export async function GET() {
  try {
    // Percorso locale del CSV
    const filePath = path.join(process.cwd(), "public", "charg_stations.csv");

    // Legge il file CSV dalla cartella /public
    const csvText = await fs.readFile(filePath, "utf-8");

    // Converte il CSV in JSON
    const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });

    return NextResponse.json(parsed.data, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Errore sconosciuto";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
