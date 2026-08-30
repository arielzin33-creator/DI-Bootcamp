import React from "react";

const POSTS_URL = "https://jsonplaceholder.typicode.com/posts";

/**
 * PostList
 *
 * Progression across the exercise:
 *  - Part I: fetched posts into state and rendered just each post's
 *    title, as plain centered text (no ID, no body, no labels).
 *  - Part III: this final version, matching the provided screenshot —
 *    each post now shows its ID, title, and body with bold labels,
 *    in its own spaced block, under a "List of posts:" heading.
 *
 * `errorMsg` was declared in state from the start (per the Part I
 * instructions) even though Part I's simpler render didn't use it.
 * It's put to use here: if the fetch fails, it's shown instead of an
 * empty page.
 */
class PostList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      posts: [],
      errorMsg: "",
    };
  }

  componentDidMount() {
    fetch(POSTS_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        this.setState({ posts: data });
      })
      .catch((error) => {
        this.setState({ errorMsg: error.message });
      });
  }

  render() {
    const { posts, errorMsg } = this.state;

    return (
      <div style={styles.page}>
        <h2 style={styles.heading}>List of posts:</h2>

        {errorMsg && <p style={styles.error}>{errorMsg}</p>}

        {posts.length > 0 &&
          posts.map((post) => (
            <div key={post.id} style={styles.postBlock}>
              <p style={styles.line}>
                <strong>ID:</strong> {post.id}
              </p>
              <p style={styles.line}>
                <strong>Title:</strong> {post.title}
              </p>
              <p style={styles.line}>
                <strong>Body:</strong> {post.body}
              </p>
            </div>
          ))}
      </div>
    );
  }
}

const styles = {
  page: {
    textAlign: "center",
    fontFamily: "sans-serif",
  },
  heading: {
    fontSize: "24px",
  },
  error: {
    color: "#a33",
  },
  postBlock: {
    marginBottom: "24px",
  },
  line: {
    margin: "4px 0",
  },
};

export default PostList;
