  //Exercise 1 : Colors
  const colors = ["Blue", "Green", "Red", "Orange", "Violet", "Indigo", "Yellow"];

  // 1. Display each color with its choice number
  colors.forEach((color, index) => {
      console.log(`${index + 1}# choice is ${color}.`);
  });
  // 2. Check if "Violet" is in the array
  if (colors.includes('Violet')) {
      console.log('Yeah')
  } else {
      console.log('No...')
  }

  //Exercise 2 : Colors #2
  const colors2 = ["Blue", "Green", "Red", "Orange", "Violet", "Indigo", "Yellow"];
  const ordinal = ["th", "st", "nd", "rd"];

  //displays the colors in the following order : “1st choice is Blue .” “2nd choice is Green.” “3rd choice is Red.” ect…
  colors.forEach((color, index) => {
      if (index === 0) {
          console.log(`${index + 1}${ordinal[1]} choice is ${color}.`);
      } else if (index === 1) {
          console.log(`${index + 1}${ordinal[2]} choice is ${color}.`);
      } else if (index === 2) {
          console.log(`${index + 1}${ordinal[3]} choice is ${color}.`);
      } else {
          console.log(`${index + 1}${ordinal[0]} choice is ${color}.`);
      }
  });

  //Exercise 3 : Analyzing
  //-- -- --1-- -- --
  const fruits = ["apple", "orange"];
  const vegetables = ["carrot", "potato"];
  const result = ['bread', ...vegetables, 'chicken', ...fruits];
  console.log(result);
  //["bread", "carrot", "potato", "chicken", "apple", "orange"]

  //-- -- --2-- -- --
  const country = "USA";
  console.log([...country]);
  //["U", "S", "A"]

  // -- -- --Bonus-- -- --
  let newArray = [...[, , ]];
  console.log(newArray);
  //[undefined, undefined]

  //Exercise 4 : Employees
  const users = [{
      firstName: 'Bradley',
      lastName: 'Bouley',
      role: 'Full Stack Resident'
  }, {
      firstName: 'Chloe',
      lastName: 'Alnaji',
      role: 'Full Stack Resident'
  }, {
      firstName: 'Jonathan',
      lastName: 'Baughn',
      role: 'Enterprise Instructor'
  }, {
      firstName: 'Michael',
      lastName: 'Herman',
      role: 'Lead Instructor'
  }, {
      firstName: 'Robert',
      lastName: 'Hajek',
      role: 'Full Stack Resident'
  }, {
      firstName: 'Wes',
      lastName: 'Reid',
      role: 'Instructor'
  }, {
      firstName: 'Zach',
      lastName: 'Klabunde',
      role: 'Instructor'
  }]
  const welcomeStudents = users.map((user) => {
      return `Hello ${user.firstName}`;
  })
  console.log(welcomeStudents);
  //const welcomeStudents = ["Hello Bradley", "Hello Chloe", "Hello Jonathan", "Hello Michael", "Hello Robert", "Hello Wes", "Hello Zach"]

  const fullStackResidnets = users.filter((user) =>
      user.role === 'Full Stack Resident')
  console.log(fullStackResidnets)

  const fullStackLastNames = users
      .filter((user) => user.role === 'Full Stack Resident')
      .map((user) => user.lastName)

  console.log(fullStackLastNames)

  // Exercise 5 : Star Wars
  const epic = ['a', 'long', 'time', 'ago', 'in a', 'galaxy', 'far far', 'away']
  const sentence = epic.reduce((acc, val) => {

      return acc + ' ' + val
  })
  console.log(sentence)

  //Exercise 6 : Employees #2
  const students = [{
      name: "Ray",
      course: "Computer Science",
      isPassed: true
  }, {
      name: "Liam",
      course: "Computer Science",
      isPassed: false
  }, {
      name: "Jenner",
      course: "Information Technology",
      isPassed: true
  }, {
      name: "Marco",
      course: "Robotics",
      isPassed: true
  }, {
      name: "Kimberly",
      course: "Artificial Intelligence",
      isPassed: false
  }, {
      name: "Jamie",
      course: "Big Data",
      isPassed: false
  }];
  const studentsPass = students.filter((student) =>
      student.isPassed === true)
  console.log(studentsPass)

  studentsPass.forEach((student) =>
      console.log(`Good job ${student.name}, you passed the course in ${student.course}`))