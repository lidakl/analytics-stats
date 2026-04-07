import dayjs from "dayjs";
import { UsageDay, UsageStatsResponse } from "../types/usage";

import { prisma } from "@/lib/prisma";

const PLAN_LIMITS: Record<string, number> = {
  starter: 30,
  pro: 100,
  executive: 500,
};

export async function getUsageStats(
  userId: number,
  userPlan: string,
  daysCount: number,
): Promise<UsageStatsResponse> {
  const limit = PLAN_LIMITS[userPlan] || 30;
  const todayStr = dayjs().format("YYYY-MM-DD");
  const startDateStr = dayjs()
    .subtract(daysCount - 1, "day")
    .format("YYYY-MM-DD");

  const expirationTime = dayjs().subtract(15, "minute").toDate();

  const [cachedData, rawEvents] = await Promise.all([
    prisma.daily_usage_cache.findMany({
      where: {
        user_id: userId,
        date_key: { gte: startDateStr },
      },
    }),
    prisma.daily_usage_events.findMany({
      where: {
        user_id: userId,
        created_at: { gte: dayjs(startDateStr).startOf("day").toDate() },
        OR: [
          { status: "committed" },
          { status: "reserved", created_at: { gte: expirationTime } },
        ],
      },
    }),
  ]);

  const statsMap = new Map<string, { committed: number; reserved: number }>();

  for (let i = 0; i < daysCount; i++) {
    const dateStr = dayjs().subtract(i, "day").format("YYYY-MM-DD");
    statsMap.set(dateStr, { committed: 0, reserved: 0 });
  }

  cachedData.forEach((cache) => {
    if (statsMap.has(cache.date_key)) {
      statsMap.get(cache.date_key)!.committed = cache.committed_count;
    }
  });

  rawEvents.forEach((event) => {
    const day = statsMap.get(event.date_key);

    if (day) {
      if (event.status === "committed") {
        day.committed++;
      } else {
        day.reserved++;
      }
    }
  });

  const days: UsageDay[] = Array.from(statsMap.entries())
    .map(([date, counts]) => ({
      date,
      committed: counts.committed,
      reserved: counts.reserved,
      limit,
      utilization: Number((counts.committed / limit).toFixed(2)),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const totalCommitted = days.reduce((acc, d) => acc + d.committed, 0);
  const peak = [...days].sort((a, b) => b.committed - a.committed)[0];

  return {
    plan: userPlan,
    dailyLimit: limit,
    period: {
      from: startDateStr,
      to: todayStr,
    },
    days,
    summary: {
      totalCommitted,
      avgDaily: Number((totalCommitted / daysCount).toFixed(1)),
      peakDay: {
        date: peak?.date || "",
        count: peak?.committed || 0,
      },
      currentStreak: calculateStreak(days),
    },
  };
}

function calculateStreak(days: UsageDay[]): number {
  let streak = 0;

  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].committed > 0) {
      streak++;
    } else {
      if (streak > 0) break;
    }
  }

  return streak;
}
