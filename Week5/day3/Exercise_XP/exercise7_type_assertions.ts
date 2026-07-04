//Exercise 7: Type Assertions

const inputElement = document.getElementById("username")

const typedInput = inputElement as HTMLInputElement

typedInput.value = "Alice"
console.log (typedInput.value)
