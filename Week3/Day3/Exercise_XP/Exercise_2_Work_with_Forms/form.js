// 1. Retrieve and log the form
const form = document.getElementById("myForm");
console.log(form);

// 2. Retrieve inputs by id
const fnameById = document.getElementById("fname");
const lnameById = document.getElementById("lname");
console.log(fnameById);
console.log(lnameById);

// 3. Retrieve inputs by name attribute
const fnameByName = document.querySelector("[name='firstname']");
const lnameByName = document.querySelector("[name='lastname']");
console.log(fnameByName);
console.log(lnameByName);

// 4. Handle form submission
form.addEventListener("submit", function(event) {

    // Prevents the page from reloading on submit —
    // without this the browser would send the form data
    // and immediately refresh, wiping our JS work
    event.preventDefault();

    const firstName = fnameById.value.trim();
    const lastName = lnameById.value.trim();

    // Make sure inputs are not empty
    if (firstName === "" || lastName === "") {
        alert("Please fill in both fields.");
        return;
    }

    const ul = document.querySelector(".usersAnswer");

    const liFirst = document.createElement("li");
    liFirst.textContent = firstName;

    const liLast = document.createElement("li");
    liLast.textContent = lastName;

    ul.appendChild(liFirst);
    ul.appendChild(liLast);

    // Clear the inputs after submission
    fnameById.value = "";
    lnameById.value = "";
});