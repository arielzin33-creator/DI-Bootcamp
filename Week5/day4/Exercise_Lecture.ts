// type typeA = {
//     propA: string
// }

// type typeB = {
//     propB: number
// }

// type typeAB = typeA & typeB 
// type typeBA = typeB & typeA 

// let typeABInstance1: typeAB = {
//   propA: "Hello",
//   propB: 42,
// };

// let typeABInstance2: typeBA = {
//   propA: "World",
//   propB: 24,
// };

// console.log(typeABInstance1); // { propertyA: 'Hello', propertyB: 42 }
// console.log(typeABInstance2); // { propertyA: 'World', propertyB: 24 }

// //If the partner is a Customer, return "Customer - Credit Allowed" or "Customer - Credit Denied" based on isCreditAllowed().
// //If the partner is a Supplier, return "Supplier - Shortlisted" or "Supplier - Not Shortlisted" based on isInShortList().
// function generateReport () {
//   for BusinessPartner {
//     if (partner === Customer){
//       return `Customer - Credit Allowed` ||
//     }

//         if (partner === supplier){
//       return `Customer - Credit Allowed`
//     }
//   }
// }

function combine <U,V> (obj1: U, obj2: V) {
    return {
        ...obj1,
        ...obj2,
    };
} 

let name2 = 'John'
let title =  'Developer'
let age =  40

let result = combine ({name2}, {age})
console.log(result)