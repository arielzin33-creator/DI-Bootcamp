const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
const Parser = require('rss-parser');

const app = express();
const PORT = 5000;

const parser = new Parser();
const FEED_URL = 'https://thefactfile.org/feed/';

// ---------- Middleware ----------
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// EJS setup — views live across two folders (partials/pages), so we point views to /public
app.set('view engine', 'ejs');
app.set('views', './public');

// ---------- Helper: fetch and parse the RSS feed ----------
async function getFeedItems() {
    const feed = await parser.parseURL(FEED_URL);
    return feed.items;
}

// ---------- Helper: extract a deduplicated list of all categories across items ----------
function extractCategories(items) {
    const categorySet = new Set();

    items.forEach(item => {
        if (item.categories && Array.isArray(item.categories)) {
            item.categories.forEach(cat => categorySet.add(cat));
        }
    });

    return Array.from(categorySet).sort();
}

// ---------- GET / — Home page: display all posts ----------
app.get('/', async(req, res) => {
    try {
        const posts = await getFeedItems();
        res.render('pages/index', { posts });
    } catch (error) {
        console.error('Error fetching RSS feed:', error.message);
        res.status(500).send('Failed to load the fact feed. Please try again later.');
    }
});

// ---------- GET /search — Search page: no posts shown initially ----------
app.get('/search', async(req, res) => {
    try {
        const items = await getFeedItems();
        const categories = extractCategories(items);

        res.render('pages/search', { posts: [], categories });
    } catch (error) {
        console.error('Error loading categories:', error.message);
        res.render('pages/search', { posts: [], categories: [] });
    }
});

// ---------- POST /search/title — Search by title ----------
app.post('/search/title', async(req, res) => {
    const { title } = req.body;

    try {
        const items = await getFeedItems();
        const categories = extractCategories(items);

        if (!title || title.trim() === '') {
            return res.render('pages/search', { posts: [], categories });
        }

        const searchTerm = title.trim().toLowerCase();

        const matchingPosts = items.filter(item =>
            item.title && item.title.toLowerCase().includes(searchTerm)
        );

        res.render('pages/search', { posts: matchingPosts, categories });
    } catch (error) {
        console.error('Error searching by title:', error.message);
        res.status(500).send('Failed to search the fact feed. Please try again later.');
    }
});

// ---------- POST /search/category — Search by category ----------
app.post('/search/category', async(req, res) => {
    const { category } = req.body;

    try {
        const items = await getFeedItems();
        const categories = extractCategories(items);

        if (!category || category.trim() === '') {
            return res.render('pages/search', { posts: [], categories });
        }

        const matchingPosts = items.filter(item =>
            item.categories && item.categories.includes(category)
        );

        res.render('pages/search', { posts: matchingPosts, categories });
    } catch (error) {
        console.error('Error searching by category:', error.message);
        res.status(500).send('Failed to search the fact feed. Please try again later.');
    }
});

app.listen(PORT, () => {
    console.log(`RSS Fact Reader running on http://localhost:${PORT}`);
});