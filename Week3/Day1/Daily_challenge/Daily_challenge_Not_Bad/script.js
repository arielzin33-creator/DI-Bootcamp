// Daily Challenge: Not Bad
let sentence = "The movie is not that bad, I like it";

let wordNot = sentence.indexOf("not");
let wordBad = sentence.indexOf("bad");

if (wordNot !== -1 && wordBad !== -1 && wordBad > wordNot) {
    let notBadSubstring = sentence.slice(wordNot, wordBad + 3);
    let result = sentence.replace(notBadSubstring, "good");
    console.log(result);
} else {
    console.log(sentence);
}

// Output: "The movie is good, I like it"

//Testing all three examples from the instructions:

function notBad(sentence) {
    let wordNot = sentence.indexOf("not");
    let wordBad = sentence.indexOf("bad");

    if (wordNot !== -1 && wordBad !== -1 && wordBad > wordNot) {
        let notBadSubstring = sentence.slice(wordNot, wordBad + 3);
        let result = sentence.replace(notBadSubstring, "good");
        console.log(result);
    } else {
        console.log(sentence);
    }
}

notBad("This dinner is not that bad ! You cook well");
// → "This dinner is good ! You cook well"

notBad("This movie is not so bad !");
// → "This movie is good !"

notBad("This dinner is bad !");
// → "This dinner is bad !"