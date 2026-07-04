const pool = require('../config/db');

const getQuizData = async () => {
    const query = `
        SELECT q.id, q.question, q.correct_answer, ARRAY_AGG(o.option_text) as options
        FROM questions q
        JOIN questions_options qo ON q.id = qo.question_id
        JOIN options o ON qo.option_id = o.id
        GROUP BY q.id;
    `;
    const result = await pool.query(query);
    return result.rows;
};

module.exports = { getQuizData };
