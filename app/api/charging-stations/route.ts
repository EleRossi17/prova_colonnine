import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import Papa from "papaparse";

export async function GET() {
  try {
    // Percorso locale del CSV
    const filePath = path.join(process.cwd(), "public", "charg_stations.csv");
    // Legge il file CSV dalla cartella /public
    const csvText = await fs.readFile(filePath, "utf-8");
    // Converte il CSV in JSON
    const parsed = Papa.parse(csvText, { 
      header: true, 
      skipEmptyLines: true,
      dynamicTyping: true 
    });
    
    // Aggiungi un ID univoco a ogni stazione se non esiste
    const dataWithIds = parsed.data.map((station: any, index: number) => ({
      ...station,
      id: station.id || `station-${index}`,
      // Assicurati che i campi numerici siano numeri
      Latitude: parseFloat(station.Latitude),
      Longitude: parseFloat(station.Longitude),
      PowerKW: parseFloat(station.PowerKW) || 0,
      anno: parseInt(station.anno) || 2024,
      // Aggiungi campi aggiuntivi se necessario
      installation_year: parseInt(station.anno) || 2024,
      year: parseInt(station.anno) || 2024,
      city: station.city || "Crema", // Default city se non presente
    }));

    // Restituisci nel formato atteso dal frontend
    return NextResponse.json({
      success: true,
      data: dataWithIds
    }, { status: 200 });
    
  } catch (err) {
    const message = err instanceof Error ? err.message : "Errore sconosciuto";
    return NextResponse.json({ 
      success: false,
      error: message,
      data: []
    }, { status: 500 });
  }
}
