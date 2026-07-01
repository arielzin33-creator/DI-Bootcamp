function createCalendar(year, month) {

    // Day headers — week starts on Monday
    const dayNames = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];

    // Create table elements
    const table = document.createElement("table");
    const thead = document.createElement("thead");
    const tbody = document.createElement("tbody");

    // --- Build the header row ---
    const headerRow = document.createElement("tr");

    for (let i = 0; i < dayNames.length; i++) {
        const th = document.createElement("th");
        th.textContent = dayNames[i];
        headerRow.appendChild(th);
    }

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // --- Calculate the starting weekday ---
    // getDay() returns 0=Sunday ... 6=Saturday
    // We convert to 0=Monday ... 6=Sunday
    const firstDay = new Date(year, month - 1, 1).getDay();
    const startOffset = (firstDay === 0) ? 6 : firstDay - 1;

    // Total days in the month
    const totalDays = new Date(year, month, 0).getDate();

    // --- Build the calendar rows ---
    let currentDay = 1;
    let tr = document.createElement("tr");

    // Fill empty cells before the 1st of the month
    for (let i = 0; i < startOffset; i++) {
        const emptyTd = document.createElement("td");
        emptyTd.textContent = ".";
        tr.appendChild(emptyTd);
    }

    // Fill in the day numbers
    for (let day = 1; day <= totalDays; day++) {
        const td = document.createElement("td");
        td.textContent = day;
        tr.appendChild(td);

        // Sunday is column index 6 (last column) — start a new row after it
        const columnIndex = (startOffset + day - 1) % 7;
        if (columnIndex === 6 && day !== totalDays) {
            tbody.appendChild(tr);
            tr = document.createElement("tr");
        }
    }

    // Append the last (possibly incomplete) row
    tbody.appendChild(tr);
    table.appendChild(tbody);
    document.body.appendChild(table);
}

createCalendar(2012, 9);