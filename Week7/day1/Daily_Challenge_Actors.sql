-- Database: Daily Challenge: Actors

-- DROP DATABASE IF EXISTS "Daily Challenge: Actors";

CREATE DATABASE "Daily Challenge: Actors"
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'English_Israel.1252'
    LC_CTYPE = 'English_Israel.1252'
    LOCALE_PROVIDER = 'libc'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1
    IS_TEMPLATE = False;

	CREATE TABLE actors(
 actor_id SERIAL PRIMARY KEY,
 first_name VARCHAR (50) NOT NULL,
 last_name VARCHAR (100) NOT NULL,
 age DATE NOT NULL,
 number_oscars SMALLINT NOT NULL
);


INSERT INTO actors (first_name, last_name, age, number_oscars)
VALUES
('Adam','Savage','08/10/1920', 16),
('Luke','Skywalker','09/11/1977', 11),
('James','Eral-Jones','06/11/1989', 22);

SELECT * FROM actors;

SELECT COUNT(*) FROM actors;

INSERT INTO actors (first_name, last_name, age, number_oscars)
VALUES('Jennifer','Aniston',, 1);

-- ERROR:  syntax error at or near ","