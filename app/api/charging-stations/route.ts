import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import Papa from "papaparse";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "public", "charg_stations.csv");
    const csvText = await fs.readFile(filePath, { encoding: "utf-8" });

    const cleanText = csvText.replace(/^\uFEFF/, "").trim();

    const parsed = Papa.parse(cleanText, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
    });

    if (!parsed.data || !Array.isArray(parsed.data)) {
      console.error("⚠️ CSV vuoto o non leggibile:", parsed);
      return NextResponse.json([], { status: 200 });
    }

    const dataWithIds = parsed.data.map((station: any, index: number) => ({
      id: station.id || `station-${index}`,
      Title: station.Title || `Stazione #${index + 1}`,
      Latitude: parseFloat(station.Latitude) || 0,
      Longitude: parseFloat(station.Longitude) || 0,
      installation_year: parseInt(station.anno) || 2024,  // 👈 aggiunto campo standard
      year: parseInt(station.anno) || 2024,               // 👈 compatibilità frontend
      charging_station_type: station.charging_station_type || "slow",
      PowerKW: parseFloat(station.PowerKW) || 0,
      city: station.city || "Crema",                      // 👈 default per filtro città
      monthly_consumption_kwh: 0,                         // 👈 placeholder
    }));

    console.log(`✅ Caricate ${dataWithIds.length} stazioni di ricarica`);
    return NextResponse.json(dataWithIds, { status: 200 });
  } catch (err: any) {
    console.error("❌ Errore durante la lettura/parsing del CSV:", err.message);
    return NextResponse.json([], { status: 500 });
  }
}
