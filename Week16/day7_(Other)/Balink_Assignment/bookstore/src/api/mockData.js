// Local stand-ins for the assignment's Hasura backend, which is unreachable
// (hibernated project — see apiClient.js). Shaped to match what the REST
// endpoints in the brief are expected to return, and used automatically
// whenever a live call fails.
const cover = (seed) => `https://picsum.photos/seed/${seed}/400/560`;
const storePhoto = (seed) => `https://picsum.photos/seed/${seed}/500/300`;

export const MOCK_STORES = [
  {
    id: "store-fnac",
    name: "Fnac",
    address: "136 Rue de Rennes",
    city: "Paris",
    image: storePhoto("fnac-paris-storefront"),
  },
  {
    id: "store-miguel-miranda",
    name: "Miguel Miranda Bookstore",
    address: "C. de Lope de Vega",
    city: "Madrid",
    image: storePhoto("miguel-miranda-madrid"),
  },
  {
    id: "store-harrietts",
    name: "Harrietts Bookshop",
    address: "5 Av.",
    city: "New York",
    image: storePhoto("harrietts-bookshop-ny"),
  },
];

export const MOCK_BOOKS = [
  {
    id: "book-got-1",
    storeId: "store-fnac",
    title: "Game of Thrones",
    author: "George R. R. Martin",
    genre: "Fantasy",
    price: 50,
    rating: 4.8,
    ratingsCount: 320,
    image: cover("got-1"),
    description:
      "In a land where summers can last decades and winters a lifetime, trouble is brewing. " +
      "The cold winds are rising, and in the frozen wastes to the north of Winterfell, sinister " +
      "forces are massing beyond the kingdom's protective Wall.",
    publisher: "Bantam Books",
    language: "English",
    paperback: 694,
  },
  {
    id: "book-foundation",
    storeId: "store-fnac",
    title: "Fundation series",
    author: "Isaac Asimov",
    genre: "Fantasy",
    price: 15,
    rating: 4.6,
    ratingsCount: 150,
    image: cover("foundation-series"),
    description:
      "First published fifteen years ago, shortly after his death, inside this collection " +
      "are some of the finest short stories of science fiction writing from one of the " +
      "genre's greatest writers. Isaac Asimov was the Grand Master of the Science Fiction " +
      "Writers of America, the founder of robot ethics, and one of the world's most " +
      "prolific authors of fiction and non-fiction.",
    publisher: "Bantam Spectra",
    language: "English",
    paperback: 415,
  },
  {
    id: "book-one-piece-101",
    storeId: "store-miguel-miranda",
    title: "One piece 101",
    author: "Oda Sensei",
    genre: "Manga",
    price: 6,
    rating: 4.5,
    ratingsCount: 150,
    image: cover("one-piece-101"),
    description:
      "As a child, Monkey D. Luffy dreamed of becoming King of the Pirates. But his life " +
      "changed when he accidentally gained the power to stretch like rubber...at the cost " +
      "of never being able to swim again! Years later, Luffy sets off in search of the One " +
      "Piece, said to be the greatest treasure in the world...\n\n" +
      "It's a family brawl as Kaido faces off against Yamato! But Kaido and his powerful " +
      "pirates aren't going to go down easily, even against the Straw Hats' best fighters. " +
      "The key to victory may be the peculiar ability of a young girl!",
    publisher: "Viz Media LLC",
    language: "English",
    paperback: 208,
  },
  {
    id: "book-one-piece-102",
    storeId: "store-miguel-miranda",
    title: "One piece 102",
    author: "Oda Sensei",
    genre: "Manga",
    price: 6,
    rating: 4.5,
    ratingsCount: 142,
    image: cover("one-piece-102"),
    description:
      "The battle for Onigashima rages on! As old alliances are tested and new secrets " +
      "come to light, the Straw Hat Pirates push deeper into enemy territory.",
    publisher: "Viz Media LLC",
    language: "English",
    paperback: 208,
  },
  {
    id: "book-one-piece-103",
    storeId: "store-miguel-miranda",
    title: "One piece 103",
    author: "Oda Sensei",
    genre: "Manga",
    price: 6,
    rating: 4.4,
    ratingsCount: 128,
    image: cover("one-piece-103"),
    description:
      "With the fate of Wano hanging in the balance, Luffy and his crew face their " +
      "toughest challenge yet against the forces of Kaido and Big Mom.",
    publisher: "Viz Media LLC",
    language: "English",
    paperback: 208,
  },
  {
    id: "book-robots",
    storeId: "store-fnac",
    title: "Robots series",
    author: "Isaac Asimov",
    genre: "Fantasy",
    price: 15,
    rating: 4.7,
    ratingsCount: 201,
    image: cover("robots-series"),
    description:
      "The stories that established the Three Laws of Robotics and reshaped how the world " +
      "thinks about artificial intelligence, collected together in one volume.",
    publisher: "Bantam Spectra",
    language: "English",
    paperback: 372,
  },
  {
    id: "book-harry-potter-1",
    storeId: "store-harrietts",
    title: "Harry Potter 1",
    author: "J. K. Rowling",
    genre: "Fantasy",
    price: 20,
    rating: 4.9,
    ratingsCount: 512,
    image: cover("harry-potter-1"),
    description:
      "Harry Potter has never been the star of a Quidditch team, scoring points while " +
      "riding a broom far above the ground. He knows no spells, has never helped hatch a " +
      "dragon, and has never worn a cloak of invisibility.",
    publisher: "Bloomsbury",
    language: "English",
    paperback: 332,
  },
  {
    id: "book-harry-potter-2",
    storeId: "store-harrietts",
    title: "Harry Potter 2",
    author: "J. K. Rowling",
    genre: "Fantasy",
    price: 25,
    rating: 4.8,
    ratingsCount: 487,
    image: cover("harry-potter-2"),
    description:
      "The Dursleys were so mean and hideous that summer that all Harry Potter wanted was " +
      "to get back to the Hogwarts School for Witchcraft and Wizardry. But just as he's " +
      "packing his bags, Harry receives a warning from a strange, self-proclaimed house-elf " +
      "named Dobby, who says that if Harry returns to Hogwarts, disaster will strike.",
    publisher: "Bloomsbury",
    language: "English",
    paperback: 341,
  },
];
