-- Exercise 1: DVD Rental
SELECT rating, COUNT(*) AS film_count 
FROM film 
GROUP BY rating;

-- 2. Movies rated G or PG-13, under 2 hours, rental rate under 3.00, sorted alphabetically
SELECT title, rating, length, rental_rate 
FROM film 
WHERE rating IN ('G', 'PG-13') 
  AND length < 120 
  AND rental_rate < 3.00 
ORDER BY title ASC;

-- 3. Change a customer's details to your details
UPDATE customer 
SET first_name = 'Alex', 
    last_name = 'Smith', 
    email = 'alex.smith@example.com' 
WHERE customer_id = 1;

-- 4. Change that customer's address
UPDATE address 
SET address = '123 Innovation Way', 
    district = 'Center', 
    postal_code = '75100' 
WHERE address_id = (SELECT address_id FROM customer WHERE customer_id = 1);

