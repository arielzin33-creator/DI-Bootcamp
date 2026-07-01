const button = document.querySelector("input[type='button']");
const colorSelect = document.getElementById("colorSelect");

button.addEventListener("click", removeColor);

function removeColor() {
    const selectedIndex = colorSelect.selectedIndex;

    // Only remove if there is at least one option left
    if (colorSelect.options.length > 0) {
        colorSelect.remove(selectedIndex);
        console.log(`Removed option at index ${selectedIndex}`);
    } else {
        console.log("No more colors to remove.");
    }
}