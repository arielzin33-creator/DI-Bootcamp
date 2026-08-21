import { createContext, useContext, useEffect, useMemo, useReducer } from "react";

const CartContext = createContext(null);

const STORAGE_KEY = "bookstore-cart";

function loadInitialCart() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function cartReducer(items, action) {
  switch (action.type) {
    case "ADD_ITEM": {
      const existing = items.find((item) => item.id === action.book.id);
      if (existing) {
        return items.map((item) =>
          item.id === action.book.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...items, { ...action.book, quantity: 1 }];
    }
    case "REMOVE_ITEM":
      return items.filter((item) => item.id !== action.bookId);
    case "SET_QUANTITY":
      return items
        .map((item) =>
          item.id === action.bookId ? { ...item, quantity: Math.max(1, action.quantity) } : item
        );
    case "CLEAR_CART":
      return [];
    default:
      return items;
  }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(cartReducer, undefined, loadInitialCart);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const value = useMemo(() => {
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const total = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
    return {
      items,
      itemCount,
      total,
      addItem: (book) => dispatch({ type: "ADD_ITEM", book }),
      removeItem: (bookId) => dispatch({ type: "REMOVE_ITEM", bookId }),
      setQuantity: (bookId, quantity) => dispatch({ type: "SET_QUANTITY", bookId, quantity }),
      clearCart: () => dispatch({ type: "CLEAR_CART" }),
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
