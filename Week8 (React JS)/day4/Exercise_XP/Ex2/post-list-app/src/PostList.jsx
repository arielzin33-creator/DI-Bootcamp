import React from "react";
import posts from "./data/posts.json";

/**
 * PostList
 *
 * Reads the array of post objects from posts.json (imported directly —
 * Vite, like most modern bundlers, supports importing .json files as
 * plain JS data with no extra config) and renders each post's title
 * and content.
 */
export default function PostList() {
  return (
    <div style={styles.list}>
      {posts.map((post) => (
        <article key={post.id} style={styles.card}>
          <h2 style={styles.title}>{post.title}</h2>
          <p style={styles.content}>{post.content}</p>
        </article>
      ))}
    </div>
  );
}

const styles = {
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    maxWidth: "480px",
    fontFamily: "sans-serif",
  },
  card: {
    padding: "16px 20px",
    borderRadius: "8px",
    border: "1px solid #e0e0e0",
  },
  title: {
    margin: "0 0 8px",
    fontSize: "18px",
  },
  content: {
    margin: 0,
    fontSize: "14px",
    color: "#444",
    lineHeight: 1.5,
  },
};
