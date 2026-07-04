CREATE DATABASE public
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'English_Israel.1252'
    LC_CTYPE = 'English_Israel.1252'
    LOCALE_PROVIDER = 'libc'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1
    IS_TEMPLATE = False;

CREATE TABLE items(
 items_id SERIAL PRIMARY KEY,
 item_name VARCHAR (50) NOT NULL,
 price SMALLINT NOT NULL
);

CREATE TABLE customers(
 customers_id SERIAL PRIMARY KEY,
 first_name VARCHAR (50) NOT NULL,
 last_name VARCHAR (50) NOT NULL
);

INSERT INTO items (item_name, price)
VALUES
('Small Desk',100),
('Large Desk',300),
('Fan',80);

INSERT INTO customers (first_name, last_name)
VALUES
('Greg','Jones'),
('Sandra','Jones'),
('Scott','Scott'),
('Trevor','Green'),
('Melanie','Johnson');

SELECT * FROM items;
SELECT * FROM customers;

SELECT * FROM items WHERE price > 80;

SELECT * FROM customers WHERE last_name = 'smith';

SELECT * FROM customers WHERE last_name = 'Jones';

SELECT * FROM customers WHERE first_name != 'Scott';

--day2

-- Exercise 1: Items and Customers
-- 1. All items, ordered by price (lowest to highest)
SELECT * FROM public.items
ORDER BY price ASC;

-- 2. Items with a price above 80 (80 included), ordered by price (highest to lowest)
SELECT * FROM items 
WHERE price >= 80 
ORDER BY price DESC;

-- 3. The first 3 customers in alphabetical order of the first name (A-Z) – exclude the primary key column
SELECT first_name, last_name 
FROM customers 
ORDER BY first_name ASC 
LIMIT 3;

-- 4. All last names in reverse alphabetical order (Z-A)
SELECT last_name 
FROM customers 
ORDER BY last_name DESC;

-- Exercise 2: dvdrental Database
-- 1. Select all columns from the “customer” table
SELECT * FROM customer;

-- 2. Display names using an alias named “full_name”
SELECT first_name || ' ' || last_name AS full_name 
FROM customer;

-- 3. Select all unique account creation dates
SELECT DISTINCT create_date 
FROM customer;

-- 4. Customer details ordered descending by first name
SELECT * FROM customer 
ORDER BY first_name DESC;

-- 5. Film details ordered ascending by rental rate
SELECT film_id, title, description, release_year, rental_rate 
FROM film 
ORDER BY rental_rate ASC;

-- 6. Address and phone number of customers living in Texas
SELECT address, phone 
FROM address 
WHERE district = 'Texas';

-- 7. Retrieve movie details where movie ID is either 15 or 150
SELECT * FROM film 
WHERE film_id IN (15, 150);

-- 8. Check if your favorite movie exists (e.g., 'Inception')
SELECT film_id, title, description, length, rental_rate 
FROM film 
WHERE title = 'Inception';

-- 9. Search movies starting with the first two letters of your favorite movie (e.g., 'In%')
SELECT film_id, title, description, length, rental_rate 
FROM film 
WHERE title LIKE 'In%';

-- 10. Find the 10 cheapest movies
SELECT * FROM film 
ORDER BY rental_rate ASC 
LIMIT 10;

-- 11. Find the next 10 cheapest movies (Bonus: No LIMIT)
SELECT * FROM film 
ORDER BY rental_rate ASC 
OFFSET 10 ROWS 
FETCH FIRST 10 ROWS ONLY;

-- 12. Join customer and payment data
SELECT c.first_name, c.last_name, p.amount, p.payment_date 
FROM customer c
INNER JOIN payment p ON c.customer_id = p.customer_id
ORDER BY c.customer_id ASC;

-- 13. Find all movies not in inventory
SELECT f.film_id, f.title 
FROM film f
LEFT JOIN inventory i ON f.film_id = i.film_id
WHERE i.inventory_id IS NULL;

-- 14. Find which city is in which country
SELECT ci.city, co.country 
FROM city ci
INNER JOIN country co ON ci.country_id = co.country_id;

-- Day2
-- Exercise 3: Items and Customers

CREATE TABLE purchases (
    id SERIAL PRIMARY KEY,
    customer_id INT REFERENCES customers(id),
    item_id INT REFERENCES items(id),
    quantity_purchased INT
);

-- Insert Scott Scott (1 fan)
INSERT INTO purchases (customer_id, item_id, quantity_purchased)
VALUES (
    (SELECT id FROM customers WHERE first_name = 'Scott' AND last_name = 'Scott'),
    (SELECT id FROM items WHERE item_name = 'fan'),
    1
);

-- Insert Melanie Johnson (10 large desks)
INSERT INTO purchases (customer_id, item_id, quantity_purchased)
VALUES (
    (SELECT id FROM customers WHERE first_name = 'Melanie' AND last_name = 'Johnson'),
    (SELECT id FROM items WHERE item_name = 'large desk'),
    10
);

-- Insert Greg Jones (2 small desks)
INSERT INTO purchases (customer_id, item_id, quantity_purchased)
VALUES (
    (SELECT id FROM customers WHERE first_name = 'Greg' AND last_name = 'Jones'),
    (SELECT id FROM items WHERE item_name = 'small desk'),
    2
);

SELECT * FROM purchases;

SELECT p.id, c.first_name, c.last_name, p.item_id, p.quantity_purchased 
FROM purchases p
INNER JOIN customers c ON p.customer_id = c.id;

SELECT * FROM purchases WHERE customer_id = 5;

SELECT p.* FROM purchases p
INNER JOIN items i ON p.item_id = i.id
WHERE i.item_name IN ('large desk', 'small desk');

SELECT c.first_name, c.last_name, i.item_name 
FROM purchases p
INNER JOIN customers c ON p.customer_id = c.id
INNER JOIN items i ON p.item_id = i.id;

INSERT INTO purchases (customer_id, item_id, quantity_purchased) 
VALUES (3, NULL, 5);

