const { addDays, format } = require('date-fns');

function performDateOperations() {
    const currentDate = new Date();
    console.log(`Current date: ${currentDate}`);

    const futureDate = addDays(currentDate, 5);

    const formattedDate = format(futureDate, 'yyyy-MM-dd HH:mm:ss');

    console.log(`Date 5 days from now: ${formattedDate}`);

    return formattedDate;
}

module.exports = performDateOperations;