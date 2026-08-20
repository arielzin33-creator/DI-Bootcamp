import { createSlice } from '@reduxjs/toolkit';

/**
 * Genre constants.
 *
 * Genres are stored as machine-readable keys, never as display strings.
 * If the label ever changes ("Sci-Fi" -> "Science Fiction"), no stored
 * record and no selector has to change with it.
 */
export const GENRES = {
  HORROR: 'horror',
  FANTASY: 'fantasy',
  SCIENCE_FICTION: 'science-fiction',
};

export const GENRE_LABELS = {
  [GENRES.HORROR]: 'Horror',
  [GENRES.FANTASY]: 'Fantasy',
  [GENRES.SCIENCE_FICTION]: 'Science fiction',
};

/** Sentinel used by the UI to mean "no genre filter applied". */
export const ALL_GENRES = 'all';

/**
 * Mock inventory. In a real application this would arrive from an API via a
 * thunk or RTK Query; the shape of the state is deliberately identical either
 * way so that swapping the data source later touches nothing else.
 */
const initialBooks = [
  { id: 1, title: 'The Haunting of Hill House', author: 'Shirley Jackson', genre: GENRES.HORROR, year: 1959 },
  { id: 2, title: 'Dracula', author: 'Bram Stoker', genre: GENRES.HORROR, year: 1897 },
  { id: 3, title: 'The Shining', author: 'Stephen King', genre: GENRES.HORROR, year: 1977 },
  { id: 4, title: 'A Wizard of Earthsea', author: 'Ursula K. Le Guin', genre: GENRES.FANTASY, year: 1968 },
  { id: 5, title: 'The Hobbit', author: 'J. R. R. Tolkien', genre: GENRES.FANTASY, year: 1937 },
  { id: 6, title: 'Jonathan Strange & Mr Norrell', author: 'Susanna Clarke', genre: GENRES.FANTASY, year: 2004 },
  { id: 7, title: 'Dune', author: 'Frank Herbert', genre: GENRES.SCIENCE_FICTION, year: 1965 },
  { id: 8, title: 'Neuromancer', author: 'William Gibson', genre: GENRES.SCIENCE_FICTION, year: 1984 },
  { id: 9, title: 'The Left Hand of Darkness', author: 'Ursula K. Le Guin', genre: GENRES.SCIENCE_FICTION, year: 1969 },
  { id: 10, title: 'Solaris', author: 'Stanisław Lem', genre: GENRES.SCIENCE_FICTION, year: 1961 },
];

const initialState = {
  items: initialBooks,
  /** Which genre the catalogue is currently filtered to. */
  selectedGenre: ALL_GENRES,
};

const booksSlice = createSlice({
  name: 'books',
  initialState,
  reducers: {
    genreSelected(state, action) {
      state.selectedGenre = action.payload;
    },
    bookAdded: {
      reducer(state, action) {
        state.items.push(action.payload);
      },
      // `prepare` keeps ID generation out of the reducer, which must stay pure.
      prepare({ title, author, genre, year }) {
        return { payload: { id: Date.now(), title, author, genre, year } };
      },
    },
    bookRemoved(state, action) {
      state.items = state.items.filter((book) => book.id !== action.payload);
    },
  },
});

export const { genreSelected, bookAdded, bookRemoved } = booksSlice.actions;
export default booksSlice.reducer;
