const sphereForm = document.getElementById("MyForm");
const radiusInput = document.getElementById("radius");
const volumeInput = document.getElementById("volume");

sphereForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const radius = parseFloat(radiusInput.value);

    // Validate: must be a positive number
    if (isNaN(radius) || radius <= 0) {
        alert("Please enter a valid positive number for the radius.");
        return;
    }

    // Formula: V = (4/3) × π × r³
    const volume = (4 / 3) * Math.PI * Math.pow(radius, 3);

    // Display rounded to 4 decimal places
    volumeInput.value = volume.toFixed(4);
});