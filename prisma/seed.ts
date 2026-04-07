import dayjs from "dayjs";
import { PrismaClient } from "@prisma/client";

// ПУСТОЙ конструктор, никаких настроек внутри!
const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Starting seed...");

  // Очистка
  await prisma.daily_usage_events.deleteMany();
  await prisma.daily_usage_cache.deleteMany();
  await prisma.users.deleteMany();

  // Создание юзера
  const user = await prisma.users.create({
    data: {
      id: 1,
      email: "senior@fidant.ai",
      name: "Fullstack Pro",
      plan_tier: "starter",
    },
  });

  const events = [];
  const cacheEntries = [];

  // Генерируем данные за 7 дней
  for (let i = 0; i < 7; i++) {
    const dateKey = dayjs().subtract(i, "day").format("YYYY-MM-DD");
    const committedCount = Math.floor(Math.random() * 15) + 5;

    if (i !== 0) {
      // Не для сегодня
      cacheEntries.push({
        user_id: user.id,
        date_key: dateKey,
        committed_count: committedCount,
      });
    }

    for (let j = 0; j < committedCount; j++) {
      events.push({
        user_id: user.id,
        date_key: dateKey,
        request_id: `req_${Math.random().toString(36).substring(7)}`,
        status: "committed",
        created_at: dayjs(dateKey)
          .add(Math.floor(Math.random() * 20), "hour")
          .toDate(),
      });
    }
  }

  await prisma.daily_usage_cache.createMany({ data: cacheEntries });
  await prisma.daily_usage_events.createMany({ data: events });

  console.log("✅ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
