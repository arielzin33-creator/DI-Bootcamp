const emailForm = document.getElementById("emailForm");
const emailInput = document.getElementById("emailInput");
const message = document.getElementById("message");

emailForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const value = emailInput.value.trim();

    // --- Version 1: Without regex ---
    // Manual character-by-character validation
    function validateWithoutRegex(email) {
        const atIndex = email.indexOf("@");

        // Must contain exactly one "@"
        if (atIndex <= 0) return false;

        const dotIndex = email.indexOf(".", atIndex);

        // Must contain a "." after the "@"
        if (dotIndex <= atIndex + 1) return false;

        // Must have characters after the last "."
        if (dotIndex >= email.length - 1) return false;

        return true;
    }

    // --- Version 2: With regex ---
    // Breakdown:
    // ^[^\s@]+   → one or more valid characters before "@"
    // @          → the "@" sign
    // [^\s@]+    → one or more characters after "@" (the domain)
    // \.         → a literal dot
    // [^\s@]+$   → one or more characters after the dot (the TLD)
    function validateWithRegex(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    const isValidManual = validateWithoutRegex(value);
    const isValidRegex = validateWithRegex(value);

    console.log("Manual validation:", isValidManual);
    console.log("Regex validation:", isValidRegex);

    if (isValidRegex) {
        message.className = "success";
        message.textContent = `✓ "${value}" is a valid email address.`;
    } else {
        message.className = "error";
        message.textContent = `✗ "${value}" is not a valid email address.`;
    }
});