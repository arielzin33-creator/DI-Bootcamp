// Exercise 1: Checking the BMI
const person1 = {
    fullName: "Alice Martin",
    mass: 70, // kg
    height: 1.75, // meters
    calcBMI: function() {
        return this.mass / (this.height * this.height);
    }
};

const person2 = {
    fullName: "Bob Carter",
    mass: 90,
    height: 1.80,
    calcBMI: function() {
        return this.mass / (this.height * this.height);
    }
};

function comparesBMI(p1, p2) {
    const bmi1 = p1.calcBMI();
    const bmi2 = p2.calcBMI();

    if (bmi1 > bmi2) {
        console.log(`${p1.fullName} has the highest BMI: ${bmi1.toFixed(2)}`);
    } else if (bmi2 > bmi1) {
        console.log(`${p2.fullName} has the highest BMI: ${bmi2.toFixed(2)}`);
    } else {
        console.log("Both persons have the same BMI.");
    }
}

comparesBMI(person1, person2);

// Exercise 2: Grade Average
function findAvg(gradesList) {
    let sum = 0;
    for (let i = 0; i < gradesList.length; i++) {
        sum += gradesList[i];
    }
    const average = sum / gradesList.length;
    console.log(`Your average is: ${average.toFixed(2)}`);

    if (average >= 65) {
        console.log("Congratulations, you passed!");
    } else {
        console.log("You failed and must repeat the course.");
    }
}

findAvg([80, 72, 55, 90, 60]);