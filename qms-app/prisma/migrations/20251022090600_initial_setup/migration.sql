-- CreateTable
CREATE TABLE "quilts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "item_number" INTEGER NOT NULL,
    "group_id" INTEGER,
    "name" TEXT NOT NULL,
    "season" TEXT NOT NULL,
    "length_cm" INTEGER NOT NULL,
    "width_cm" INTEGER NOT NULL,
    "weight_grams" INTEGER NOT NULL,
    "fill_material" TEXT NOT NULL,
    "material_details" TEXT,
    "color" TEXT NOT NULL,
    "brand" TEXT,
    "purchase_date" DATETIME,
    "location" TEXT NOT NULL,
    "packaging_info" TEXT,
    "current_status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "notes" TEXT,
    "image_url" TEXT,
    "thumbnail_url" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "usage_periods" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "quilt_id" TEXT NOT NULL,
    "start_date" DATETIME NOT NULL,
    "end_date" DATETIME,
    "season_used" TEXT,
    "usage_type" TEXT NOT NULL DEFAULT 'REGULAR',
    "notes" TEXT,
    "duration_days" INTEGER,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "usage_periods_quilt_id_fkey" FOREIGN KEY ("quilt_id") REFERENCES "quilts" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "current_usage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "quilt_id" TEXT NOT NULL,
    "started_at" DATETIME NOT NULL,
    "expected_end_date" DATETIME,
    "usage_type" TEXT NOT NULL DEFAULT 'REGULAR',
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "current_usage_quilt_id_fkey" FOREIGN KEY ("quilt_id") REFERENCES "quilts" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "seasonal_recommendations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "season" TEXT NOT NULL,
    "min_weight" INTEGER NOT NULL,
    "max_weight" INTEGER NOT NULL,
    "recommended_materials" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "maintenance_records" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "quilt_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "performed_at" DATETIME NOT NULL,
    "cost" REAL,
    "next_due_date" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "maintenance_records_quilt_id_fkey" FOREIGN KEY ("quilt_id") REFERENCES "quilts" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "hashed_password" TEXT,
    "preferences" JSONB,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "system_settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "usage_analytics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "total_quilts_in_use" INTEGER NOT NULL,
    "total_quilts_available" INTEGER NOT NULL,
    "new_usage_started" INTEGER NOT NULL,
    "usage_ended" INTEGER NOT NULL,
    "winter_quilts_active" INTEGER NOT NULL,
    "spring_autumn_active" INTEGER NOT NULL,
    "summer_quilts_active" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "quilts_item_number_key" ON "quilts"("item_number");

-- CreateIndex
CREATE INDEX "quilts_season_idx" ON "quilts"("season");

-- CreateIndex
CREATE INDEX "quilts_current_status_idx" ON "quilts"("current_status");

-- CreateIndex
CREATE INDEX "quilts_location_idx" ON "quilts"("location");

-- CreateIndex
CREATE INDEX "quilts_brand_idx" ON "quilts"("brand");

-- CreateIndex
CREATE INDEX "quilts_weight_grams_idx" ON "quilts"("weight_grams");

-- CreateIndex
CREATE INDEX "quilts_created_at_idx" ON "quilts"("created_at");

-- CreateIndex
CREATE INDEX "quilts_updated_at_idx" ON "quilts"("updated_at");

-- CreateIndex
CREATE INDEX "quilts_season_current_status_idx" ON "quilts"("season", "current_status");

-- CreateIndex
CREATE INDEX "quilts_current_status_location_idx" ON "quilts"("current_status", "location");

-- CreateIndex
CREATE INDEX "quilts_brand_season_idx" ON "quilts"("brand", "season");

-- CreateIndex
CREATE INDEX "quilts_item_number_current_status_idx" ON "quilts"("item_number", "current_status");

-- CreateIndex
CREATE INDEX "usage_periods_quilt_id_idx" ON "usage_periods"("quilt_id");

-- CreateIndex
CREATE INDEX "usage_periods_start_date_idx" ON "usage_periods"("start_date");

-- CreateIndex
CREATE INDEX "usage_periods_end_date_idx" ON "usage_periods"("end_date");

-- CreateIndex
CREATE INDEX "usage_periods_season_used_idx" ON "usage_periods"("season_used");

-- CreateIndex
CREATE INDEX "usage_periods_usage_type_idx" ON "usage_periods"("usage_type");

-- CreateIndex
CREATE INDEX "usage_periods_created_at_idx" ON "usage_periods"("created_at");

-- CreateIndex
CREATE INDEX "usage_periods_quilt_id_start_date_idx" ON "usage_periods"("quilt_id", "start_date");

-- CreateIndex
CREATE INDEX "usage_periods_start_date_end_date_idx" ON "usage_periods"("start_date", "end_date");

-- CreateIndex
CREATE INDEX "usage_periods_season_used_usage_type_idx" ON "usage_periods"("season_used", "usage_type");

-- CreateIndex
CREATE UNIQUE INDEX "current_usage_quilt_id_key" ON "current_usage"("quilt_id");

-- CreateIndex
CREATE INDEX "seasonal_recommendations_season_idx" ON "seasonal_recommendations"("season");

-- CreateIndex
CREATE INDEX "maintenance_records_quilt_id_idx" ON "maintenance_records"("quilt_id");

-- CreateIndex
CREATE INDEX "maintenance_records_performed_at_idx" ON "maintenance_records"("performed_at");

-- CreateIndex
CREATE INDEX "maintenance_records_type_idx" ON "maintenance_records"("type");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "system_settings_key_key" ON "system_settings"("key");

-- CreateIndex
CREATE INDEX "system_settings_category_idx" ON "system_settings"("category");

-- CreateIndex
CREATE INDEX "usage_analytics_date_idx" ON "usage_analytics"("date");

-- CreateIndex
CREATE UNIQUE INDEX "usage_analytics_date_key" ON "usage_analytics"("date");
