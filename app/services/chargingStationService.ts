import {
  ChargingStation,
  ChargingStationResponse,
  ChargingStationStats,
} from "@/app/types/charging-station";

interface FetchChargingStationsParams {
  year?: number;
  type?: string;
  month?: string;
  city?: string;
}

export class ChargingStationService {
  // ✅ Base URL flessibile (funziona in locale e su Vercel)
  private static baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/charging-stations`
      : "/api/charging-stations";

  /**
   * 🔹 Fetch all charging stations with optional filters
   */
  static async fetchChargingStations(
    params: FetchChargingStationsParams = {}
  ): Promise<ChargingStationResponse> {
    try {
      const queryParams = new URLSearchParams();

      if (params.year) queryParams.append("year", params.year.toString());
      if (params.type) queryParams.append("type", params.type);
      if (params.month) queryParams.append("month", params.month);
      if (params.city) queryParams.append("city", params.city);

      const url = `${this.baseUrl}${queryParams.toString() ? `?${queryParams}` : ""}`;

      console.log("🔗 Fetching charging stations from:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // ✅ Gestione flessibile: supporta sia array diretto che oggetto { data: [] }
      const stations = Array.isArray(data) ? data : data.data || [];

      return {
        success: true,
        data: stations,
      };
    } catch (error) {
      console.error("❌ Error fetching charging stations:", error);
      return {
        success: false,
        error: "Failed to fetch charging stations",
        data: [],
      } as ChargingStationResponse;
    }
  }

  /**
   * 🔹 Fetch aggregated stats for charging stations
   */
  static async fetchChargingStationStats(): Promise<{
    success: boolean;
    data: ChargingStationStats;
  }> {
    try {
      const statsUrl = this.baseUrl.replace("/api/charging-stations", "/api/charging-stations/stats");
      const response = await fetch(statsUrl, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("❌ Error fetching station stats:", error);
      return {
        success: false,
        data: {} as ChargingStationStats,
      };
    }
  }

  /**
   * 🔹 Create a new charging station
   */
  static async createChargingStation(
    stationData: Partial<ChargingStation>
  ): Promise<{
    success: boolean;
    data?: ChargingStation;
    error?: string;
  }> {
    try {
      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(stationData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error("❌ Error creating charging station:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * 🔹 Delete a charging station by ID
   */
  static async deleteChargingStation(id: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const response = await fetch(
        `${this.baseUrl}?id=${encodeURIComponent(id)}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error("❌ Error deleting charging station:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown error occurred while deleting charging station",
      };
    }
  }

  /**
   * 🔹 Utility: extract unique values for filters
   */
  static getUniqueValues(
    stations: ChargingStation[],
    field: keyof ChargingStation
  ): string[] {
    const uniqueValues = [
      ...new Set(stations.map((station) => station[field])),
    ];
    return uniqueValues.filter((value) => value !== undefined).map(String);
  }
}
