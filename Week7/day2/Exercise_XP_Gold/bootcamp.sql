-- Database: bootcamp

-- DROP DATABASE IF EXISTS bootcamp;

CREATE DATABASE bootcamp
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'English_Israel.1252'
    LC_CTYPE = 'English_Israel.1252'
    LOCALE_PROVIDER = 'libc'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1
    IS_TEMPLATE = False;

CREATE TABLE students(
 student_id SERIAL PRIMARY KEY,
 last_name VARCHAR (50) NOT NULL,
 first_name VARCHAR (100) NOT NULL,
 birth_date DATE NOT NULL
);

INSERT INTO students (first_name, last_name, birth_date)
VALUES
('Marc','Benichou','02/11/1998'),
('Yoan','Cohen','03/12/2010'),
('Lea','Benichou','27/07/1987'),
('Amelia','Dux','07/04/1996'),
('David','Grez','14/06/2003'),
('Omer','Simpson','03/10/1980'),
('Ariel','Zinger','02/03/1986');

SELECT * FROM students;
SELECT first_name, last_name FROM students;
SELECT * FROM students WHERE student_id = 2;
SELECT * FROM students WHERE last_name = 'Benichou' AND first_name = 'Marc';
SELECT * FROM students WHERE last_name = 'Benichou' OR first_name = 'Marc';
SELECT * FROM students WHERE first_name LIKE '%a%';
SELECT * FROM students WHERE first_name ILIKE 'a%';
SELECT * FROM students WHERE first_name LIKE '%a';
SELECT * FROM students WHERE first_name LIKE '%a_';
SELECT * FROM students WHERE student_id = 1 OR student_id = 3;
SELECT * FROM students WHERE birth_date >= '1/01/2000';
SELECT * FROM students ORDER BY last_name ASC LIMIT 4;
SELECT * FROM students ORDER BY birth_date DESC LIMIT 1;
SELECT first_name, last_name, birth_date FROM students OFFSET 2 LIMIT 3;

DROP TABLE students;

-- 1. Update twin birth dates
UPDATE students 
SET birth_date = '1998-11-02' 
WHERE (first_name = 'Lea' AND last_name = 'Benichou') 
   OR (first_name = 'Marc' AND last_name = 'Benichou');

-- 2. Change David's last name
UPDATE students 
SET last_name = 'Guez' 
WHERE first_name = 'David' AND last_name = 'Grez';

DELETE FROM students 
WHERE first_name = 'Lea' AND last_name = 'Benichou';

-- 1. Total students
SELECT COUNT(*) FROM students;

-- 2. Born after 1/01/2000
SELECT COUNT(*) FROM students 
WHERE birth_date > '2000-01-01';

-- 1. Add column math_grade
ALTER TABLE students ADD COLUMN math_grade INT;

-- 2. Update grades based on IDs
UPDATE students SET math_grade = 80 WHERE id = 1;
UPDATE students SET math_grade = 90 WHERE id IN (2, 4);
UPDATE students SET math_grade = 40 WHERE id = 6;

-- 3. Count students with grade > 83
SELECT COUNT(*) FROM students WHERE math_grade > 83;

-- 4. Add duplicate student with a new grade
INSERT INTO students (first_name, last_name, birth_date, math_grade)
SELECT 'Omer', 'Simpson', birth_date, 70 
FROM students 
WHERE first_name = 'Omer' AND last_name = 'Simpson'
LIMIT 1;

SELECT first_name, last_name, COUNT(math_grade) AS total_grade 
FROM students 
GROUP BY first_name, last_name;

SELECT SUM(math_grade) AS total_grades_sum FROM students;