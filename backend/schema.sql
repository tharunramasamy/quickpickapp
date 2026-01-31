-- ============================================
-- QUICKPICK - ROBUST SETUP SCRIPT
-- ============================================
-- Run this entire script to reset and setup the database correctly.

-- 0. CLEANUP (Drop in reverse dependency order)
IF OBJECT_ID('order_items', 'U') IS NOT NULL DROP TABLE order_items;
IF OBJECT_ID('delivery_tracking', 'U') IS NOT NULL DROP TABLE delivery_tracking;
IF OBJECT_ID('payment_transactions', 'U') IS NOT NULL DROP TABLE payment_transactions;
IF OBJECT_ID('orders', 'U') IS NOT NULL DROP TABLE orders;
IF OBJECT_ID('customers', 'U') IS NOT NULL DROP TABLE customers;
IF OBJECT_ID('delivery_partners', 'U') IS NOT NULL DROP TABLE delivery_partners;
IF OBJECT_ID('user_profiles', 'U') IS NOT NULL DROP TABLE user_profiles;
IF OBJECT_ID('user_activity_logs', 'U') IS NOT NULL DROP TABLE user_activity_logs;
IF OBJECT_ID('inventory_stock', 'U') IS NOT NULL DROP TABLE inventory_stock;
IF OBJECT_ID('products', 'U') IS NOT NULL DROP TABLE products;
IF OBJECT_ID('product_categories', 'U') IS NOT NULL DROP TABLE product_categories;

-- Users references cities/locations, so drop users first
IF OBJECT_ID('users', 'U') IS NOT NULL DROP TABLE users;
IF OBJECT_ID('inventory_locations', 'U') IS NOT NULL DROP TABLE inventory_locations;
IF OBJECT_ID('cities', 'U') IS NOT NULL DROP TABLE cities;

-- ============================================
-- 1. CREATE TABLES
-- ============================================

-- 1. CITIES TABLE
CREATE TABLE cities (
    city_id INT PRIMARY KEY IDENTITY(1,1),
    city_name NVARCHAR(100) NOT NULL UNIQUE,
    state NVARCHAR(50),
    is_active BIT DEFAULT 1,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);

-- 2. INVENTORY LOCATIONS (Dark Stores)
CREATE TABLE inventory_locations (
    location_id INT PRIMARY KEY IDENTITY(1,1),
    city_id INT NOT NULL,
    location_name NVARCHAR(200) NOT NULL,
    address NVARCHAR(500),
    latitude FLOAT,
    longitude FLOAT,
    capacity INT DEFAULT 10000,
    is_active BIT DEFAULT 1,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (city_id) REFERENCES cities(city_id)
);

-- 3. PRODUCT CATEGORIES
CREATE TABLE product_categories (
    category_id INT PRIMARY KEY IDENTITY(1,1),
    category_name NVARCHAR(100) NOT NULL UNIQUE,
    description NVARCHAR(500),
    is_active BIT DEFAULT 1
);

-- 4. PRODUCTS
CREATE TABLE products (
    product_id NVARCHAR(20) PRIMARY KEY,
    product_name NVARCHAR(200) NOT NULL,
    category_id INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    unit NVARCHAR(20),
    description NVARCHAR(500),
    image_url NVARCHAR(500) NULL,
    sku NVARCHAR(50) UNIQUE,
    is_active BIT DEFAULT 1,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (category_id) REFERENCES product_categories(category_id)
);

-- 5. INVENTORY STOCK (Per Location)
CREATE TABLE inventory_stock (
    stock_id INT PRIMARY KEY IDENTITY(1,1),
    product_id NVARCHAR(20) NOT NULL,
    location_id INT NOT NULL,
    quantity_available INT DEFAULT 0,
    quantity_reserved INT DEFAULT 0,
    reorder_level INT DEFAULT 10,
    last_updated DATETIME DEFAULT GETDATE(),
    updated_by NVARCHAR(100),
    FOREIGN KEY (product_id) REFERENCES products(product_id),
    FOREIGN KEY (location_id) REFERENCES inventory_locations(location_id),
    UNIQUE (product_id, location_id)
);

