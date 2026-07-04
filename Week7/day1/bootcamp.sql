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