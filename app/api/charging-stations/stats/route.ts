import { CosmosClient, Container } from "@azure/cosmos";
import { NextRequest, NextResponse } from "next/server";
import { ChargingStationStats } from "@/app/types/charging-station";

// ⚡ IMPORTANTE: Disabilita il pre-rendering di questa route
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Singleton instance
let containerInstance: Container | null = null;

function getContainer(): Container {
  if (!containerInstance) {
    const endpoint = process.env.COSMOS_DB_ENDPOINT;
    const key = process.env.COSMOS_KEY_CHARGING_STATION;
    const dbName = process.env.COSMOS_DB_DATABASE_NAME;
    const containerName = process.env.COSMOS_DB_CONTAINER_NAME;

    if (!endpoint || !key || !dbName || !containerName) {
      const missing = [
        !endpoint && "COSMOS_DB_ENDPOINT",
        !key && "COSMOS_KEY_CHARGING_STATION",
        !dbName && "COSMOS_DB_DATABASE_NAME",
        !containerName && "COSMOS_DB_CONTAINER_NAME",
      ].filter(Boolean);

      throw new Error(
        `❌ Missing Cosmos DB environment variables: ${missing.join(", ")}`
      );
    }

    const client = new CosmosClient({ endpoint, key });
    const database = client.database(dbName);
    containerInstance = database.container(containerName);
  }

  return containerInstance;
}

export async function GET(request: NextRequest) {
  try {
    const container = getContainer();

    const { resources: items } = await container.items
      .query({
        query: "SELECT * FROM c",
      })
      .fetchAll();

    const stats: ChargingStationStats = {
      totalStations: items.length,
      stationsByType: {},
      stationsByYear: {},
      averagePower: 0,
      totalConsumption: 0,
    };

    let totalPower = 0;
    let totalConsumption = 0;

    items.forEach((station) => {
      const type = station.charging_station_type || "unknown";
      stats.stationsByType[type] = (stats.stationsByType[type] || 0) + 1;

      const year = station.installation_year || station.year;
      stats.stationsByYear[year] = (stats.stationsByYear[year] || 0) + 1;

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
