import React from "react";
import axios from "axios";

const API_URL = "https://jsonplaceholder.typicode.com/posts";

/**
 * PostForm
 *
 * State holds userId, title, and body. All three inputs share a
 * single onChange handler that reads `name` off the event target, so
 * one method updates whichever field the user is typing in — instead
 * of writing three near-identical handlers.
 */
class PostForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userId: "",
      title: "",
      body: "",
    };
  }

  handleChange = (event) => {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  };

  handleSubmit = async (event) => {
    event.preventDefault();

    const { userId, title, body } = this.state;

    const response = await axios.post(API_URL, { userId, title, body });
    console.log(response.data);
  };

  render() {
    // Destructured here, then used below to set each input's value —
    // per the exercise's instruction to destructure state before use.
    const { userId, title, body } = this.state;

    return (
      <form onSubmit={this.handleSubmit} style={styles.form}>
        <input
          type="number"
          name="userId"
          placeholder="User ID"
          value={userId}
          onChange={this.handleChange}
          style={styles.input}
        />

        <input
          type="text"
          name="title"
          placeholder="Title"
          value={title}
          onChange={this.handleChange}
          style={styles.input}
        />

        <textarea
          name="body"
          placeholder="Body"
          value={body}
          onChange={this.handleChange}
          style={styles.textarea}
        />

        <button type="submit" style={styles.button}>
          Submit
        </button>
      </form>
    );
  }
}

const styles = {
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    maxWidth: "320px",
    fontFamily: "sans-serif",
  },
  input: {
    padding: "8px 10px",
    fontSize: "14px",
    borderRadius: "6px",
    border: "1px solid #ccc",
  },
  textarea: {
    padding: "8px 10px",
    fontSize: "14px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    minHeight: "80px",
    fontFamily: "inherit",
    resize: "vertical",
  },
  button: {
    padding: "8px 14px",
    fontSize: "14px",
    borderRadius: "6px",
    border: "1px solid #1e1e1e",
    backgroundColor: "#1e1e1e",
    color: "#fff",
    cursor: "pointer",
    alignSelf: "flex-start",
  },
};

export default PostForm;
