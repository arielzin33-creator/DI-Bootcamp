/* ═══════════════════════════════════════════════════════════════════════════
   Pass By Value & Pass By Reference
   ═══════════════════════════════════════════════════════════════════════════ */

let client = "John";

const groceries = {
    fruits: ["pear", "apple", "banana"],
    vegetables: ["tomatoes", "cucumber", "salad"],
    totalPrice: "20$",
    other: {
        paid: true,
        meansOfPayment: ["cash", "creditCard"]
    }
};

/* ─────────────────────────────────────────────────────────────────────────────
   1. displayGroceries
   ───────────────────────────────────────────────────────────────────────────── */

const displayGroceries = () => {
    groceries.fruits.forEach(fruit => console.log(fruit));
};

displayGroceries();
// pear
// apple
// banana


/* ─────────────────────────────────────────────────────────────────────────────
   2. cloneGroceries
   ───────────────────────────────────────────────────────────────────────────── */

const cloneGroceries = () => {

    // ── Strings: Pass By VALUE ────────────────────────────────────────────────
    let user = client;
    // `user` receives a COPY of the string "John".
    // Strings (like all primitives: numbers, booleans…) are passed by VALUE,
    // meaning `user` holds its own independent copy — NOT a reference to `client`.

    client = "Betty";

    console.log("client:", client); // "Betty"  ← modified
    console.log("user:", user);     // "John"   ← unchanged

    // ANSWER: No, `user` is NOT affected.
    // Reason: strings are primitives → passed by value → `user` is a separate copy.
    // Changing `client` afterward has zero effect on `user`.


    // ── Objects: Pass By REFERENCE ────────────────────────────────────────────
    let shopping = groceries;
    // `shopping` does NOT get a copy of the object.
    // Both `shopping` and `groceries` now point to the SAME object in memory.

    shopping.totalPrice = "35$";

    console.log("groceries.totalPrice:", groceries.totalPrice); // "35$"
    console.log("shopping.totalPrice:", shopping.totalPrice);   // "35$"

    // ANSWER: Yes, `groceries.totalPrice` is ALSO changed.
    // Reason: objects are passed by reference → `shopping` and `groceries`
    // are two names for the SAME object. Mutating one mutates the other.


    shopping.other.paid = false;

    console.log("groceries.other.paid:", groceries.other.paid); // false
    console.log("shopping.other.paid:", shopping.other.paid);   // false

    // ANSWER: Yes, `groceries.other.paid` is ALSO changed.
    // Reason: `other` is a nested object — still passed by reference.
    // `shopping.other` and `groceries.other` point to the same nested object.
};

/* ─────────────────────────────────────────────────────────────────────────────
   3. Invoke cloneGroceries
   ───────────────────────────────────────────────────────────────────────────── */

cloneGroceries();
