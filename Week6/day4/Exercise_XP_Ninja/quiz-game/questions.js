// A small bank of multiple-choice quiz questions
const questions = [{
        id: 1,
        question: 'What does HTML stand for?',
        options: [
            'Hyper Trainer Marking Language',
            'Hyper Text Markup Language',
            'Hyper Text Marketing Language',
            'Hyper Text Markup Leveler'
        ],
        correctAnswer: 1 // index into the options array
    },
    {
        id: 2,
        question: 'Which company developed JavaScript?',
        options: ['Microsoft', 'Netscape', 'Sun Microsystems', 'Apple'],
        correctAnswer: 1
    },
    {
        id: 3,
        question: 'What does CSS stand for?',
        options: [
            'Creative Style Sheets',
            'Computer Style Sheets',
            'Cascading Style Sheets',
            'Colorful Style Sheets'
        ],
        correctAnswer: 2
    },
    {
        id: 4,
        question: 'Which HTTP method is used to update a resource?',
        options: ['GET', 'POST', 'PUT', 'DELETE'],
        correctAnswer: 2
    },
    {
        id: 5,
        question: 'What is the correct file extension for JavaScript files?',
        options: ['.java', '.jscript', '.js', '.script'],
        correctAnswer: 2
    }
];

module.exports = questions;