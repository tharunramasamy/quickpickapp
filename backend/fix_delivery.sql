-- ============================================
-- QUICKPICK - FIX DELIVERY PARTNERS TABLE
-- ============================================

-- Run this script to fix 'Invalid column name' errors for delivery_partners
-- It adds license_number and vehicle_type if they are missing.

-- 1. Add 'license_number' if missing
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'delivery_partners') AND name = 'license_number')
BEGIN
    ALTER TABLE delivery_partners ADD license_number NVARCHAR(50);
    PRINT 'Fixed: Added license_number to delivery_partners';
END

-- 2. Add 'vehicle_type' if missing
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'delivery_partners') AND name = 'vehicle_type')
BEGIN
    ALTER TABLE delivery_partners ADD vehicle_type NVARCHAR(50);
    PRINT 'Fixed: Added vehicle_type to delivery_partners';
END

-- 3. Add 'vehicle_number' if missing
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'delivery_partners') AND name = 'vehicle_number')
BEGIN
    ALTER TABLE delivery_partners ADD vehicle_number NVARCHAR(50);
    PRINT 'Fixed: Added vehicle_number to delivery_partners';
END

-- 4. Add 'is_available' if missing
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'delivery_partners') AND name = 'is_available')
BEGIN
    ALTER TABLE delivery_partners ADD is_available BIT DEFAULT 1;
    PRINT 'Fixed: Added is_available to delivery_partners';
END

PRINT 'Delivery Partners table fixes applied.';
