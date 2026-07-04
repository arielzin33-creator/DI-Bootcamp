-- Exercise 1: Bonus Public Database

-- 1. Fetch the last 2 customers in alphabetical order (A-Z) – exclude ‘id’
SELECT first_name, last_name 
FROM customers 
ORDER BY first_name DESC 
LIMIT 2;

-- 2. Delete all purchases made by Scott
DELETE FROM purchases 
WHERE customer_id = (
    SELECT id FROM customers WHERE first_name = 'Scott' AND last_name = 'Scott'
);

-- 3. Does Scott still exist in the customers table? Try and find him.
SELECT * FROM customers 
WHERE first_name = 'Scott' AND last_name = 'Scott';

-- 4. Show all purchases, including Scott's order but with blank/empty customer names (Which join?)
SELECT p.id, p.quantity_purchased, c.first_name, c.last_name
FROM purchases p
LEFT JOIN customers c ON p.customer_id = c.id;

-- 5. Show all purchases, ensuring Scott's order will NOT appear (Which join?)
SELECT p.id, p.quantity_purchased, c.first_name, c.last_name
FROM purchases p
INNER JOIN customers c ON p.customer_id = c.id;