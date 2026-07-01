function myMove() {
    const container = document.getElementById("container");
    const box = document.getElementById("animate");

    // The box stops when its left edge reaches:
    // container width (400px) - box width (50px) = 350px
    const containerWidth = container.offsetWidth;
    const boxWidth = box.offsetWidth;
    const maxPosition = containerWidth - boxWidth; // 350px

    // Get current left position (parseInt removes "px")
    let currentPosition = parseInt(box.style.left) || 0;

    // Move 1px to the right every 1 millisecond
    const interval = setInterval(function() {
        if (currentPosition >= maxPosition) {
            clearInterval(interval);
            console.log("Box reached the right end. Interval cleared.");
        } else {
            currentPosition++;
            box.style.left = currentPosition + "px";
        }
    }, 1);
}