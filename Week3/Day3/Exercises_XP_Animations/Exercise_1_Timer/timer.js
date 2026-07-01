const container = document.getElementById("container");
const clearBtn = document.getElementById("clear");

// ---- Part I ----
// Alert "Hello World" after 2 seconds
setTimeout(function() {
    alert("Hello World");
}, 2000);


// ---- Part II ----
// Add a <p>Hello World</p> to the div after 2 seconds
setTimeout(function() {
    const p = document.createElement("p");
    p.textContent = "Hello World";
    container.appendChild(p);
}, 2000);


// ---- Part III ----
// Add a new <p> every 2 seconds
const interval = setInterval(function() {
    const p = document.createElement("p");
    p.textContent = "Hello World";
    container.appendChild(p);

    // Stop automatically when there are 5 paragraphs
    const allParagraphs = container.querySelectorAll("p");
    if (allParagraphs.length >= 5) {
        clearInterval(interval);
        console.log("Interval cleared: 5 paragraphs reached.");
    }
}, 2000);

// Stop when the button is clicked
clearBtn.addEventListener("click", function() {
    clearInterval(interval);
    console.log("Interval cleared by button click.");
});