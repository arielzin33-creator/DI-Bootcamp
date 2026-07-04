function minutesLived(birthdate) {
    // Hardcoded example birthdate, as instructed — format: YYYY-MM-DD
    const birthDateObj = new Date(birthdate);
    const now = new Date();

    const diffMs = now.getTime() - birthDateObj.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    return diffMinutes;
}

module.exports = minutesLived;