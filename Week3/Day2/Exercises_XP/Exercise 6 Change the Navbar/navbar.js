// navbar.js:
// 1. Change id from "navBar" to "socialNetworkNavigation"
const navBar = document.getElementById("navBar");
navBar.setAttribute("id", "socialNetworkNavigation");

// 2. Add a new <li> with "Logout"
const ul = document.querySelector("#socialNetworkNavigation ul");

const newLi = document.createElement("li");
const newLink = document.createElement("a");
const logoutText = document.createTextNode("Logout");

newLink.setAttribute("href", "#");
newLink.appendChild(logoutText);
newLi.appendChild(newLink);
ul.appendChild(newLi);

// 3. First and last <li> using firstElementChild / lastElementChild
const firstLi = ul.firstElementChild;
const lastLi = ul.lastElementChild;

console.log("First link:", firstLi.textContent); // "Profile"
console.log("Last link:", lastLi.textContent); // "Logout"