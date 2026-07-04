function timeUntilNextHoliday() {
    const now = new Date();
    const currentYear = now.getFullYear();

    // Hardcoded holiday, as instructed — Christmas (December 25th)
    const holidayName = 'Christmas';
    let holidayDate = new Date(currentYear, 11, 25, 0, 0, 0); // month 11 = December

    // If Christmas has already passed this year, target next year's instead
    if (holidayDate.getTime() < now.getTime()) {
        holidayDate = new Date(currentYear + 1, 11, 25, 0, 0, 0);
    }

    const diffMs = holidayDate.getTime() - now.getTime();

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

    const todayFormatted = now.toDateString();

    return (
        `Today's date: ${todayFormatted}\n` +
        `The next holiday is ${holidayName}, in ${days} days and ` +
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(
      seconds
    ).padStart(2, '0')} hours`
    );
}

module.exports = timeUntilNextHoliday;