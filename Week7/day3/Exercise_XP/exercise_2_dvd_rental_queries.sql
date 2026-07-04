-- Exercise 2 : DVD Rental (Data Manipulation & Advanced Queries)

-- 1. Update the language of some films
UPDATE film 
SET language_id = 2 
WHERE film_id BETWEEN 1 AND 5;

-- 2. Which foreign keys (references) are defined for the customer table?
SELECT conname, confrelid::regclass AS referenced_table
FROM pg_constraint 
WHERE conrelid = 'customer'::regclass AND contype = 'f';
-- Impact: store_id and address_id must exist in their parent tables before INSERT.

-- 3. Dropping the customer_review table
DROP TABLE customer_review;
-- Impact: This is straightforward as no other tables depend on customer_review.

-- 4. Find how many rentals are outstanding
SELECT COUNT(*) AS outstanding_rentals 
FROM rental 
WHERE return_date IS NULL;

-- 5. Find the 30 most expensive movies which are outstanding
SELECT f.title, f.rental_rate, r.rental_date
FROM rental r
INNER JOIN inventory i ON r.inventory_id = i.inventory_id
INNER JOIN film f ON i.film_id = f.film_id
WHERE r.return_date IS NULL
ORDER BY f.rental_rate DESC, f.title ASC
LIMIT 30;

-- 6. Help your friend find their 4 movies

-- The 1st film (Sumo wrestler starring Penelope Monroe)
SELECT f.title, f.description 
FROM film f
INNER JOIN film_actor fa ON f.film_id = fa.film_id
INNER JOIN actor a ON fa.actor_id = a.actor_id
WHERE a.first_name = 'PENELOPE' AND a.last_name = 'MONROE'
  AND f.description ILIKE '%sumo%';

-- The 2nd film (Short R-rated documentary < 1 hour)
SELECT f.title, f.length, f.rating, c.name AS category
FROM film f
INNER JOIN film_category fc ON f.film_id = fc.film_id
INNER JOIN category c ON fc.category_id = c.category_id
WHERE f.length < 60 
  AND f.rating = 'R' 
  AND c.name = 'Documentary';

-- The 3rd film (Rented by Matthew Mahan, paid > $4.00, returned July 28 - Aug 1, 2005)
SELECT f.title, r.return_date, p.amount
FROM rental r
INNER JOIN customer cu ON r.customer_id = cu.customer_id
INNER JOIN payment p ON r.rental_id = p.rental_id
INNER JOIN inventory i ON r.inventory_id = i.inventory_id
INNER JOIN film f ON i.film_id = f.film_id
WHERE cu.first_name = 'MATTHEW' AND cu.last_name = 'MAHAN'
  AND p.amount > 4.00
  AND r.return_date BETWEEN '2005-07-28 00:00:00' AND '2005-08-01 23:59:59';

-- The 4th film (Rented by Matthew Mahan, "boat" in title/desc, expensive replacement cost)
SELECT f.title, f.description, f.replacement_cost
FROM rental r
INNER JOIN customer cu ON r.customer_id = cu.customer_id
INNER JOIN inventory i ON r.inventory_id = i.inventory_id
INNER JOIN film f ON i.film_id = f.film_id
WHERE cu.first_name = 'MATTHEW' AND cu.last_name = 'MAHAN'
  AND (f.title ILIKE '%boat%' OR f.description ILIKE '%boat%')
ORDER BY f.replacement_cost DESC;
