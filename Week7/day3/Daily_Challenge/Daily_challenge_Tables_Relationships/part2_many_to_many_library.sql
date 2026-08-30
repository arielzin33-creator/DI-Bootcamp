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
