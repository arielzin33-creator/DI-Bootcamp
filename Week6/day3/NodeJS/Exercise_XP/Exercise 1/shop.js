const products = require("./products");

function findProductByName(name) {
    return products.find(
        (product) => product.name.toLowerCase() === name.toLowerCase()
    );
}

function printProductDetails(name) {
    const product = findProductByName(name);

    if (product) {
        console.log(
            `Name: ${product.name} | Price: $${product.price} | Category: ${product.category}`
        );
    } else {
        console.log(`Product "${name}" not found.`);
    }
}

// Test with different product names
printProductDetails("Laptop");
printProductDetails("Tablet"); // not in the list, to test the "not found" case
printProductDetails("Coffee Mug");
printProductDetails("Backpack");