-- Exercise 1 : DVD Rentals (Family & Kids Feature Pack)

-- 1. Retrieve all films with a rating of G or PG which are not currently rented
-- (They have been returned or have never been borrowed)
SELECT DISTINCT f.film_id, f.title, f.rating
FROM film f
INNER JOIN inventory i ON f.film_id = i.film_id
WHERE f.rating IN ('G', 'PG')
  AND i.inventory_id NOT IN (
      SELECT inventory_id 
      FROM rental 
      WHERE return_date IS NULL
  )
ORDER BY f.title;


-- 2. Create a new table representing a waiting list for children's movies
-- Table References Needed:
--   - customer_id: References customer(customer_id) to know WHO is waiting.
--   - film_id: References film(film_id) to know WHAT title they want.
CREATE TABLE children_waiting_list (
    waiting_id SERIAL PRIMARY KEY,
    customer_id INT REFERENCES customer(customer_id) ON DELETE CASCADE,
    film_id INT REFERENCES film(film_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Constraint ensures a customer cannot join the exact same movie queue multiple times
    CONSTRAINT unique_customer_film_wait UNIQUE (customer_id, film_id)
);


-- 3. Test Data Generation & Queue Count Retrieval

-- Seed data simulating children/families joining queues for specific movies
-- (Uses typical sequential IDs found in the standard dvdrental database)
INSERT INTO children_waiting_list (customer_id, film_id) VALUES 
(1, 1), 
(2, 1), 
(3, 1), 
(1, 2), 
(4, 2), 
(2, 3);

-- Query to retrieve the total number of people waiting for each movie
SELECT f.film_id, f.title, COUNT(w.waiting_id) AS total_people_waiting
FROM film f
INNER JOIN children_waiting_list w ON f.film_id = w.film_id
GROUP BY f.film_id, f.title
ORDER BY total_people_waiting DESC;
