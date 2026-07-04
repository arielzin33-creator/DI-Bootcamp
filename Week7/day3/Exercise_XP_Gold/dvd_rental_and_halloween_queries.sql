-- =============================================================================
-- EXERCISE 1: DVD RENTALS
-- =============================================================================

-- 1. Get a list of all rentals which are out (have not been returned). 
-- Identification: We find these by filtering for rows where 'return_date IS NULL'.
SELECT r.rental_id, r.rental_date, f.title
FROM rental r
INNER JOIN inventory i ON r.inventory_id = i.inventory_id
INNER JOIN film f ON i.film_id = f.film_id
WHERE r.return_date IS NULL;

-- 2. Get a list of all customers who have not returned their rentals.
SELECT c.customer_id, c.first_name, c.last_name, COUNT(r.rental_id) AS unreturned_count
FROM customer c
INNER JOIN rental r ON c.customer_id = r.customer_id
WHERE r.return_date IS NULL
GROUP BY c.customer_id, c.first_name, c.last_name
ORDER BY unreturned_count DESC;

-- 3. Get a list of all the Action films with Joe Swank.
-- Shortcut/View analysis: Standard PostgreSQL dvdrental sample db contains a pre-built view called 'film_list' 
-- which aggregates category and actors. If no custom view exists, we run a direct query:
SELECT f.title, c.name AS category, a.first_name, a.last_name
FROM film f
INNER JOIN film_category fc ON f.film_id = fc.film_id
INNER JOIN category c ON fc.category_id = c.category_id
INNER JOIN film_actor fa ON f.film_id = fa.film_id
INNER JOIN actor a ON fa.actor_id = a.actor_id
WHERE c.name = 'Action' 
  AND a.first_name = 'JOE' 
  AND a.last_name = 'SWANK';


-- =============================================================================
-- EXERCISE 2: HAPPY HALLOWEEN (ZOMBIE PLAGUE PREPARATION)
-- =============================================================================

-- 1. How many stores there are, and in which city and country they are located.
SELECT s.store_id, ci.city, co.country
FROM store s
INNER JOIN address a ON s.address_id = a.address_id
INNER JOIN city ci ON a.city_id = ci.city_id
INNER JOIN country co ON ci.country_id = co.country_id;

-- 2 & 3. Total viewing time in minutes, hours, and days for each store (excluding unreturned rentals)
SELECT 
    i.store_id,
    SUM(f.length) AS total_minutes,
    ROUND(SUM(f.length) / 60.0, 2) AS total_hours,
    ROUND(SUM(f.length) / 1440.0, 2) AS total_days
FROM inventory i
INNER JOIN film f ON i.film_id = f.film_id
WHERE i.inventory_id NOT IN (
    -- Subquery to exclude items that are currently out (rented but not returned)
    SELECT inventory_id FROM rental WHERE return_date IS NULL
)
GROUP BY i.store_id;

-- 4. A list of all customers in the cities where the stores are located.
SELECT c.customer_id, c.first_name, c.last_name, ci.city
FROM customer c
INNER JOIN address a ON c.address_id = a.address_id
INNER JOIN city ci ON a.city_id = ci.city_id
WHERE ci.city_id IN (
    SELECT city_id FROM store s 
    INNER JOIN address ad ON s.address_id = ad.address_id
);

-- 5. A list of all customers in the countries where the stores are located.
SELECT c.customer_id, c.first_name, c.last_name, co.country
FROM customer c
INNER JOIN address a ON c.address_id = a.address_id
INNER JOIN city ci ON a.city_id = ci.city_id
INNER JOIN country co ON ci.country_id = co.country_id
WHERE co.country_id IN (
    SELECT country_id FROM store s 
    INNER JOIN address ad ON s.address_id = ad.address_id
    INNER JOIN city cit ON ad.city_id = cit.city_id
);

-- 6. The Zombie 'Safe List' (Excludes Horror and scary-themed keywords)
-- Displays the aggregated runtime in minutes, hours, and days.
SELECT 
    SUM(f.length) AS total_safe_minutes,
    ROUND(SUM(f.length) / 60.0, 2) AS total_safe_hours,
    ROUND(SUM(f.length) / 1440.0, 2) AS total_safe_days
FROM film f
WHERE f.film_id NOT IN (
    -- Exclude Horror category
    SELECT fc.film_id 
    FROM film_category fc 
    INNER JOIN category cat ON fc.category_id = cat.category_id 
    WHERE cat.name = 'Horror'
)
AND f.title NOT ILIKE '%beast%' AND f.description NOT ILIKE '%beast%'
AND f.title NOT ILIKE '%monster%' AND f.description NOT ILIKE '%monster%'
AND f.title NOT ILIKE '%ghost%' AND f.description NOT ILIKE '%ghost%'
AND f.title NOT ILIKE '%dead%' AND f.description NOT ILIKE '%dead%'
AND f.title NOT ILIKE '%zombie%' AND f.description NOT ILIKE '%zombie%'
AND f.title NOT ILIKE '%undead%' AND f.description NOT ILIKE '%undead%';
