import { NextResponse } from "next/server";
import { z } from "zod";

import { getUsageStats } from "@/services/usage.services";

const querySchema = z.object({
  days: z.coerce.number().min(1).max(90).default(7),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const parsed = querySchema.safeParse(Object.fromEntries(searchParams));

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: parsed.error.format() },
        { status: 400 },
      );
    }

    const stats = await getUsageStats(1, "starter", parsed.data.days);

    return NextResponse.json(stats);
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
