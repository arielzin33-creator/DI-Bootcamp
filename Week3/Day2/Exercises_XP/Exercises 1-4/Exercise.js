//Exercise 1 : Find the numbers divisible by 23
function displayNumbersDivisible(divisor = 23) {
    for (let i = 0; i < 500; i++)
        if (i % divisor === 0) {
            console.log(i)
            sum += i
        }
}
displayNumbersDivisible(); // default: divisor = 23

// Exercise 2 : Shopping List
const stock = {
    "banana": 6,
    "apple": 0,
    "pear": 12,
    "orange": 32,
    "blueberry": 1
}

const prices = {
    "banana": 4,
    "apple": 2,
    "pear": 1,
    "orange": 1.5,
    "blueberry": 10
}

const shoppingList = ["banana", "orange", "apple"];

function myBill() {
    let total = 0;

    for (const item of shoppingList) {
        if (item in stock && stock[item] > 0) {
            total += prices[item];
        } else {
            console.log(`${item} is out of stock`);
        }
    }

    console.log("Total bill: $" + total.toFixed(2));
    return total;
}

myBill();

//Exercise 3 : What’s in my wallet?

function changeEnough(itemPrice, amountOfChange) {
    const [quarters, dimes, nickels, pennies] = amountOfChange;
    const total = quarters * 0.25 + dimes * 0.10 + nickels * 0.05 + pennies * 0.01;
}

return Math.round(total * 100) >= Math.round(itemPrice * 100);

//Exercise 4 : Vacations Costs
function hotelCost() {
    let numberNights
    do {
        numberNights = prompt("How many nights do you wish for?")
    }
    while {
        if (numberNights !== NaN)
            return let numberNights * 140
    }
}