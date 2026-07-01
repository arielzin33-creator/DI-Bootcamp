const geoBtn = document.getElementById("geoBtn");
const result = document.getElementById("result");

geoBtn.addEventListener("click", function() {

    // Check if the browser supports geolocation
    if (!navigator.geolocation) {
        result.className = "error";
        result.textContent = "Geolocation is not supported by your browser.";
        return;
    }

    result.textContent = "Fetching your location...";

    // Success callback
    function onSuccess(position) {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        console.log(`Latitude:  ${latitude}`);
        console.log(`Longitude: ${longitude}`);

        result.innerHTML =
            `<strong>Latitude:</strong>  ${latitude}<br>
       <strong>Longitude:</strong> ${longitude}`;
    }

    // Error callback
    function onError(error) {
        result.className = "error";

        switch (error.code) {
            case error.PERMISSION_DENIED:
                result.textContent = "Permission denied. Please allow location access.";
                break;
            case error.POSITION_UNAVAILABLE:
                result.textContent = "Location information is unavailable.";
                break;
            case error.TIMEOUT:
                result.textContent = "The request to get location timed out.";
                break;
            default:
                result.textContent = "An unknown error occurred.";
        }
    }

    // Options for the geolocation request
    const options = {
        enableHighAccuracy: true, // request the most precise location available
        timeout: 10000, // wait up to 10 seconds
        maximumAge: 0 // do not use a cached position
    };

    navigator.geolocation.getCurrentPosition(onSuccess, onError, options);
});