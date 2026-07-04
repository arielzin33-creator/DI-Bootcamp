-- Exercise 1: DVD Rental (Schema Design & Joins)

-- 1. Get all languages
SELECT * FROM language;

-- 2. Get all films joined with their languages (Inner Join)
SELECT f.title, f.description, l.name AS language_name
FROM film f
INNER JOIN language l ON f.language_id = l.language_id;

-- 3. Get all languages, even if there are no films (Left Join)
SELECT f.title, f.description, l.name AS language_name
FROM language l
LEFT JOIN film f ON l.language_id = f.language_id;

-- 4. Create and populate new_film
CREATE TABLE new_film (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

INSERT INTO new_film (name) VALUES 
('Inception'),
('Interstellar'),
('The Matrix');

-- 5. Create customer_review table with ON DELETE CASCADE
CREATE TABLE customer_review (
    review_id SERIAL PRIMARY KEY,
    film_id INT REFERENCES new_film(id) ON DELETE CASCADE,
    language_id INT REFERENCES language(language_id),
    title VARCHAR(255) NOT NULL,
    score INT CHECK (score BETWEEN 1 AND 10),
    review_text TEXT,
    last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Add 2 movie reviews
INSERT INTO customer_review (film_id, language_id, title, score, review_text) VALUES 
(1, 1, 'Mind-bending Masterpiece', 10, 'An absolute classic with phenomenal visuals and pacing.'),
(2, 1, 'Visually Stunning', 9, 'Great acting and incredible soundtrack, though a bit long.');

-- 7. Delete a film and check the outcome
DELETE FROM new_film WHERE id = 1;
-- Outcome: The review associated with film_id = 1 is automatically deleted due to ON DELETE CASCADE.
