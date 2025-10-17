export interface ChargingStation {
  id: string;
  charging_station: string;
  latitude: number;
  longitude: number;
  installation_year: number;
  year: number;
  month: string;
  power_kw: number;
  charging_station_type: "slow" | "fast" | "ultrafast" | string;
  monthly_consumption_kwh: number;
  city: string;
  _rid?: string;
  _self?: string;
  _etag?: string;
  _attachments?: string;
  _ts?: number;
}

export interface ChargingStationResponse {
  success: boolean;
  data: ChargingStation[];
  count: number;
  error?: string;
  details?: string;
}

export interface ChargingStationStats {
  totalStations: number;
  stationsByType: Record<string, number>;
  stationsByYear: Record<number, number>;
  averagePower: number;
  totalConsumption: number;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface MarkerClusterColors {
  city_border: string;
  istat_cells: string;
  fast: string;
  ultrafast: string;
  slow: string;
  other: string;
}
