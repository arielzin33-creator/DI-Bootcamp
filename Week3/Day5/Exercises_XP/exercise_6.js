// Exercise 6: Fortune teller
(function(children, partner, location, job) {
    document.getElementById('result').textContent =
        `You will be a ${job} in ${location}, and married to ${partner} with ${children} kids.`;
})(3, 'Sarah', 'New York', 'Software Engineer');