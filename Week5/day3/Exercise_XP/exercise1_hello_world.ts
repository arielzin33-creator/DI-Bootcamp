//Exercise 1: Hello, World! Program
const phrase = (word1: string, word2: string): string => {
  const result = `${word1} ${word2}`;
  console.log(result);
  return result;}


phrase("Hello", "World"); // logs: "Hello World"
