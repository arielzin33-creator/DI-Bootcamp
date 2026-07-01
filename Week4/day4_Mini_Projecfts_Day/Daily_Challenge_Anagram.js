function is_anagram(String1, String2) {
    const newString1 = String1.trim().toLowerCase()
    const newString2 = String2.trim().toLowerCase()

    return (
        newString1 !== newString2 &&
        newString1.length === newString2.length &&
        newString1.split("").sort().join("") === newString2.split("").sort().join("")
    )
}

console.log(is_anagram("listen", "silent")); // true
console.log(is_anagram("hello", "world")); // false
console.log(is_anagram("abc", "abc")); // false — identical, not anagram