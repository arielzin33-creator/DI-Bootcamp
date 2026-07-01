const select = document.getElementById("genres");
const display = document.getElementById("display");

// 1. Display the currently selected value
display.textContent = `Selected genre: ${select.value}`;

// Update the display whenever the user picks a different option
select.addEventListener("change", function() {
    display.textContent = `Selected genre: ${select.value}`;
});

// 2. Add a new "Classic" option
const newOption = document.createElement("option");
newOption.value = "classic";
newOption.textContent = "Classic";
select.appendChild(newOption);

// 3. Make the newly added option selected by default
select.value = "classic";
display.textContent = `Selected genre: ${select.value}`;