const allBooks = [{
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        image: "https://upload.wikimedia.org/wikipedia/commons/7/7a/The_Great_Gatsby_Cover_1925_Retouched.jpg",
        alreadyRead: true
    },
    {
        title: "To Kill a Mockingbird",
        author: "Harper Lee",
        image: "https://upload.wikimedia.org/wikipedia/commons/4/4f/To_Kill_a_Mockingbird_%28first_edition_cover%29.jpg",
        alreadyRead: false
    }
];

const section = document.querySelector(".listBooks");

for (let i = 0; i < allBooks.length; i++) {
    const book = allBooks[i];

    // Create a div for each book
    const bookDiv = document.createElement("div");

    // Create and set the image
    const img = document.createElement("img");
    img.src = book.image;
    img.width = 100;

    // Create the description text
    const description = document.createElement("p");
    description.textContent = `${book.title} written by ${book.author}`;

    // If already read, color the text red
    if (book.alreadyRead) {
        bookDiv.style.color = "red";
    }

    // Append image and description to the div
    bookDiv.appendChild(img);
    bookDiv.appendChild(description);

    // Append the div to the section
    section.appendChild(bookDiv);
}