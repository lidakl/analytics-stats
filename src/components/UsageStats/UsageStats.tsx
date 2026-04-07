"use client";

import React, { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import styles from "./UsageStats.module.css";

import { UsageStatsResponse } from "@/types/usage";

export const UsageStats = () => {
  const [data, setData] = useState<UsageStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/usage/stats?days=7")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      // eslint-disable-next-line no-console
      .catch((err) => console.error("UI Load Error:", err));
  }, []);

  if (loading)
    return <div className={styles.loading}>Анализируем использование...</div>;
  if (!data) return <div>Ошибка загрузки данных</div>;

  // Данные для прогресс-бара (сегодняшний день — последний в массиве)
  const today = data.days[data.days.length - 1];
  const progressPercent = Math.min(
    (today.committed / data.dailyLimit) * 100,
    100,
  );

  return (
    <div className={styles.container}>
      <h2>Статистика использования ({data.plan})</h2>

      <div className={styles.summaryGrid}>
        <div className={styles.card}>
          <span className={styles.label}>Всего подтверждено</span>
          <div className={styles.value}>{data.summary.totalCommitted}</div>
        </div>
        <div className={styles.card}>
          <span className={styles.label}>Среднее в день</span>
          <div className={styles.value}>{data.summary.avgDaily}</div>
        </div>
        <div className={styles.card}>
          <span className={styles.label}>Стрейк (дней)</span>
          <div className={styles.value}>{data.summary.currentStreak} 🔥</div>
        </div>
      </div>

      <div className={styles.chartBox}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.days}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#eee"
            />
            <XAxis
              dataKey="date"
              tickFormatter={(val) => val.split("-").slice(2).join("/")}
              fontSize={12}
            />
            <YAxis fontSize={12} />
            <Tooltip cursor={{ fill: "#f5f5f5" }} />
            <Bar dataKey="committed" fill="#0070f3" name="Подтверждено" />
            <Bar dataKey="reserved" fill="#ff9800" name="В резерве" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className={styles.progressWrapper}>
        <div className={styles.progressLabel}>
          <span>Сегодняшний лимит</span>
          <span>
            {today.committed} / {data.dailyLimit}
          </span>
        </div>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};
