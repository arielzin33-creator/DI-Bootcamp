-- -- Database: postgres

-- -- DROP DATABASE IF EXISTS postgres;

-- CREATE DATABASE postgres
--     WITH
--     OWNER = postgres
--     ENCODING = 'UTF8'
--     LC_COLLATE = 'English_Israel.1252'
--     LC_CTYPE = 'English_Israel.1252'
--     LOCALE_PROVIDER = 'libc'
--     TABLESPACE = pg_default
--     CONNECTION LIMIT = -1
--     IS_TEMPLATE = False;

-- COMMENT ON DATABASE postgres
--     IS 'default administrative connection database';

CREATE TABLE actors(
 actor_id SERIAL PRIMARY KEY,
 first_name VARCHAR (50) NOT NULL,
 last_name VARCHAR (100) NOT NULL,
 age DATE NOT NULL,
 number_oscars SMALLINT NOT NULL
);

SELECT * FROM actors;

INSERT INTO actors (first_name, last_name, age, number_oscars)
VALUES('Matt','Damon','08/10/1970', 5);

INSERT INTO actors (first_name, last_name, age, number_oscars)
VALUES('George','Clooney','06/05/1961', 2);

INSERT INTO actors (first_name, last_name, age, number_oscars)
VALUES('Pamela','Anderson','08/07/1974', 20);

INSERT INTO actors (first_name, last_name, age, number_oscars)
VALUES('Jennifer','Aniston','12/11/1984', 1);

INSERT INTO actors (first_name, last_name, age, number_oscars)
VALUES
('Adam','Savage','08/10/1920', 16),
('Luke','Skywalker','09/11/1977', 11),
('James','Eral-Jones','06/11/1989', 22);

SELECT * FROM actors WHERE first_name = 'Matt';

SELECT * FROM actors WHERE number_oscars >= 3;

SELECT last_name FROM actors WHERE first_name != 'Matt' ;

SELECT * FROM actors LIMIT 4;

SELECT * FROM actors ORDER BY last_name ASC LIMIT 4;

SELECT * FROM actors WHERE first_name LIKE '%e%'

SELECT * FROM actors WHERE number_oscars > 5;

SHOW port;