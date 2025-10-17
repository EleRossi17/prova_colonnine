import { CosmosClient } from "@azure/cosmos";
import { NextRequest, NextResponse } from "next/server";

// Initialize Cosmos DB client
const cosmosClient = new CosmosClient({
  endpoint: process.env.COSMOS_DB_ENDPOINT!,
  key: process.env.COSMOS_KEY_CHARGING_STATION!,
});

const database = cosmosClient.database(process.env.COSMOS_DB_DATABASE_NAME!);
const container = database.container(process.env.COSMOS_DB_CONTAINER_NAME!);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get("year");
    const type = searchParams.get("type");
    const month = searchParams.get("month");
    const city = searchParams.get("city");

    // Build query with optional filters
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
      .query({
        query,
        parameters,
      })
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
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

    // Generate a unique ID if not provided
    if (!body.id) {
      body.id = `station_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
    }

    // Create the item
    const { resource: createdItem } = await container.items.create(body);

    return NextResponse.json(
      {
        success: true,
        data: createdItem,
      },
      { status: 201 }
    );
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

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing required parameter: id" },
        { status: 400 }
      );
    }

    console.log(`Attempting to delete charging station with id: ${id}`);

    // First, find the item to get its partition key value (charging_station)
    const querySpec = {
      query: "SELECT c.id, c.charging_station FROM c WHERE c.id = @id",
      parameters: [{ name: "@id", value: id }],
    };

    const { resources: items } = await container.items
      .query(querySpec)
      .fetchAll();

    if (items.length === 0) {
      console.log(`No charging station found with id: ${id}`);
      return NextResponse.json(
        {
          success: false,
          error: "Charging station not found",
        },
        { status: 404 }
      );
    }

    const item = items[0];
    const partitionKey = item.charging_station; // This is the partition key value

    console.log(`Deleting item with id: ${id}, partition key: ${partitionKey}`);

    // Delete using id and partition key
    await container.item(id, partitionKey).delete();

    console.log("✅ Successfully deleted charging station");

    return NextResponse.json({
      success: true,
      message: "Charging station deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting charging station:", error);

    let errorMessage = "Failed to delete charging station";
    let statusCode = 500;

    if (error instanceof Error) {
      if (error.message.includes("NotFound") || error.message.includes("404")) {
        errorMessage = "Charging station not found";
        statusCode = 404;
      } else if (
        error.message.includes("Forbidden") ||
        error.message.includes("403")
      ) {
        errorMessage = "Permission denied - check database permissions";
        statusCode = 403;
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: statusCode }
    );
  }
}
