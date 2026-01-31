-- ============================================
-- QUICKPICK - FIX MISSING COLUMNS
-- ============================================

-- Run this script to fix 'Invalid column name' errors for existing tables.
-- It adds missing columns without deleting your data.

-- 1. FIX PRODUCTS TABLE
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'products') AND name = 'is_active')
BEGIN
    ALTER TABLE products ADD is_active BIT DEFAULT 1;
    PRINT 'Fixed: Added is_active to products';
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'products') AND name = 'image_url')
BEGIN
    ALTER TABLE products ADD image_url NVARCHAR(500) NULL;
    PRINT 'Fixed: Added image_url to products';
END

-- 2. FIX USERS TABLE
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'users') AND name = 'is_active')
BEGIN
    ALTER TABLE users ADD is_active BIT DEFAULT 1;
    PRINT 'Fixed: Added is_active to users';
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'users') AND name = 'city_id')
BEGIN
    ALTER TABLE users ADD city_id INT NULL;
    PRINT 'Fixed: Added city_id to users';
END

-- 3. FIX CITIES TABLE
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'cities') AND name = 'is_active')
BEGIN
    ALTER TABLE cities ADD is_active BIT DEFAULT 1;
    PRINT 'Fixed: Added is_active to cities';
END

PRINT 'All missing column fixes applied.';
