-- =============================================================================
-- PART I: ONE-TO-ONE RELATIONSHIP (CUSTOMER & CUSTOMER PROFILE)
-- =============================================================================

-- 1. Create Tables
CREATE TABLE Customer (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL
);

CREATE TABLE Customer_profile (
    id SERIAL PRIMARY KEY,
    isLoggedIn BOOLEAN DEFAULT false,
    customer_id INT UNIQUE REFERENCES Customer(id) ON DELETE CASCADE
    -- The UNIQUE constraint on customer_id strictly enforces the 1-to-1 relationship mapping
);

-- 2. Insert Customers
INSERT INTO Customer (first_name, last_name) VALUES 
('John', 'Doe'),
('Jerome', 'Lalu'),
('Lea', 'Rive');

-- 3. Insert Customer Profiles using subqueries
-- John is loggedIn (true)
INSERT INTO Customer_profile (isLoggedIn, customer_id) VALUES (
    true, 
    (SELECT id FROM Customer WHERE first_name = 'John' AND last_name = 'Doe')
);

-- Jerome is not logged in (false)
INSERT INTO Customer_profile (isLoggedIn, customer_id) VALUES (
    false, 
    (SELECT id FROM Customer WHERE first_name = 'Jerome' AND last_name = 'Lalu')
);

-- 4. Join and Selection Queries

-- Display the first_name of the LoggedIn customers
SELECT c.first_name 
FROM Customer c
INNER JOIN Customer_profile cp ON c.id = cp.customer_id
WHERE cp.isLoggedIn = true;

-- Display all customers' first_name and isLoggedIn columns (even if they don't have a profile)
SELECT c.first_name, cp.isLoggedIn
FROM Customer c
LEFT JOIN Customer_profile cp ON c.id = cp.customer_id;

-- Display the number of customers that are not LoggedIn
-- This includes customers explicitly marked as false OR those missing a profile record entirely (NULL)
SELECT COUNT(*) AS not_logged_in_count
FROM Customer c
LEFT JOIN Customer_profile cp ON c.id = cp.customer_id
WHERE cp.isLoggedIn = false OR cp.isLoggedIn IS NULL;


-- =============================================================================
-- PART II: MANY-TO-MANY RELATIONSHIP (LIBRARY SYSTEM)
-- =============================================================================

-- 1. Create Book Table
CREATE TABLE Book (
    book_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL
);

-- 2. Insert Books
INSERT INTO Book (title, author) VALUES 
('Alice In Wonderland', 'Lewis Carroll'),
('Harry Potter', 'J.K Rowling'),
('To kill a mockingbird', 'Harper Lee');

-- 3. Create Student Table with Age Check Constraint
CREATE TABLE Student (
    student_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    age INT CHECK (age <= 15) -- Enforces that the child's age can never be greater than 15
);

-- 4. Insert Students
INSERT INTO Student (name, age) VALUES 
('John', 12),
('Lera', 11),
('Patrick', 10),
('Bob', 14);

-- 5. Create Junction Table (Library)
CREATE TABLE Library (
    book_fk_id INT REFERENCES Book(book_id) ON DELETE CASCADE ON UPDATE CASCADE,
    student_id INT REFERENCES Student(student_id) ON DELETE CASCADE ON UPDATE CASCADE,
    borrowed_date DATE NOT NULL,
    PRIMARY KEY (book_fk_id, student_id) -- Composite key mapping out the Many-to-Many bridge
);

-- 6. Add 4 Records in the Junction Table using subqueries

-- John borrowed Alice In Wonderland on 15/02/2022
INSERT INTO Library (student_id, book_fk_id, borrowed_date) VALUES (
    (SELECT student_id FROM Student WHERE name = 'John'),
    (SELECT book_id FROM Book WHERE title = 'Alice In Wonderland'),
    '2022-02-15'
);

-- Bob borrowed To kill a mockingbird on 03/03/2021
INSERT INTO Library (student_id, book_fk_id, borrowed_date) VALUES (
    (SELECT student_id FROM Student WHERE name = 'Bob'),
    (SELECT book_id FROM Book WHERE title = 'To kill a mockingbird'),
    '2021-03-03'
);

-- Lera borrowed Alice In Wonderland on 23/05/2021
INSERT INTO Library (student_id, book_fk_id, borrowed_date) VALUES (
    (SELECT student_id FROM Student WHERE name = 'Lera'),
    (SELECT book_id FROM Book WHERE title = 'Alice In Wonderland'),
    '2021-05-23'
);

-- Bob borrowed Harry Potter on 12/08/2021
INSERT INTO Library (student_id, book_fk_id, borrowed_date) VALUES (
    (SELECT student_id FROM Student WHERE name = 'Bob'),
    (SELECT book_id FROM Book WHERE title = 'Harry Potter'),
    '2021-08-12'
);

-- 7. Display the Data Queries

-- Select all the columns from the junction table
SELECT * FROM Library;

-- Select the name of the student and the title of the borrowed books
SELECT s.name AS student_name, b.title AS book_title
FROM Library l
INNER JOIN Student s ON l.student_id = s.student_id
INNER JOIN Book b ON l.book_fk_id = b.book_id;

-- Select the average age of the children that borrowed the book Alice in Wonderland
SELECT AVG(s.age) AS average_age
FROM Library l
INNER JOIN Student s ON l.student_id = s.student_id
INNER JOIN Book b ON l.book_fk_id = b.book_id
WHERE b.title = 'Alice In Wonderland';

-- 8. Delete Deletion Test Analysis
DELETE FROM Student WHERE name = 'John';
-- Execution Result & Outcome:
-- Because the student_id foreign key reference inside the Library table was explicitly declared 
-- with 'ON DELETE CASCADE', deleting John from the primary Student table instantly drops and purges 
-- his active book-borrowing record from the Library table. No orphaned metadata entries are left.
