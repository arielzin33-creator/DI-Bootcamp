-- =============================================================================
-- 1. DATABASE SCHEMA STRUCTURE (One-to-Many Relationships)
-- =============================================================================

-- Bonus Element: Master Users Table
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL
);

-- Master Product Orders Table
CREATE TABLE product_orders (
    order_id SERIAL PRIMARY KEY,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE
    -- Enforces a One-to-Many relationship where one user can place many orders
);

-- Child Items Table 
CREATE TABLE items (
    item_id SERIAL PRIMARY KEY,
    item_name VARCHAR(150) NOT NULL,
    price NUMERIC(10, 2) NOT NULL, -- Core requirement column
    order_id INT REFERENCES product_orders(order_id) ON DELETE CASCADE
    -- Enforces a One-to-Many relationship where one order can have multiple items, 
    -- but a specific item entry can strictly map to only one order.
);


-- =============================================================================
-- 2. CUSTOM PL/pgSQL CALCULATION FUNCTIONS
-- =============================================================================

-- Function 1: Computes the aggregate total price for a given order ID
CREATE OR REPLACE FUNCTION get_order_total(target_order_id INT)
RETURNS NUMERIC(10,2) AS $$
DECLARE
    total_price NUMERIC(10,2);
BEGIN
    SELECT COALESCE(SUM(price), 0.00) INTO total_price
    FROM items
    WHERE order_id = target_order_id;
    
    RETURN total_price;
END;
$$ LANGUAGE plpgsql;


-- Bonus Function 2: Computes the aggregate total price verifying both owner and order match
CREATE OR REPLACE FUNCTION get_user_order_total(target_user_id INT, target_order_id INT)
RETURNS NUMERIC(10,2) AS $$
DECLARE
    total_price NUMERIC(10,2);
BEGIN
    SELECT COALESCE(SUM(i.price), 0.00) INTO total_price
    FROM items i
    INNER JOIN product_orders o ON i.order_id = o.order_id
    WHERE o.user_id = target_user_id AND o.order_id = target_order_id;
    
    RETURN total_price;
END;
$$ LANGUAGE plpgsql;


-- =============================================================================
-- 3. SEED DATA GENERATION & FUNCTION CHECKS
-- =============================================================================

-- Populate Users
INSERT INTO users (username, email) VALUES 
('john_doe', 'john@example.com'),
('jane_smith', 'jane@example.com');

-- Populate Orders
INSERT INTO product_orders (order_id, user_id) VALUES 
(101, 1), 
(102, 1), 
(103, 2); 

-- Populate Items across orders
INSERT INTO items (item_name, price, order_id) VALUES 
('Mechanical Keyboard', 120.50, 101),
('Ergonomic Mouse', 45.00, 101),
('USB-C Hub', 25.00, 102),
('4K Monitor', 349.99, 103),
('Monitor Arm', 60.00, 103);

-- Verification Executions:
-- Test 1: Fetch total for order 101 (Expected: 165.50)
SELECT get_order_total(101) AS calculated_order_total;

-- Test 2: Fetch user-validated total for user 1, order 101 (Expected: 165.50)
SELECT get_user_order_total(1, 101) AS calculated_user_order_total;

-- Test 3: Fetch user-validated total for user 2, order 103 (Expected: 409.99)
SELECT get_user_order_total(2, 103) AS user_2_order_total;
