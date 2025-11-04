import { CosmosClient } from "@azure/cosmos";
import { NextRequest, NextResponse } from "next/server";

function getContainer() {
  const endpoint = process.env.COSMOS_DB_ENDPOINT;
  const key = process.env.COSMOS_KEY_CHARGING_STATION;
  const dbName = process.env.COSMOS_DB_DATABASE_NAME;
  const containerName = process.env.COSMOS_DB_CONTAINER_NAME;

  if (!endpoint || !key || !dbName || !containerName) {
    throw new Error("Missing Cosmos DB environment variables");
  }

  const client = new CosmosClient({ endpoint, key });
  const database = client.database(dbName);
  return database.container(containerName);
}

// ======================= GET =======================
export async function GET(request: NextRequest) {
  try {
    const container = getContainer();
    const { searchParams } = new URL(request.url);

    const year = searchParams.get("year");
    const type = searchParams.get("type");
    const month = searchParams.get("month");
    const city = searchParams.get("city");

    let query = "SELECT * FROM c";
    const parameters: any[] = [];
    const conditions: string[] = [];

    if (year) {
      conditions.push("c.year = @year");
      parameters.push({ name: "@year", value: parseInt(year) });
    }
    if (type) {
      conditions.push("c.charging_station_type = @type");
      parameters.push({ name: "@type", value: type });
    }
    if (month) {
      conditions.push("c.month = @month");
      parameters.push({ name: "@month", value: month });
    }
    if (city) {
      conditions.push("c.city = @city");
      parameters.push({ name: "@city", value: city });
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }
    query += " ORDER BY c.charging_station";

    const { resources: items } = await container.items
      .query({ query, parameters })
      .fetchAll();

    return NextResponse.json({
      success: true,
      data: items,
      count: items.length,
    });
  } catch (error) {
    console.error("Error fetching charging stations:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch charging stations",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// ======================= POST =======================
export async function POST(request: NextRequest) {
  try {
    const container = getContainer();
    const body = await request.json();

    const requiredFields = [
      "charging_station",
      "latitude",
      "longitude",
      "installation_year",
      "year",
      "month",
      "power_kw",
      "charging_station_type",
      "monthly_consumption_kwh",
    ];

    for (const field of requiredFields) {
      if (!(field in body)) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    if (!body.id) {
      body.id = `station_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 9)}`;
    }

    const { resource: createdItem } = await container.items.create(body);
    return NextResponse.json({ success: true, data: createdItem }, { status: 201 });
  } catch (error) {
    console.error("Error creating charging station:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create charging station",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// ======================= DELETE =======================
export async function DELETE(request: NextRequest) {
  try {
    const container = getContainer();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing required parameter: id" },
        { status: 400 }
      );
    }

    const querySpec = {
      query: "SELECT c.id, c.charging_station FROM c WHERE c.id = @id",
      parameters: [{ name: "@id", value: id }],
    };

    const { resources: items } = await container.items.query(querySpec).fetchAll();

    if (items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Charging station not found" },
        { status: 404 }
      );
    }

    const item = items[0];
    await container.item(id, item.charging_station).delete();

    return NextResponse.json({
      success: true,
      message: "Charging station deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting charging station:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete charging station",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
