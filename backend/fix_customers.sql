-- ============================================
-- QUICKPICK - FIX CUSTOMERS TABLE
-- ============================================

-- Run this script to fix 'Invalid column name' errors for customers table
-- It adds referral_code and other customer fields if they are missing.

-- 1. Add 'referral_code' if missing
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'customers') AND name = 'referral_code')
BEGIN
    ALTER TABLE customers ADD referral_code NVARCHAR(50);
    EXEC('CREATE UNIQUE INDEX UQ_customers_referral_code ON customers(referral_code) WHERE referral_code IS NOT NULL');
    PRINT 'Fixed: Added referral_code to customers';
END

-- 2. Add 'loyalty_points' if missing
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'customers') AND name = 'loyalty_points')
BEGIN
    ALTER TABLE customers ADD loyalty_points INT DEFAULT 0;
    PRINT 'Fixed: Added loyalty_points to customers';
END

-- 3. Add 'total_orders' if missing
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'customers') AND name = 'total_orders')
BEGIN
    ALTER TABLE customers ADD total_orders INT DEFAULT 0;
    PRINT 'Fixed: Added total_orders to customers';
END

-- 4. Add 'total_spent' if missing
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'customers') AND name = 'total_spent')
BEGIN
    ALTER TABLE customers ADD total_spent DECIMAL(12, 2) DEFAULT 0;
    PRINT 'Fixed: Added total_spent to customers';
END

PRINT 'Customers table fixes applied.';
