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
  // ✅ Usa un URL assoluto in produzione, ma resta flessibile in locale
  private static baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/charging-stations`
      : "/api/charging-stations";

  static async fetchChargingStations(
    params: FetchChargingStationsParams = {}
  ): Promise<ChargingStationResponse> {
    const queryParams = new URLSearchParams();

    if (params.year) queryParams.append("year", params.year.toString());
    if (params.type) queryParams.append("type", params.type);
    if (params.month) queryParams.append("month", params.month);
    if (params.city) queryParams.append("city", params.city);

    const url = `${this.baseUrl}${
      queryParams.toString() ? `?${queryParams}` : ""
    }`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  static async fetchChargingStationStats(): Promise<{
    success: boolean;
    data: ChargingStationStats;
  }> {
    const response = await fetch(`${this.baseUrl}/stats`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(stationData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error("Error creating charging station:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  static async deleteChargingStation(id: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const response = await fetch(
        `${this.baseUrl}?id=${encodeURIComponent(id)}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error("Error deleting charging station:", error);

      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown error occurred while deleting charging station",
      };
    }
  }

  // Helper function to get unique values for filters
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
