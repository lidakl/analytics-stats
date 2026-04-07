-- CreateTable
CREATE TABLE "users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "plan_tier" TEXT NOT NULL DEFAULT 'starter',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "daily_usage_events" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "date_key" TEXT NOT NULL,
    "request_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "reserved_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "committed_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "daily_usage_cache" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "date_key" TEXT NOT NULL,
    "committed_count" INTEGER NOT NULL DEFAULT 0,
    "last_updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "daily_usage_events_user_id_date_key_idx" ON "daily_usage_events"("user_id", "date_key");

-- CreateIndex
CREATE INDEX "daily_usage_cache_user_id_idx" ON "daily_usage_cache"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "daily_usage_cache_user_id_date_key_key" ON "daily_usage_cache"("user_id", "date_key");
