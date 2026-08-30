////Exercise 5: Users
// --- Part 1: DOM Manipulation ---

// Retrieve and log the div
const container = document.getElementById("container");
console.log(container);

// Change "Pete" to "Richard"
const allLists = document.querySelectorAll(".list");
allLists[0].children[1].textContent = "Richard";

// Delete the second <li> of the second <ul>
allLists[1].children[1].remove();

// Change the first <li> of each <ul> to your name
for (let i = 0; i < allLists.length; i++) {
    allLists[i].children[0].textContent = "Alex";
}

// --- Part 2: Classes ---

// Add "student_list" to both <ul>'s
for (let i = 0; i < allLists.length; i++) {
    allLists[i].classList.add("student_list");
}

// Add "university" and "attendance" to the first <ul>
allLists[0].classList.add("university", "attendance");

// --- Part 3: Styles ---

// Light blue background and padding on the div
container.style.backgroundColor = "lightblue";
container.style.padding = "10px";

// Hide "Dan" (last <li> of the second <ul> — now first after deletion)
// After deleting Sarah, Dan is at index 1
allLists[1].children[1].style.display = "none";

// Border on "Richard" (second <li> of first <ul>)
allLists[0].children[1].style.border = "2px solid black";

// Change font size of the whole body
document.body.style.fontSize = "18px";

// --- Bonus ---
if (container.style.backgroundColor === "lightblue") {
    const names = container.querySelectorAll ?
        [] // div has no li's, so we read from the lists
        :
        [];

    // Collect all visible names from both lists
    const visibleNames = [];
    for (let i = 0; i < allLists.length; i++) {
        for (let j = 0; j < allLists[i].children.length; j++) {
            const li = allLists[i].children[j];
            if (li.style.display !== "none") {
                visibleNames.push(li.textContent);
            }
        }
    }
    alert("Hello " + visibleNames.join(" and "));
}