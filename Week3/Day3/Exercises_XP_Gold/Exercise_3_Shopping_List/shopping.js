// 1. Empty array to hold the shopping list items
let shoppingList = [];

const root = document.getElementById("root");

// ---- Build the UI entirely from JS ----

// 2. Create the form with a text input and "Add Item" button
const form = document.createElement("form");

const textInput = document.createElement("input");
textInput.type = "text";
textInput.placeholder = "Enter an item...";
textInput.id = "itemInput";

const addBtn = document.createElement("button");
addBtn.textContent = "Add Item";
addBtn.type = "button"; // prevents form from submitting

form.appendChild(textInput);
form.appendChild(addBtn);

// 4. Create the "Clear All" button
const clearBtn = document.createElement("button");
clearBtn.textContent = "Clear All";
clearBtn.type = "button";

// Create a <ul> to display the list
const ul = document.createElement("ul");
ul.id = "shoppingListDisplay";

// Append everything to the root div
root.appendChild(form);
root.appendChild(clearBtn);
root.appendChild(ul);

// ---- Functions ----

// 3. Add item to the array and render it
function addItem() {
    const value = textInput.value.trim();

    if (value === "") {
        alert("Please enter an item.");
        return;
    }

    // Add to the array
    shoppingList.push(value);

    // Render the new item in the list
    const li = document.createElement("li");
    li.textContent = value;
    ul.appendChild(li);

    // Clear the input field
    textInput.value = "";

    console.log("Shopping list:", shoppingList);
}

// 5. Clear all items from the array and the DOM
function clearAll() {
    shoppingList = [];
    ul.innerHTML = "";
    console.log("Shopping list cleared.");
}

// ---- Event Listeners ----
addBtn.addEventListener("click", addItem);
clearBtn.addEventListener("click", clearAll);

// Allow pressing Enter to add an item
textInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        addItem();
    }
});