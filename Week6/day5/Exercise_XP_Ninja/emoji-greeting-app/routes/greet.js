const express = require('express');
const router = express.Router();

// List of available emojis
const emojis = ["😀", "🎉", "🌟", "🎈", "👋"];

// ---------- Helper: renders the emoji radio buttons as HTML ----------
function renderEmojiOptions(selectedEmoji) {
    return emojis
        .map((emoji, index) => {
            const isChecked = emoji === selectedEmoji ? 'checked' : '';
            return `
        <label class="emoji-option">
          <input type="radio" name="emoji" value="${emoji}" ${isChecked} required />
          <span class="emoji-symbol">${emoji}</span>
        </label>
      `;
        })
        .join('');
}

// ---------- GET / — Display the greeting form ----------
router.get('/', (req, res) => {
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>Emoji Greeting App</title>
      <link rel="stylesheet" href="/style.css" />
    </head>
    <body>
      <div class="container">
        <h1>Emoji Greeting App</h1>

        <form action="/greet" method="POST">
          <label for="name">Enter your name:</label>
          <input type="text" id="name" name="name" placeholder="Your name" required />

          <p>Choose an emoji:</p>
          <div class="emoji-list">
            ${renderEmojiOptions()}
          </div>

          <button type="submit">Greet Me!</button>
        </form>
      </div>
    </body>
    </html>
  `;

    res.status(200).send(html);
});

// ---------- POST /greet — Process the form and show the greeting ----------
router.post('/greet', (req, res) => {
    const { name, emoji } = req.body;

    // ---------- Validation ----------
    if (!name || typeof name !== 'string' || name.trim() === '') {
        return res.status(400).send(renderErrorPage('Please enter your name before submitting.'));
    }

    if (!emoji || !emojis.includes(emoji)) {
        return res.status(400).send(renderErrorPage('Please select a valid emoji from the list.'));
    }

    const trimmedName = name.trim();

    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>Your Greeting</title>
      <link rel="stylesheet" href="/style.css" />
    </head>
    <body>
      <div class="container">
        <h1 class="greeting">Hello, ${escapeHtml(trimmedName)}! ${emoji}</h1>
        <p>Thanks for stopping by — have a wonderful day!</p>
        <a href="/" class="back-link">Send another greeting</a>
      </div>
    </body>
    </html>
  `;

    res.status(200).send(html);
});

// ---------- Helper: renders a simple error page ----------
function renderErrorPage(message) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>Error</title>
      <link rel="stylesheet" href="/style.css" />
    </head>
    <body>
      <div class="container">
        <h1 class="error">Oops!</h1>
        <p>${message}</p>
        <a href="/" class="back-link">Go back</a>
      </div>
    </body>
    </html>
  `;
}

// ---------- Helper: basic HTML-escaping to prevent injection via the name field ----------
function escapeHtml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

module.exports = router;