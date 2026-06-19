-- CreateTable
CREATE TABLE "site_traffic_sessions" (
    "id" TEXT NOT NULL,
    "visitor_id" TEXT NOT NULL,
    "first_seen_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_seen_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_path" TEXT,
    "landing_path" TEXT,
    "referrer" TEXT,
    "referrer_host" TEXT,
    "source_type" TEXT NOT NULL,
    "utm_source" TEXT,
    "utm_medium" TEXT,
    "utm_campaign" TEXT,

    CONSTRAINT "site_traffic_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "site_traffic_sessions_last_seen_at_idx" ON "site_traffic_sessions"("last_seen_at");

-- CreateIndex
CREATE INDEX "site_traffic_sessions_first_seen_at_idx" ON "site_traffic_sessions"("first_seen_at");

-- CreateIndex
CREATE INDEX "site_traffic_sessions_source_type_idx" ON "site_traffic_sessions"("source_type");

-- CreateIndex
CREATE INDEX "site_traffic_sessions_referrer_host_idx" ON "site_traffic_sessions"("referrer_host");
