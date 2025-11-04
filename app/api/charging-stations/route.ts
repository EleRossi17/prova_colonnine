import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Funzione per leggere CSV locali (dal filesystem)
function readCSVFile(fileName: string): string[][] {
  try {
    const filePath = path.join(process.cwd(), "app", "api", "charging-stations", "stats", fileName);
    const data = fs.readFileSync(filePath, "utf-8");
    const rows = data
      .trim()
      .split("\n")
      .map((line) => line.split(","));
    return rows;
  } catch (error) {
    console.error(`❌ Errore nel leggere ${fileName}:`, error);
    return [];
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const file = searchParams.get("file") || "charging_stations.csv"; // parametro opzionale ?file=milano_2805.csv

    // Legge il CSV scelto
    const rows = readCSVFile(file);

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, message: `File CSV '${file}' vuoto o non trovato.` },
        { status: 404 }
      );
    }

    // Estrai header e dati
    const [headers, ...dataRows] = rows;
    const data = dataRows.map((row) => {
      const obj: Record<string, string> = {};
      headers.forEach((h, i) => (obj[h.trim()] = row[i]?.trim() ?? ""));
      return obj;
    });

    return NextResponse.json({
      success: true,
      count: data.length,
      data,
      message: `📊 File '${file}' letto correttamente`,
    });
  } catch (error) {
    console.error("❌ Errore nella GET /api/charging-stations/stats:", error);
    return NextResponse.json(
      { success: false, error: "Errore durante la lettura dei CSV", details: String(error) },
      { status: 500 }
    );
  }
}
