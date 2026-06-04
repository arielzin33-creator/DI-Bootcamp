let client = "John";

const groceries = {
    fruits: ["pear", "apple", "banana"],
    vegetables: ["tomatoes", "cucumber", "salad"],
    totalPrice: "20$",
    other: {
        paid: true,
        meansOfPayment: ["cash", "creditCard"]
    }
}

let displayGroceries = (fruits) => fruits.forEach(fruit => console.log(fruit));

displayGroceries(groceries.fruits);


let cloneGroceries = () => {
    let user = client
    client = "Betty"

    console.log("user:", user); // John  - unchanged copy
    console.log("client:", client); // Betty - original changed
}

cloneGroceries();