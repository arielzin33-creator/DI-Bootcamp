-- Database Schema Setup
CREATE TABLE IF NOT EXISTS questions (
    id SERIAL PRIMARY KEY,
    question TEXT NOT NULL,
    correct_answer VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS options (
    id SERIAL PRIMARY KEY,
    option_text VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS questions_options (
    question_id INT REFERENCES questions(id) ON DELETE CASCADE,
    option_id INT REFERENCES options(id) ON DELETE CASCADE,
    PRIMARY KEY (question_id, option_id)
);

-- Seed Initial Quiz Data
INSERT INTO questions (id, question, correct_answer) VALUES
(1, 'What is the capital of France?', 'Paris'),
(2, 'Which programming language is known as the language of the web?', 'JavaScript'),
(3, 'What does SQL stand for?', 'Structured Query Language');

INSERT INTO options (id, option_text) VALUES
(1, 'Paris'), (2, 'London'), (3, 'Berlin'), (4, 'Madrid'),
(5, 'Python'), (6, 'JavaScript'), (7, 'C++'), (8, 'Java'),
(9, 'Structured Query Language'), (10, 'Simple Query Language'), (11, 'Sequential Query Language'), (12, 'Standard Quick Language');

INSERT INTO questions_options (question_id, option_id) VALUES
(1, 1), (1, 2), (1, 3), (1, 4),
(2, 5), (2, 6), (2, 7), (2, 8),
(3, 9), (3, 10), (3, 11), (3, 12);
