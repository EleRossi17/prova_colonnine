import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import Papa from "papaparse";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "public", "charg_stations.csv");
    const csvText = await fs.readFile(filePath, "utf-8");

    const parsed = Papa.parse(csvText, { 
      header: true, 
      skipEmptyLines: true,
      dynamicTyping: true 
    });

    // 🔄 Mappa i dati CSV nel formato desiderato
    const dataWithIds = parsed.data.map((station: any, index: number) => ({
      id: station.id || `station-${index}`,
      charging_station: station.Title || "Unknown",
      latitude: parseFloat(station.Latitude) || 0,
      longitude: parseFloat(station.Longitude) || 0,
      installation_year: parseInt(station.anno) || 2024,
      year: parseInt(station.anno) || 2024,
      month: station.month || "January",
      power_kw: parseFloat(station.PowerKW) || 0,
      charging_station_type: station.charging_station_type || "slow",
      monthly_consumption_kwh: station.monthly_consumption_kwh || 0,
      city: station.city || "Crema",
    }));

    // ✅ RESTITUISCI SEMPRE UN ARRAY
    return NextResponse.json(dataWithIds, { status: 200 });

  } catch (err) {
    console.error("❌ Errore nella lettura del CSV:", err);

    // ✅ Anche in caso di errore, restituisci un array vuoto
    return NextResponse.json([], { status: 500 });
  }
}
