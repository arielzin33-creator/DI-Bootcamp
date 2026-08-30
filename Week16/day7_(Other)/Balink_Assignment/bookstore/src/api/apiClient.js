import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { MOCK_BOOKS, MOCK_STORES } from "./mockData";

// The assignment's Hasura backend (both this REST API and the bonus GraphQL
// endpoint) is currently hibernated/unreachable — every route returns a
// Hasura "project not reachable" error page. Rather than hardcode mock data,
// every function below still makes the real call first and only falls back
// to local mock data on failure, so the app starts using the real API
// automatically the moment Balink's project comes back online — no code
// changes needed.
const BASE_URL = "https://logical-calf-89.hasura.app/api/rest";
const http = axios.create({ baseURL: BASE_URL, timeout: 6000 });

function delay(value, ms = 300) {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export async function fetchStores() {
  try {
    const { data } = await http.get("/stores");
    return data.stores ?? data;
  } catch {
    return delay(MOCK_STORES);
  }
}

export async function fetchBooks() {
  try {
    const { data } = await http.get("/books");
    return data.books ?? data;
  } catch {
    return delay(MOCK_BOOKS);
  }
}

export async function fetchBook(bookId) {
  try {
    const { data } = await http.get(`/books/${bookId}`);
    const book = data.books_by_pk ?? data.book ?? data;
    if (!book) throw new Error("Book not found");
    return book;
  } catch {
    const book = MOCK_BOOKS.find((b) => b.id === bookId);
    if (!book) throw new Error("Book not found");
    return delay(book);
  }
}

export async function createOrder(order) {
  try {
    const { data } = await http.post("/orders", order);
    const id = data.id ?? data.order?.id ?? data.insert_orders_one?.id;
    if (!id) throw new Error("No order id in response");
    return { id };
  } catch {
    return delay({ id: uuidv4() }, 500);
  }
}
