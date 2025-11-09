// 🔋 Tipo principale per una stazione di ricarica (CSV + API)
export interface ChargingStation {
  id?: string;

  // Nome e posizione
  Title: string;
  city?: string;
  Latitude: number;
  Longitude: number;

  // Tipologia e potenza
  charging_station_type: "slow" | "fast" | "ultrafast" | string;
  PowerKW: number;

  // Temporalità
  installation_year: number;
  year: number;
  month?: string;

  // Metriche
  monthly_consumption_kwh?: number;
}

// 🔹 Risposta standard del backend
export interface ChargingStationResponse {
  success: boolean;
  data: ChargingStation[];
  count: number;
  error?: string;
  details?: string;
}

// 🔹 Statistiche aggregate
export interface ChargingStationStats {
  totalStations: number;
  stationsByType: Record<string, number>;
  stationsByYear: Record<number, number>;
  averagePower: number;
  totalConsumption: number;
}

// 🔹 Limiti mappa (opzionale)
export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

// 🔹 Colori marker / cluster
export interface MarkerClusterColors {
  city_border: string;
  istat_cells: string;
  fast: string;
  ultrafast: string;
  slow: string;
  other: string;
}
