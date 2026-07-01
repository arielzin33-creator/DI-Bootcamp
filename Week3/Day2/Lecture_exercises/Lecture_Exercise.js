// function sayHi() {
//     console.log("say Hi")
// }

// sayHi()

//params
// function sayHiToUser(username)(
//     console.log('hello, s(username)!')

// )

// sayHiToUser('Ariel')

//return

//function decleration
// function factorialize(num) {
//     newNumber = 1
//     for (let i = 1; i <= num; i++) {
//         newNumber *= i
//     }
//     return newNumber
// }
// plusOne = factorialize(5) + 1
// console.log(plusone)

//different types of functions

// function(a, b) {
//     console.log(a, b)
// }('chicken', 'nugget')

// addStrings(chicken, nugget)

//function experesions
const myFunc = function(a, b) {
    return a ** b
}
console.log(myFunc(9, 4))
    // arrow function

const yourFunc = (x, y) => {
    return x * y + 1
}
console.log(yourFunc(5, 6))

((a, b)) => {
    console.log(a, b)
}('arrow', 'Function')

const square = x => X ** 2;
square(33)