swatch.addEventListener('click', function() {
    selectedColor = color;
    isEraser = false;
});

cell.addEventListener('mousedown', function() {
    isPainting = true;
    paintCell(this);
});

cell.addEventListener('mouseover', function() {
    if (isPainting) paintCell(this);
});

document.addEventListener('mouseup', function() {
    isPainting = false;
});