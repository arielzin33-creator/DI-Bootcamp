// Second Part: hide totalTip on page load
document.getElementById("totalTip").style.display = "none";

// Attach calculateTip to the calculate button
document.getElementById("calculate").onclick = calculateTip;

function calculateTip() {

    // Step 1: Fetch input values
    const billAmount = document.getElementById("billAmt").value;
    const serviceQuality = document.getElementById("serviceQual").value;
    let numberOfPeople = document.getElementById("numOfPeople").value;

    // Step 2: Validate bill and service quality
    if (serviceQuality == 0 || billAmount === "") {
        alert("Please enter a bill amount and select a service quality.");
        return;
    }

    // Step 3: Handle empty or invalid number of people
    const eachTag = document.getElementById("each");

    if (numberOfPeople === "" || numberOfPeople < 1) {
        numberOfPeople = 1;
        eachTag.style.display = "none";
    } else {
        eachTag.style.display = "inline";
    }

    // Step 4: Calculate the tip per person
    let total = (billAmount * serviceQuality) / numberOfPeople;

    // Step 5: Round to 2 decimal places
    total = total.toFixed(2);

    // Step 6: Show the result
    document.getElementById("totalTip").style.display = "block";
    document.getElementById("tip").textContent = total;
}