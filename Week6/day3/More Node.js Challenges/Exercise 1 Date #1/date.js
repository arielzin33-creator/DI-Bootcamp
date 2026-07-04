function timeUntilNewYear() {
    const now = new Date();
    const currentYear = now.getFullYear();

    // Target: January 1st of next year (if today IS Jan 1st, this still correctly targets next year's Jan 1st)
    let targetDate = new Date(currentYear + 1, 0, 1, 0, 0, 0);

    const diffMs = targetDate.getTime() - now.getTime();

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

    return `January 1st is in ${days} days and ${String(hours).padStart(2, '0')}:${String(
    minutes
  ).padStart(2, '0')}:${String(seconds).padStart(2, '0')} hours`;
}

module.exports = timeUntilNewYear;