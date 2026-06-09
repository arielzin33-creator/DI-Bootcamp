document.getElementById("nameForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const data = {
        name: document.getElementById("name").value,
        lastName: document.getElementById("lastName").value,
    };

    document.getElementById("output").textContent = JSON.stringify(data, null, 2);
});