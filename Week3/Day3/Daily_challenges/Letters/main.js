const input = document.getElementById("letterInput");
const feedback = document.getElementById("feedback");
const indicator = document.getElementById("indicator");
const charCount = document.getElementById("charCount");

input.addEventListener("input", function() {
    const originalValue = input.value;

    // Remove any character that is NOT a letter (a-z or A-Z)
    // The regex /[^a-zA-Z]/g matches everything that is not a letter
    // and replaces it with an empty string
    const cleanedValue = originalValue.replace(/[^a-zA-Z]/g, "");

    // If the value changed, an invalid character was typed
    if (cleanedValue !== originalValue) {
        input.value = cleanedValue;

        // Flash red border and shake animation
        input.classList.remove("valid");
        input.classList.add("invalid-flash");
        indicator.textContent = "❌";
        feedback.textContent = "Only letters (A–Z) are allowed.";

        // Remove the flash class after animation completes
        // so it can be re-triggered on the next invalid key
        setTimeout(function() {
            input.classList.remove("invalid-flash");
        }, 300);

    } else if (cleanedValue.length > 0) {
        // Valid input
        input.classList.add("valid");
        input.classList.remove("invalid-flash");
        indicator.textContent = "✅";
        feedback.textContent = "";

    } else {
        // Input is empty
        input.classList.remove("valid", "invalid-flash");
        indicator.textContent = "";
        feedback.textContent = "";
    }

    // Update character counter
    charCount.textContent = `Characters: ${cleanedValue.length}`;
});