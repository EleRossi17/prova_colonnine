import { CosmosClient } from "@azure/cosmos";
import { NextRequest, NextResponse } from "next/server";
import { ChargingStationStats } from "@/app/types/charging-station";

// Initialize Cosmos DB client
const cosmosClient = new CosmosClient({
  endpoint: process.env.COSMOS_DB_ENDPOINT!,
  key: process.env.COSMOS_KEY_CHARGING_STATION!,
});

const database = cosmosClient.database(process.env.COSMOS_DB_DATABASE_NAME!);
const container = database.container(process.env.COSMOS_DB_CONTAINER_NAME!);

export async function GET(request: NextRequest) {
  try {
    // Get all stations for statistics
    const { resources: items } = await container.items
      .query({
        query: "SELECT * FROM c",
      })
      .fetchAll();

    // Calculate statistics
    const stats: ChargingStationStats = {
      totalStations: items.length,
      stationsByType: {},
      stationsByYear: {},
      averagePower: 0,
      totalConsumption: 0,
    };

    // Group by type and year
    let totalPower = 0;
    let totalConsumption = 0;

    items.forEach((station) => {
      // Count by type
      const type = station.charging_station_type || "unknown";
      stats.stationsByType[type] = (stats.stationsByType[type] || 0) + 1;

      // Count by year
      const year = station.installation_year || station.year;
      stats.stationsByYear[year] = (stats.stationsByYear[year] || 0) + 1;

      // Sum power and consumption
      totalPower += station.power_kw || 0;
      totalConsumption += station.monthly_consumption_kwh || 0;
    });

    stats.averagePower = items.length > 0 ? totalPower / items.length : 0;
    stats.totalConsumption = totalConsumption;

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching charging station stats:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch charging station statistics",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
