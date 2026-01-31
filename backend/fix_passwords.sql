-- ============================================
-- QUICKPICK - FIX PASSWORDS
-- ============================================

-- The seed data had 'hashed_password' as plain text.
-- But the app expects a SHA256 hash.
-- This script updates the test users to have the hash for the password: "password"
-- SHA256("password") = 5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8

UPDATE users
SET password_hash = '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8'
WHERE phone IN ('9876543210', '9999999991', '9999999992', '9800000001', '9800000002');

PRINT 'Passwords updated. You can now login with password: "password"';
