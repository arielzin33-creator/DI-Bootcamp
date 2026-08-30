//Exercise 1: Divisible by 23
// Basic version
function displayNumbersDivisible() {
    let sum = 0;

    for (let i = 0; i <= 500; i++) {
        if (i % 23 === 0) {
            console.log(i);
            sum += i;
        }
    }
    console.log("Sum:", sum); // Sum: 5313
}

displayNumbersDivisible();

// Bonus: with divisor parameter
function displayNumbersDivisible(divisor) {
    let sum = 0;

    for (let i = 0; i <= 500; i++) {
        if (i % divisor === 0) {
            console.log(i);
            sum += i;
        }
    }
    console.log("Sum:", sum);
}

displayNumbersDivisible(23); // Sum: 5313
displayNumbersDivisible(3); // Sum: 37memorize
displayNumbersDivisible(45); // Sum: 4995

//Exercise 2: Shopping List
const stock = {
    "banana": 6,
    "apple": 0,
    "pear": 12,
    "orange": 32,
    "blueberry": 1
};

const prices = {
    "banana": 4,
    "apple": 2,
    "pear": 1,
    "orange": 1.5,
    "blueberry": 10
};

const shoppingList = ["banana", "orange", "apple"];

function myBill() {
    let total = 0;

    for (let i = 0; i < shoppingList.length; i++) {
        const item = shoppingList[i];

        if (item in stock && stock[item] > 0) {
            total += prices[item];
            console.log(`${item}: $${prices[item]}`);

            // Bonus: decrease stock by 1
            stock[item] -= 1;
        } else {
            console.log(`${item} is out of stock.`);
        }
    }

    console.log(`Total bill: $${total.toFixed(2)}`);
    return total;
}

myBill();
// banana: $4
// orange: $1.5
// apple is out of stock.
// Total bill: $5.50

//Exercise 3: What's in my Wallet?

function changeEnough(itemPrice, amountOfChange) {
    const quarterValue = 0.25;
    const dimeValue = 0.10;
    const nickelValue = 0.05;
    const pennyValue = 0.01;

    const totalChange =
        amountOfChange[0] * quarterValue +
        amountOfChange[1] * dimeValue +
        amountOfChange[2] * nickelValue +
        amountOfChange[3] * pennyValue;

    console.log(`Total change: $${totalChange.toFixed(2)}`);
    return totalChange >= itemPrice;
}

console.log(changeEnough(4.25, [25, 20, 5, 0])); // true  → $8.50
console.log(changeEnough(14.11, [2, 100, 0, 0])); // false → $10.50
console.log(changeEnough(0.75, [0, 0, 20, 5])); // true  → $1.05

//Exercise 4: Vacation Costs

function hotelCost() {
    let nights;

    while (true) {
        nights = parseFloat(prompt("How many nights would you like to stay?"));
        if (!isNaN(nights) && nights > 0) break;
        alert("Please enter a valid number of nights.");
    }

    return nights * 140;
}

function planeRideCost() {
    let destination;

    while (true) {
        destination = prompt("What is your destination?");
        if (destination && typeof destination === "string" && destination.trim() !== "") break;
        alert("Please enter a valid destination.");
    }

    destination = destination.trim();

    if (destination === "London") return 183;
    if (destination === "Paris") return 220;
    return 300;
}

function rentalCarCost() {
    let days;

    while (true) {
        days = parseFloat(prompt("How many days would you like to rent a car?"));
        if (!isNaN(days) && days > 0) break;
        alert("Please enter a valid number of days.");
    }

    let cost = days * 40;

    // 5% discount for more than 10 days
    if (days > 10) {
        cost = cost * 0.95;
        console.log("5% discount applied!");
    }

    return cost;
}

function totalVacationCost() {
    const hotel = hotelCost();
    const plane = planeRideCost();
    const car = rentalCarCost();
    const total = hotel + plane + car;

    console.log(`The car cost: $${car.toFixed(2)}`);
    console.log(`The hotel cost: $${hotel.toFixed(2)}`);
    console.log(`The plane tickets cost: $${plane.toFixed(2)}`);
    console.log(`Total vacation cost: $${total.toFixed(2)}`);

    return total;
}

totalVacationCost();