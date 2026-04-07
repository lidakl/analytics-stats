export interface UsageDay {
  date: string;
  committed: number;
  reserved: number;
  limit: number;
  utilization: number;
}

export interface UsageStatsResponse {
  plan: string;
  dailyLimit: number;
  period: {
    from: string;
    to: string;
  };
  days: UsageDay[];
  summary: {
    totalCommitted: number;
    avgDaily: number;
    peakDay: {
      date: string;
      count: number;
    };
    currentStreak: number;
  };
}