-- 6. USERS (All Users)
CREATE TABLE users (
    user_id NVARCHAR(50) PRIMARY KEY,
    email NVARCHAR(100) UNIQUE,
    phone NVARCHAR(20) UNIQUE,
    password_hash NVARCHAR(500) NOT NULL,
    role NVARCHAR(50) NOT NULL, -- CUSTOMER, INVENTORY_STAFF, DELIVERY_PARTNER, ADMIN
    city_id INT NULL,
    location_id INT NULL, -- For inventory staff
    is_active BIT DEFAULT 1,
    last_login DATETIME NULL,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (city_id) REFERENCES cities(city_id),
    FOREIGN KEY (location_id) REFERENCES inventory_locations(location_id)
);

-- 7. USER PROFILES
CREATE TABLE user_profiles (
    profile_id INT PRIMARY KEY IDENTITY(1,1),
    user_id NVARCHAR(50) NOT NULL UNIQUE,
    first_name NVARCHAR(100),
    last_name NVARCHAR(100),
    gender NVARCHAR(20),
    date_of_birth DATE,
    profile_image_url NVARCHAR(500),
    address NVARCHAR(500),
    city NVARCHAR(100),
    pincode NVARCHAR(20),
    is_verified BIT DEFAULT 0,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- 8. CUSTOMERS (Customer-Specific Data)
CREATE TABLE customers (
    customer_id INT PRIMARY KEY IDENTITY(1,1),
    user_id NVARCHAR(50) NOT NULL UNIQUE,
    total_orders INT DEFAULT 0,
    total_spent DECIMAL(12, 2) DEFAULT 0,
    default_address NVARCHAR(500),
    delivery_addresses NVARCHAR(MAX), -- JSON array of addresses
    preferred_payment_method NVARCHAR(50),
    referral_code NVARCHAR(50),
    loyalty_points INT DEFAULT 0,
    is_subscribed_to_notifications BIT DEFAULT 1,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- 9. DELIVERY PARTNERS
CREATE TABLE delivery_partners (
    partner_id INT PRIMARY KEY IDENTITY(1,1),
    user_id NVARCHAR(50) NOT NULL UNIQUE,
    license_number NVARCHAR(50),
    license_expiry DATE,
    vehicle_type NVARCHAR(50),
    vehicle_number NVARCHAR(50),
    total_deliveries INT DEFAULT 0,
    completed_deliveries INT DEFAULT 0,
    cancelled_deliveries INT DEFAULT 0,
    average_rating DECIMAL(3, 2) DEFAULT 0,
    total_ratings INT DEFAULT 0,
    status NVARCHAR(50) DEFAULT 'INACTIVE', -- ACTIVE, INACTIVE, ON_DUTY, OFF_DUTY
    current_location_latitude FLOAT NULL,
    current_location_longitude FLOAT NULL,
    last_location_update DATETIME NULL,
    is_verified BIT DEFAULT 0,
    is_available BIT DEFAULT 1,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- 10. ORDERS
CREATE TABLE orders (
    order_id NVARCHAR(50) PRIMARY KEY,
    customer_id INT NOT NULL,
    location_id INT NOT NULL, -- Dark store location
    delivery_partner_id INT NULL,
    order_date DATETIME DEFAULT GETDATE(),
    status NVARCHAR(50) DEFAULT 'PLACED', -- PLACED, CONFIRMED, PICKED, OUT_FOR_DELIVERY, DELIVERED, CANCELLED
    total_amount DECIMAL(12, 2) NOT NULL,
    delivery_fee DECIMAL(10, 2) DEFAULT 0,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    payment_method NVARCHAR(50),
    payment_status NVARCHAR(50) DEFAULT 'PENDING', -- PENDING, SUCCESS, FAILED
    delivery_address NVARCHAR(500),
    delivery_latitude FLOAT NULL,
    delivery_longitude FLOAT NULL,
    estimated_delivery_time DATETIME NULL,
    actual_delivery_time DATETIME NULL,
    customer_notes NVARCHAR(500),
    cancellation_reason NVARCHAR(500) NULL,
    cancelled_at DATETIME NULL,
    picked_at DATETIME NULL,
    out_for_delivery_at DATETIME NULL,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
    FOREIGN KEY (location_id) REFERENCES inventory_locations(location_id),
    FOREIGN KEY (delivery_partner_id) REFERENCES delivery_partners(partner_id)
);

-- 11. ORDER ITEMS
CREATE TABLE order_items (
    item_id INT PRIMARY KEY IDENTITY(1,1),
    order_id NVARCHAR(50) NOT NULL,
    product_id NVARCHAR(20) NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(12, 2) NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

-- 12. PAYMENT TRANSACTIONS (Stripe)
CREATE TABLE payment_transactions (
    transaction_id NVARCHAR(100) PRIMARY KEY,
    order_id NVARCHAR(50) NOT NULL UNIQUE,
    user_id NVARCHAR(50) NOT NULL,
    stripe_payment_intent_id NVARCHAR(500),
    amount DECIMAL(12, 2) NOT NULL,
    currency NVARCHAR(5) DEFAULT 'INR',
    status NVARCHAR(50) DEFAULT 'PENDING', -- PENDING, SUCCESS, FAILED
    payment_method NVARCHAR(50),
    card_last_four NVARCHAR(4),
    error_message NVARCHAR(500) NULL,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- 13. DELIVERY TRACKING (Real-time)
CREATE TABLE delivery_tracking (
    tracking_id INT PRIMARY KEY IDENTITY(1,1),
    order_id NVARCHAR(50) NOT NULL,
    delivery_partner_id INT,
    status NVARCHAR(50), -- PLACED, CONFIRMED, PICKED, OUT_FOR_DELIVERY, DELIVERED, CANCELLED
    latitude FLOAT,
    longitude FLOAT,
    notes NVARCHAR(500),
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (delivery_partner_id) REFERENCES delivery_partners(partner_id)
);

-- 14. USER ACTIVITY LOGS
CREATE TABLE user_activity_logs (
    log_id INT PRIMARY KEY IDENTITY(1,1),
    user_id NVARCHAR(50) NOT NULL,
    activity_type NVARCHAR(50), -- LOGIN, LOGOUT, ORDER_PLACED, ORDER_DELIVERED, INVENTORY_UPDATED, etc.
    details NVARCHAR(MAX),
    ip_address NVARCHAR(50),
    user_agent NVARCHAR(500),
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- ============================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_city ON users(city_id);

-- Orders indexes
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_date ON orders(order_date);
CREATE INDEX idx_orders_delivery_partner ON orders(delivery_partner_id);
CREATE INDEX idx_orders_location ON orders(location_id);

-- Inventory indexes
CREATE INDEX idx_inventory_product ON inventory_stock(product_id);
CREATE INDEX idx_inventory_location ON inventory_stock(location_id);

-- Product indexes
CREATE INDEX idx_products_category ON products(category_id);

-- Activity log indexes
CREATE INDEX idx_activity_user ON user_activity_logs(user_id);
CREATE INDEX idx_activity_date ON user_activity_logs(created_at);

-- Referral Code Unique Index (Filtered to allow multiple NULLs)
CREATE UNIQUE INDEX UQ_customers_referral_code ON customers(referral_code) WHERE referral_code IS NOT NULL;

-- ============================================
-- INSERT SAMPLE DATA
-- ============================================

-- CITIES (Tier 1)
INSERT INTO cities (city_name, state) VALUES
('Delhi NCR', 'Delhi'),
('Mumbai', 'Maharashtra'),
('Bangalore', 'Karnataka'),
('Hyderabad', 'Telangana'),
('Pune', 'Maharashtra'),
('Chennai', 'Tamil Nadu'),
('Kolkata', 'West Bengal'),
('Ahmedabad', 'Gujarat');

-- INVENTORY LOCATIONS (Dark Stores)
INSERT INTO inventory_locations (city_id, location_name, address) VALUES
(1, 'Delhi - Sector 5', '123 Main St, Delhi'),
(1, 'Delhi - Connaught Place', '456 CP, Delhi'),
(2, 'Mumbai - Bandra', '789 Bandra Rd, Mumbai'),
(3, 'Bangalore - Indiranagar', '321 ITR, Bangalore'),
(4, 'Hyderabad - Jubilee Hills', '654 JH, Hyderabad'),
(5, 'Pune - Koregaon Park', '987 KP, Pune');

-- PRODUCT CATEGORIES
INSERT INTO product_categories (category_name, description) VALUES
('Fruits', 'Fresh fruits and dry fruits'),
('Vegetables', 'Fresh vegetables'),
('Dairy', 'Milk, cheese, and dairy products'),
('Bakery', 'Bread, cakes, and bakery items'),
('Snacks', 'Chips, biscuits, and snacks'),
('Beverages', 'Coffee, tea, and drinks'),
('Pantry', 'Rice, flour, and pantry staples'),
('Frozen', 'Frozen foods and ice cream'),
('Personal Care', 'Soaps, shampoos, and personal care'),
('Cleaning', 'Detergents, cleaners, and supplies');

-- PRODUCTS (100+ items)
INSERT INTO products (product_id, product_name, category_id, price, unit, sku) VALUES
-- Fruits (10)
('PROD_001', 'Bananas', 1, 30, 'kg', 'FRT_001'),
('PROD_002', 'Apples', 1, 80, 'kg', 'FRT_002'),
('PROD_003', 'Oranges', 1, 50, 'kg', 'FRT_003'),
('PROD_004', 'Mangoes', 1, 100, 'kg', 'FRT_004'),
('PROD_005', 'Grapes', 1, 120, 'kg', 'FRT_005'),
('PROD_006', 'Papaya', 1, 40, 'kg', 'FRT_006'),
('PROD_007', 'Watermelon', 1, 60, 'kg', 'FRT_007'),
('PROD_008', 'Strawberries', 1, 200, 'pack', 'FRT_008'),
('PROD_009', 'Pineapple', 1, 90, 'kg', 'FRT_009'),
('PROD_010', 'Kiwi', 1, 150, 'kg', 'FRT_010'),

-- Vegetables (10)
('PROD_011', 'Tomatoes', 2, 25, 'kg', 'VEG_001'),
('PROD_012', 'Onions', 2, 20, 'kg', 'VEG_002'),
('PROD_013', 'Potatoes', 2, 15, 'kg', 'VEG_003'),
('PROD_014', 'Carrots', 2, 30, 'kg', 'VEG_004'),
('PROD_015', 'Cabbage', 2, 25, 'kg', 'VEG_005'),
('PROD_016', 'Cauliflower', 2, 40, 'kg', 'VEG_006'),
('PROD_017', 'Spinach', 2, 35, 'bunch', 'VEG_007'),
('PROD_018', 'Cucumber', 2, 20, 'kg', 'VEG_008'),
('PROD_019', 'Bell Peppers', 2, 50, 'kg', 'VEG_009'),
('PROD_020', 'Broccoli', 2, 60, 'kg', 'VEG_010'),

-- Dairy (10)
('PROD_021', 'Whole Milk', 3, 45, '1L', 'DAI_001'),
('PROD_022', 'Toned Milk', 3, 40, '1L', 'DAI_002'),
('PROD_023', 'Curd', 3, 50, 'kg', 'DAI_003'),
('PROD_024', 'Paneer', 3, 250, 'kg', 'DAI_004'),
('PROD_025', 'Butter', 3, 400, 'kg', 'DAI_005'),
('PROD_026', 'Cheese', 3, 300, 'kg', 'DAI_006'),
('PROD_027', 'Ghee', 3, 500, '1L', 'DAI_007'),
('PROD_028', 'Ice Cream', 3, 150, 'pint', 'DAI_008'),
('PROD_029', 'Yogurt', 3, 80, 'pack', 'DAI_009'),
('PROD_030', 'Condensed Milk', 3, 120, '397g', 'DAI_010'),

-- Bakery (10)
('PROD_031', 'Bread - White', 4, 30, 'loaf', 'BAK_001'),
('PROD_032', 'Bread - Brown', 4, 35, 'loaf', 'BAK_002'),
('PROD_033', 'Buns', 4, 50, 'pack', 'BAK_003'),
('PROD_034', 'Croissants', 4, 60, 'pack', 'BAK_004'),
('PROD_035', 'Cookies', 4, 80, 'pack', 'BAK_005'),
('PROD_036', 'Cakes', 4, 200, 'piece', 'BAK_006'),
('PROD_037', 'Biscuits', 4, 40, 'pack', 'BAK_007'),
('PROD_038', 'Pastries', 4, 100, 'pack', 'BAK_008'),
('PROD_039', 'Donuts', 4, 70, 'pack', 'BAK_009'),
('PROD_040', 'Muffins', 4, 90, 'pack', 'BAK_010'),

-- Snacks (15)
('PROD_041', 'Lay''s Chips', 5, 20, 'pack', 'SNK_001'),
('PROD_042', 'Pringles', 5, 50, 'can', 'SNK_002'),
('PROD_043', 'Doritos', 5, 30, 'pack', 'SNK_003'),
('PROD_044', 'Chex Mix', 5, 100, 'pack', 'SNK_004'),
('PROD_045', 'Cheetos', 5, 25, 'pack', 'SNK_005'),
('PROD_046', 'Popcorn', 5, 50, 'pack', 'SNK_006'),
('PROD_047', 'Namkeen Mix', 5, 80, 'kg', 'SNK_007'),
('PROD_048', 'Bhujia', 5, 60, 'kg', 'SNK_008'),
('PROD_049', 'Chakli', 5, 70, 'kg', 'SNK_009'),
('PROD_050', 'Momos', 5, 50, 'pack', 'SNK_010'),
('PROD_051', 'Samosas', 5, 40, 'piece', 'SNK_011'),
('PROD_052', 'Pakoras', 5, 50, 'pack', 'SNK_012'),
('PROD_053', 'Mixture', 5, 90, 'kg', 'SNK_013'),
('PROD_054', 'Murukku', 5, 100, 'kg', 'SNK_014'),
('PROD_055', 'Fafda', 5, 110, 'kg', 'SNK_015'),

-- Beverages (15)
('PROD_056', 'Coca Cola', 6, 50, '600ml', 'BEV_001'),
('PROD_057', 'Sprite', 6, 50, '600ml', 'BEV_002'),
('PROD_058', 'Fanta', 6, 45, '600ml', 'BEV_003'),
('PROD_059', 'Orange Juice', 6, 80, '1L', 'BEV_004'),
('PROD_060', 'Apple Juice', 6, 80, '1L', 'BEV_005'),
('PROD_061', 'Nescafe Coffee', 6, 180, 'jar', 'BEV_006'),
('PROD_062', 'Lipton Tea', 6, 120, 'pack', 'BEV_007'),
('PROD_063', 'Green Tea', 6, 100, 'pack', 'BEV_008'),
('PROD_064', 'Energy Drink', 6, 100, '250ml', 'BEV_009'),
('PROD_065', 'Coconut Water', 6, 60, '1L', 'BEV_010'),
('PROD_066', 'Milk Tea', 6, 70, 'pack', 'BEV_011'),
('PROD_067', 'Lemon Tea', 6, 70, 'pack', 'BEV_012'),
('PROD_068', 'Ginger Tea', 6, 80, 'pack', 'BEV_013'),
('PROD_069', 'Turmeric Milk', 6, 90, 'pack', 'BEV_014'),
('PROD_070', 'Horlicks', 6, 150, 'jar', 'BEV_015'),

-- Pantry (20)
('PROD_071', 'Basmati Rice', 7, 80, 'kg', 'PAN_001'),
('PROD_072', 'White Rice', 7, 50, 'kg', 'PAN_002'),
('PROD_073', 'Wheat Flour', 7, 40, 'kg', 'PAN_003'),
('PROD_074', 'Corn Flour', 7, 50, 'kg', 'PAN_004'),
('PROD_075', 'Besan', 7, 60, 'kg', 'PAN_005'),
('PROD_076', 'Cooking Oil', 7, 200, '5L', 'PAN_006'),
('PROD_077', 'Ghee', 7, 600, '500ml', 'PAN_007'),
('PROD_078', 'Mustard Oil', 7, 180, '1L', 'PAN_008'),
('PROD_079', 'Coconut Oil', 7, 250, '1L', 'PAN_009'),
('PROD_080', 'Salt', 7, 20, 'kg', 'PAN_010'),
('PROD_081', 'Sugar', 7, 35, 'kg', 'PAN_011'),
('PROD_082', 'Jaggery', 7, 80, 'kg', 'PAN_012'),
('PROD_083', 'Honey', 7, 200, '500ml', 'PAN_013'),
('PROD_084', 'Spices Mix', 7, 100, 'pack', 'PAN_014'),
('PROD_085', 'Dal', 7, 120, 'kg', 'PAN_015'),
('PROD_086', 'Pasta', 7, 80, 'pack', 'PAN_016'),
('PROD_087', 'Noodles', 7, 15, 'pack', 'PAN_017'),
('PROD_088', 'Cornflakes', 7, 150, 'box', 'PAN_018'),
('PROD_089', 'Oats', 7, 120, 'kg', 'PAN_019'),
('PROD_090', 'Jam', 7, 100, 'jar', 'PAN_020'),

-- Frozen (8)
('PROD_091', 'Frozen Peas', 8, 50, 'pack', 'FRZ_001'),
('PROD_092', 'Frozen Vegetables', 8, 80, 'pack', 'FRZ_002'),
('PROD_093', 'Frozen Chicken', 8, 250, 'kg', 'FRZ_003'),
('PROD_094', 'Frozen Fish', 8, 300, 'kg', 'FRZ_004'),
('PROD_095', 'Frozen Pizza', 8, 200, 'piece', 'FRZ_005'),
('PROD_096', 'Ice Cream', 8, 150, 'pint', 'FRZ_006'),
('PROD_097', 'Frozen Momos', 8, 100, 'pack', 'FRZ_007'),
('PROD_098', 'Frozen Samosa', 8, 80, 'pack', 'FRZ_008'),

-- Personal Care (10)
('PROD_099', 'Dove Soap', 9, 40, 'piece', 'PER_001'),
('PROD_100', 'Lifebuoy Soap', 9, 30, 'piece', 'PER_002'),
('PROD_101', 'Head & Shoulders', 9, 150, 'bottle', 'PER_003'),
('PROD_102', 'Colgate Toothpaste', 9, 60, 'tube', 'PER_004'),
('PROD_103', 'Gillette Razor', 9, 150, 'pack', 'PER_005'),
('PROD_104', 'Deodorant', 9, 200, 'spray', 'PER_006'),
('PROD_105', 'Face Wash', 9, 120, 'tube', 'PER_007'),
('PROD_106', 'Body Lotion', 9, 180, 'bottle', 'PER_008'),
('PROD_107', 'Sunscreen', 9, 200, 'tube', 'PER_009'),
('PROD_108', 'Lip Balm', 9, 50, 'stick', 'PER_010'),

-- Cleaning (12)
('PROD_109', 'Surf Excel', 9, 250, 'kg', 'CLN_001'),
('PROD_110', 'Rin Detergent', 9, 200, 'kg', 'CLN_002'),
('PROD_111', 'Dettol', 9, 180, 'bottle', 'CLN_003'),
('PROD_112', 'Savlon', 9, 150, 'bottle', 'CLN_004'),
('PROD_113', 'Dish Wash Gel', 9, 80, 'bottle', 'CLN_005'),
('PROD_114', 'Floor Cleaner', 9, 120, 'bottle', 'CLN_006'),
('PROD_115', 'Glass Cleaner', 9, 100, 'bottle', 'CLN_007'),
('PROD_116', 'Air Freshener', 9, 150, 'spray', 'CLN_008'),
('PROD_117', 'Toilet Cleaner', 9, 130, 'bottle', 'CLN_009'),
('PROD_118', 'Toilet Paper', 9, 200, 'pack', 'CLN_010'),
('PROD_119', 'Tissue Paper', 9, 100, 'pack', 'CLN_011'),
('PROD_120', 'Trash Bags', 9, 150, 'pack', 'CLN_012');

-- INVENTORY STOCK (Products per Location - Pre-load with quantities)
INSERT INTO inventory_stock (product_id, location_id, quantity_available, quantity_reserved, reorder_level, updated_by)
SELECT p.product_id, l.location_id, 50, 0, 10, 'SYSTEM'
FROM products p
CROSS JOIN inventory_locations l;

-- USERS
DECLARE @customer_user_id NVARCHAR(50) = 'CUST_' + CAST(ABS(CHECKSUM(NEWID())) % 100000 AS NVARCHAR(20));
DECLARE @admin_user_id NVARCHAR(50) = 'ADMIN_001';
DECLARE @inv_staff_id_1 NVARCHAR(50) = 'INV_001';
DECLARE @inv_staff_id_2 NVARCHAR(50) = 'INV_002';
DECLARE @deliv_1 NVARCHAR(50) = 'DELIV_001';
DECLARE @deliv_2 NVARCHAR(50) = 'DELIV_002';
DECLARE @deliv_3 NVARCHAR(50) = 'DELIV_003';
DECLARE @deliv_4 NVARCHAR(50) = 'DELIV_004';
DECLARE @deliv_5 NVARCHAR(50) = 'DELIV_005';
DECLARE @deliv_6 NVARCHAR(50) = 'DELIV_006';
DECLARE @deliv_7 NVARCHAR(50) = 'DELIV_007';
DECLARE @deliv_8 NVARCHAR(50) = 'DELIV_008';
DECLARE @deliv_9 NVARCHAR(50) = 'DELIV_009';
DECLARE @deliv_10 NVARCHAR(50) = 'DELIV_010';

INSERT INTO users (user_id, email, phone, password_hash, role, city_id, location_id) VALUES
(@admin_user_id, 'admin@quickpick.com', '9999999999', 'hashed_password', 'ADMIN', 1, NULL),
(@inv_staff_id_1, 'inventory.delhi@quickpick.com', '9999999991', 'hashed_password', 'INVENTORY_STAFF', 1, 1),
(@inv_staff_id_2, 'inventory.mumbai@quickpick.com', '9999999992', 'hashed_password', 'INVENTORY_STAFF', 2, 3),
(@deliv_1, 'delivery1@quickpick.com', '9800000001', 'hashed_password', 'DELIVERY_PARTNER', 1, 1),
(@deliv_2, 'delivery2@quickpick.com', '9800000002', 'hashed_password', 'DELIVERY_PARTNER', 1, 1),
(@deliv_3, 'delivery3@quickpick.com', '9800000003', 'hashed_password', 'DELIVERY_PARTNER', 1, 2),
(@deliv_4, 'delivery4@quickpick.com', '9800000004', 'hashed_password', 'DELIVERY_PARTNER', 2, 3),
(@deliv_5, 'delivery5@quickpick.com', '9800000005', 'hashed_password', 'DELIVERY_PARTNER', 2, 3),
(@deliv_6, 'delivery6@quickpick.com', '9800000006', 'hashed_password', 'DELIVERY_PARTNER', 3, 4),
(@deliv_7, 'delivery7@quickpick.com', '9800000007', 'hashed_password', 'DELIVERY_PARTNER', 4, 5),
(@deliv_8, 'delivery8@quickpick.com', '9800000008', 'hashed_password', 'DELIVERY_PARTNER', 5, 6),
(@deliv_9, 'delivery9@quickpick.com', '9800000009', 'hashed_password', 'DELIVERY_PARTNER', 1, 1),
(@deliv_10, 'delivery10@quickpick.com', '9800000010', 'hashed_password', 'DELIVERY_PARTNER', 2, 3);

-- Add test customer
INSERT INTO users (user_id, email, phone, password_hash, role, city_id, location_id) 
VALUES ('CUST_TEST_001', 'customer@example.com', '9876543210', 'hashed_password', 'CUSTOMER', 1, NULL);

-- DELIVERY PARTNERS
INSERT INTO delivery_partners (user_id, license_number, vehicle_type, status, is_available) VALUES
('DELIV_001', 'DL0001', 'TWO_WHEELER', 'ACTIVE', 1),
('DELIV_002', 'DL0002', 'TWO_WHEELER', 'ACTIVE', 1),
('DELIV_003', 'DL0003', 'TWO_WHEELER', 'ACTIVE', 1),
('DELIV_004', 'DL0004', 'TWO_WHEELER', 'ACTIVE', 1),
('DELIV_005', 'DL0005', 'TWO_WHEELER', 'ACTIVE', 1),
('DELIV_006', 'DL0006', 'TWO_WHEELER', 'ACTIVE', 1),
('DELIV_007', 'DL0007', 'TWO_WHEELER', 'ACTIVE', 1),
('DELIV_008', 'DL0008', 'TWO_WHEELER', 'ACTIVE', 1),
('DELIV_009', 'DL0009', 'TWO_WHEELER', 'ACTIVE', 1),
('DELIV_010', 'DL0010', 'TWO_WHEELER', 'ACTIVE', 1);

-- CUSTOMERS
INSERT INTO customers (user_id, referral_code) VALUES ('CUST_TEST_001', 'REF_TEST_001');

-- USER PROFILES
INSERT INTO user_profiles (user_id, first_name, last_name, address, city, pincode, is_verified) VALUES
('CUST_TEST_001', 'John', 'Doe', '123 Test Street', 'Delhi', '110001', 1),
('DELIV_001', 'Delivery', 'Partner1', '456 Delivery St', 'Delhi', '110002', 1),
('DELIV_002', 'Delivery', 'Partner2', '789 Rider Rd', 'Delhi', '110003', 1),
('DELIV_003', 'Delivery', 'Partner3', '321 Speed Ave', 'Delhi', '110004', 1),
('DELIV_004', 'Delivery', 'Partner4', '654 Express Way', 'Mumbai', '400001', 1),
('DELIV_005', 'Delivery', 'Partner5', '987 Fast Lane', 'Mumbai', '400002', 1),
('DELIV_006', 'Delivery', 'Partner6', '111 Quick St', 'Bangalore', '560001', 1),
('DELIV_007', 'Delivery', 'Partner7', '222 Swift Rd', 'Hyderabad', '500001', 1),
('DELIV_008', 'Delivery', 'Partner8', '333 Rush Ave', 'Pune', '411001', 1),
('DELIV_009', 'Delivery', 'Partner9', '444 Dash Way', 'Delhi', '110005', 1),
('DELIV_010', 'Delivery', 'Partner10', '555 Go Lane', 'Mumbai', '400003', 1);

-- Print confirmation
SELECT 'Database setup completed successfully!' AS Status,
       (SELECT COUNT(*) FROM cities) AS Cities_Count,
       (SELECT COUNT(*) FROM inventory_locations) AS Locations_Count,
       (SELECT COUNT(*) FROM products) AS Products_Count,
       (SELECT COUNT(*) FROM users) AS Users_Count,
       (SELECT COUNT(*) FROM inventory_stock) AS Stock_Records_Count;
