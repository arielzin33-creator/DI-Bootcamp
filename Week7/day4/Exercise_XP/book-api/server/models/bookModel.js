const pool = require('../config/db');

const getAllBooks = async () => {
    const result = await pool.query('SELECT * FROM books ORDER BY id ASC');
    return result.rows;
};

const getBookById = async (id) => {
    const result = await pool.query('SELECT * FROM books WHERE id = $1', [id]);
    return result.rows[0];
};

const createBook = async (title, author, publishedYear) => {
    const result = await pool.query(
        'INSERT INTO books (title, author, publishedYear) VALUES ($1, $2, $3) RETURNING *',
        [title, author, publishedYear]
    );
    return result.rows[0];
};

module.exports = { getAllBooks, getBookById, createBook };
