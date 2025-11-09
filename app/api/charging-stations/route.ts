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
    
    // Mappa i campi dal CSV al formato corretto
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

    return NextResponse.json({
      success: true,
      data: dataWithIds,
      count: dataWithIds.length
    }, { status: 200 });
    
  } catch (err) {
    const message = err instanceof Error ? err.message : "Errore sconosciuto";
    return NextResponse.json({ 
      success: false,
      data: [],
      count: 0,
      error: message
    }, { status: 500 });
  }
}
