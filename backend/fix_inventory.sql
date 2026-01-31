-- ============================================
-- QUICKPICK - INVENTORY TABLE FIX
-- ============================================

-- This script specifically targets the inventory_stock table to add missing columns
-- Run this if you are getting "Invalid column name" errors

-- 1. Add 'quantity_reserved' if missing
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'inventory_stock') AND name = 'quantity_reserved')
BEGIN
    ALTER TABLE inventory_stock ADD quantity_reserved INT DEFAULT 0;
    PRINT 'Added column: quantity_reserved';
END

-- 2. Add 'reorder_level' if missing
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'inventory_stock') AND name = 'reorder_level')
BEGIN
    ALTER TABLE inventory_stock ADD reorder_level INT DEFAULT 10;
    PRINT 'Added column: reorder_level';
END

-- 3. Add 'updated_by' if missing
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'inventory_stock') AND name = 'updated_by')
BEGIN
    ALTER TABLE inventory_stock ADD updated_by NVARCHAR(100);
    PRINT 'Added column: updated_by';
END

-- 4. Verify the table check
SELECT TOP 5 * FROM inventory_stock;
PRINT 'Inventory Fix applied successfully.';
