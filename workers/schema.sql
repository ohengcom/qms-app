-- QMS Enhanced Database Schema for Cloudflare D1
-- Based on the existing SQLAlchemy models with enhanced features

-- Main quilts table with comprehensive metadata
CREATE TABLE IF NOT EXISTS quilts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id INTEGER,
    item_number INTEGER UNIQUE,
    name TEXT NOT NULL,
    season TEXT CHECK(season IN ('winter', 'spring_autumn', 'summer')),
    
    -- Physical specifications
    length_cm INTEGER,
    width_cm INTEGER,
    weight_grams INTEGER,
    
    -- Material composition
    fill_material TEXT,
    material_details TEXT,
    color TEXT,
    
    -- Brand and purchase info
    brand TEXT,
    purchase_date TEXT, -- ISO date string
    
    -- Storage and packaging
    location TEXT,
    packaging_info TEXT,
    
    -- Status and metadata
    current_status TEXT DEFAULT 'available' CHECK(current_status IN ('available', 'in_use', 'maintenance', 'storage')),
    notes TEXT,
    
    -- Timestamps
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Usage periods table for tracking historical usage
CREATE TABLE IF NOT EXISTS quilt_usage_periods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quilt_id INTEGER NOT NULL REFERENCES quilts(id) ON DELETE CASCADE,
    start_date TEXT NOT NULL, -- ISO date string
    end_date TEXT, -- NULL if currently in use
    season_used TEXT,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

-- Current usage tracking table
CREATE TABLE IF NOT EXISTS current_usage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quilt_id INTEGER UNIQUE NOT NULL REFERENCES quilts(id) ON DELETE CASCADE,
    started_at TEXT NOT NULL, -- ISO date string
    expected_end_date TEXT, -- ISO date string
    usage_type TEXT DEFAULT 'regular',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Seasonal recommendations table
CREATE TABLE IF NOT EXISTS seasonal_recommendations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    season TEXT NOT NULL CHECK(season IN ('winter', 'spring_autumn', 'summer')),
    min_weight INTEGER,
    max_weight INTEGER,
    recommended_materials TEXT, -- JSON array as text
    description TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

-- Legacy compatibility table (kept for migration purposes)
CREATE TABLE IF NOT EXISTS quilt_usage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quilt_id INTEGER NOT NULL REFERENCES quilts(id) ON DELETE CASCADE,
    used_at TEXT DEFAULT (datetime('now')),
    notes TEXT
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_quilts_group_id ON quilts(group_id);
CREATE INDEX IF NOT EXISTS idx_quilts_item_number ON quilts(item_number);
CREATE INDEX IF NOT EXISTS idx_quilts_name ON quilts(name);
CREATE INDEX IF NOT EXISTS idx_quilts_season ON quilts(season);
CREATE INDEX IF NOT EXISTS idx_quilts_weight_grams ON quilts(weight_grams);
CREATE INDEX IF NOT EXISTS idx_quilts_brand ON quilts(brand);
CREATE INDEX IF NOT EXISTS idx_quilts_location ON quilts(location);
CREATE INDEX IF NOT EXISTS idx_quilts_current_status ON quilts(current_status);
CREATE INDEX IF NOT EXISTS idx_quilts_created_at ON quilts(created_at);

CREATE INDEX IF NOT EXISTS idx_usage_periods_quilt_id ON quilt_usage_periods(quilt_id);
CREATE INDEX IF NOT EXISTS idx_usage_periods_start_date ON quilt_usage_periods(start_date);
CREATE INDEX IF NOT EXISTS idx_usage_periods_end_date ON quilt_usage_periods(end_date);

CREATE INDEX IF NOT EXISTS idx_current_usage_quilt_id ON current_usage(quilt_id);
CREATE INDEX IF NOT EXISTS idx_current_usage_started_at ON current_usage(started_at);

CREATE INDEX IF NOT EXISTS idx_seasonal_recommendations_season ON seasonal_recommendations(season);

-- Triggers to automatically update timestamps
CREATE TRIGGER IF NOT EXISTS update_quilts_updated_at
    AFTER UPDATE ON quilts
BEGIN
    UPDATE quilts SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_current_usage_updated_at
    AFTER UPDATE ON current_usage
BEGIN
    UPDATE current_usage SET updated_at = datetime('now') WHERE id = NEW.id;
END;

-- Insert default seasonal recommendations
INSERT OR IGNORE INTO seasonal_recommendations (season, min_weight, max_weight, recommended_materials, description) VALUES
('summer', 200, 800, '["cotton", "bamboo", "linen"]', 'Lightweight quilts suitable for hot weather, focusing on breathability and moisture-wicking materials.'),
('spring_autumn', 800, 1500, '["cotton", "polyester", "down alternative"]', 'Medium-weight quilts perfect for transitional seasons with moderate temperature control.'),
('winter', 1500, 3000, '["down", "wool", "thick polyester"]', 'Heavy-weight quilts designed for cold weather, providing maximum warmth and insulation.');