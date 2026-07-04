# Instructions

## Setup

1. Create a new directory, and use `npm init`
2. Create a new file named `server.js`,
   * install and import `express`,
   * install and import `body-parser`,
   * install and import `cors`,
   * install `axios`,
   * install `ejs`,
   * install and import `rss-parser` - a node.js module. See the documentation [here](https://www.npmjs.com/package/rss-parser)
3. We will use this RSS Fact Feed `https://thefactfile.org/feed/`
4. Add the code below from the `rss-parser` documentation.
   * replace the 'your-rss-feed' to the url given above. Make some tests to understand how it works and run the application.

```js
let Parser = require('rss-parser');
let parser = new Parser();

(async () => {

  let feed = await parser.parseURL('your-rss-feed');
  console.log(feed.title);

  feed.items.forEach(item => {
    console.log(item.title + ':' + item.link)
  });

})();
```

## Static files

1. Create a `public` directory, with two subfolders: `partials` and `pages`.
2. In the `partials` folder, create four ejs files:
   * `footer.ejs` : contains a simple footer with the paragraph "Copyright 2021 …"
   * `head.ejs` : contains the CDN of Bootstrap, and some style in a `<style>` tag
   * `header.ejs` : contains a Bootstrap navbar with the links

```html
<a class="nav-link" href="/">Home</a>
<a class="nav-link" href="/search">Search</a>
```

   * `posts.ejs` : contains a div, where the posts are displayed. Each post is composed of:
      * a link that redirects the user to the specific post in the website `https://www.thefactsite.com/`
      * the publication date, creator, category and content of the post
3. In the `pages` folder, create two ejs files:
   * `search.ejs` :
      * It should include the files `head.ejs`, `header.ejs`, `posts.ejs` and `footer.ejs`.
      * It should contain two forms, to search a post by title and by category (with options).
   * `index.ejs` is the home page displaying all the posts.
      * It should include the files `head.ejs`, `header.ejs`, `posts.ejs` and `footer.ejs`.

## The server

1. Create a few routes in the file `server.js`:
   * `/` route : will retrieve all the facts from the RSS feed and render the posts in the `index.ejs` file. It's a GET request.
   * `/search` route: renders the `search.ejs` file. At first, no posts should be displayed. It's a GET request.
   * `/search/title` route: will retrieve the input (i.e. chosen title) of the user, and render the correct post in the `search.ejs` file. It's a POST request.
   * `/search/category` route: will retrieve the input (i.e. chosen category) of the user, and render the correct post in the `search.ejs` file. It's a POST request.
