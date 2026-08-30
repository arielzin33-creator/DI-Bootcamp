// ============================
// Interfaces & Types
// ============================

interface Book {
  isbn: string;
  title: string;
  author: string;
  copies: number;
  availableCopies: number;
}

interface Member {
  id: string;
  name: string;
  borrowedBooks: string[]; // array of ISBNs
}

// ============================
// Library Class
// ============================

class Library {
  private books: Book[] = [];
  private members: Member[] = [];

  // ---------- Book management ----------

  addBook(isbn: string, title: string, author: string, copies: number = 1): void {
    const existingBook = this.books.find(book => book.isbn === isbn);

    if (existingBook) {
      // If the book already exists, just increase the copy count
      existingBook.copies += copies;
      existingBook.availableCopies += copies;
      console.log(`Added ${copies} more copies of "${title}". Total copies: ${existingBook.copies}`);
      return;
    }

    const newBook: Book = {
      isbn,
      title,
      author,
      copies,
      availableCopies: copies
    };

    this.books.push(newBook);
    console.log(`Book "${title}" by ${author} added to the library.`);
  }

  removeBook(isbn: string): void {
    const index = this.books.findIndex(book => book.isbn === isbn);

    if (index === -1) {
      console.log(`No book found with ISBN ${isbn}.`);
      return;
    }

    const book = this.books[index];

    if (book.availableCopies < book.copies) {
      console.log(`Cannot remove "${book.title}" — some copies are currently borrowed.`);
      return;
    }

    this.books.splice(index, 1);
    console.log(`Book "${book.title}" removed from the library.`);
  }

  findBookByTitle(title: string): Book | undefined {
    return this.books.find(book => book.title.toLowerCase() === title.toLowerCase());
  }

  findBookByIsbn(isbn: string): Book | undefined {
    return this.books.find(book => book.isbn === isbn);
  }

  listAvailableBooks(): void {
    const available = this.books.filter(book => book.availableCopies > 0);

    if (available.length === 0) {
      console.log("No books currently available.");
      return;
    }

    console.log("Available books:");
    available.forEach(book => {
      console.log(`- "${book.title}" by ${book.author} (${book.availableCopies}/${book.copies} available)`);
    });
  }

  // ---------- Member management ----------

  registerMember(id: string, name: string): void {
    const existingMember = this.members.find(member => member.id === id);

    if (existingMember) {
      console.log(`Member with ID ${id} is already registered.`);
      return;
    }

    const newMember: Member = { id, name, borrowedBooks: [] };
    this.members.push(newMember);
    console.log(`Member "${name}" (ID: ${id}) registered.`);
  }

  findMemberById(id: string): Member | undefined {
    return this.members.find(member => member.id === id);
  }

  // ---------- Borrowing / Returning ----------

  borrowBook(memberId: string, isbn: string): void {
    const member = this.findMemberById(memberId);
    const book = this.findBookByIsbn(isbn);

    if (!member) {
      console.log(`No member found with ID ${memberId}.`);
      return;
    }

    if (!book) {
      console.log(`No book found with ISBN ${isbn}.`);
      return;
    }

    if (book.availableCopies <= 0) {
      console.log(`Sorry, "${book.title}" has no available copies right now.`);
      return;
    }

    if (member.borrowedBooks.includes(isbn)) {
      console.log(`${member.name} has already borrowed "${book.title}".`);
      return;
    }

    book.availableCopies -= 1;
    member.borrowedBooks.push(isbn);
    console.log(`${member.name} borrowed "${book.title}". Copies left: ${book.availableCopies}`);
  }

  returnBook(memberId: string, isbn: string): void {
    const member = this.findMemberById(memberId);
    const book = this.findBookByIsbn(isbn);

    if (!member) {
      console.log(`No member found with ID ${memberId}.`);
      return;
    }

    if (!book) {
      console.log(`No book found with ISBN ${isbn}.`);
      return;
    }

    const borrowedIndex = member.borrowedBooks.indexOf(isbn);

    if (borrowedIndex === -1) {
      console.log(`${member.name} did not borrow "${book.title}".`);
      return;
    }

    member.borrowedBooks.splice(borrowedIndex, 1);
    book.availableCopies += 1;
    console.log(`${member.name} returned "${book.title}". Copies available: ${book.availableCopies}`);
  }

  listBorrowedBooks(memberId: string): void {
    const member = this.findMemberById(memberId);

    if (!member) {
      console.log(`No member found with ID ${memberId}.`);
      return;
    }

    if (member.borrowedBooks.length === 0) {
      console.log(`${member.name} has no borrowed books.`);
      return;
    }

    console.log(`${member.name}'s borrowed books:`);
    member.borrowedBooks.forEach(isbn => {
      const book = this.findBookByIsbn(isbn);
      if (book) {
        console.log(`- "${book.title}" by ${book.author}`);
      }
    });
  }
}

// ============================
// Demonstration / Usage
// ============================

const library = new Library();

// Add books
library.addBook("978-0-13-468599-1", "Effective TypeScript", "Dan Vanderkam", 2);
library.addBook("978-1-59327-584-6", "Eloquent JavaScript", "Marijn Haverbeke", 1);
library.addBook("978-0-596-51774-8", "JavaScript: The Good Parts", "Douglas Crockford", 3);

// Register members
library.registerMember("M001", "Sophie Martin");
library.registerMember("M002", "James Cohen");

// List available books
library.listAvailableBooks();

// Borrow books
library.borrowBook("M001", "978-0-13-468599-1");
library.borrowBook("M002", "978-1-59327-584-6");

// Try borrowing the last copy of a single-copy book (should fail since it's now unavailable)
library.borrowBook("M001", "978-1-59327-584-6");

// List borrowed books for a member
library.listBorrowedBooks("M001");

// Return a book
library.returnBook("M001", "978-0-13-468599-1");

// List available books again to confirm the return worked
library.listAvailableBooks();

// Try removing a book that still has borrowed copies (should fail if applicable)
library.removeBook("978-0-596-51774-8");