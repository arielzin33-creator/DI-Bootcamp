import { createSlice, nanoid } from '@reduxjs/toolkit'

const initialState = {
  items: [
    { id: 1, title: 'The Shining', author: 'Stephen King', genre: 'Horror' },
    { id: 2, title: 'It', author: 'Stephen King', genre: 'Horror' },
    { id: 3, title: 'Dracula', author: 'Bram Stoker', genre: 'Horror' },
    { id: 4, title: 'The Hobbit', author: 'J.R.R. Tolkien', genre: 'Fantasy' },
    { id: 5, title: 'A Game of Thrones', author: 'George R.R. Martin', genre: 'Fantasy' },
    { id: 6, title: 'The Name of the Wind', author: 'Patrick Rothfuss', genre: 'Fantasy' },
    { id: 7, title: 'Dune', author: 'Frank Herbert', genre: 'Science Fiction' },
    { id: 8, title: 'Foundation', author: 'Isaac Asimov', genre: 'Science Fiction' },
    { id: 9, title: 'Neuromancer', author: 'William Gibson', genre: 'Science Fiction' },
    { id: 10, title: 'Pride and Prejudice', author: 'Jane Austen', genre: 'Romance' },
    { id: 11, title: 'Murder on the Orient Express', author: 'Agatha Christie', genre: 'Mystery' },
  ],
}

const booksSlice = createSlice({
  name: 'books',
  initialState,
  reducers: {
    addBook: {
      reducer(state, action) {
        state.items.push(action.payload)
      },
      prepare(title, author, genre) {
        return { payload: { id: nanoid(), title, author, genre } }
      },
    },
  },
})

export const { addBook } = booksSlice.actions
export default booksSlice.reducer
