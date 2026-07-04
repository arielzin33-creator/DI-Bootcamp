-- =============================================================================
-- PART I: ONE-TO-ONE RELATIONSHIP (CUSTOMER & CUSTOMER PROFILE)
-- =============================================================================

-- 1. Create Tables
CREATE TABLE Customer (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL
);

CREATE TABLE Customer_profile (
    id SERIAL PRIMARY KEY,
    isLoggedIn BOOLEAN DEFAULT false,
    customer_id INT UNIQUE REFERENCES Customer(id) ON DELETE CASCADE
    -- The UNIQUE constraint on customer_id strictly enforces the 1-to-1 relationship mapping
);

-- 2. Insert Customers
INSERT INTO Customer (first_name, last_name) VALUES 
('John', 'Doe'),
('Jerome', 'Lalu'),
('Lea', 'Rive');

-- 3. Insert Customer Profiles using subqueries
-- John is loggedIn (true)
INSERT INTO Customer_profile (isLoggedIn, customer_id) VALUES (
    true, 
    (SELECT id FROM Customer WHERE first_name = 'John' AND last_name = 'Doe')
);

-- Jerome is not logged in (false)
INSERT INTO Customer_profile (isLoggedIn, customer_id) VALUES (
    false, 
    (SELECT id FROM Customer WHERE first_name = 'Jerome' AND last_name = 'Lalu')
);

-- 4. Join and Selection Queries

-- Display the first_name of the LoggedIn customers
SELECT c.first_name 
FROM Customer c
INNER JOIN Customer_profile cp ON c.id = cp.customer_id
WHERE cp.isLoggedIn = true;

-- Display all customers' first_name and isLoggedIn columns (even if they don't have a profile)
SELECT c.first_name, cp.isLoggedIn
FROM Customer c
LEFT JOIN Customer_profile cp ON c.id = cp.customer_id;

-- Display the number of customers that are not LoggedIn
-- This includes customers explicitly marked as false OR those missing a profile record entirely (NULL)
SELECT COUNT(*) AS not_logged_in_count
FROM Customer c
LEFT JOIN Customer_profile cp ON c.id = cp.customer_id
WHERE cp.isLoggedIn = false OR cp.isLoggedIn IS NULL;
