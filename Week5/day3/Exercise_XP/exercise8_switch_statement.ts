//Exercise 8: switch Statement with Complex Conditions

function getAction (userRole: string){
  switch (userRole) {
    case "admin":
      console.log("Manage users and settings")
      break
    case "editor":
      console.log("Edit content")
      break
    case "viewer":
      console.log("View content")
      break
    case "guest":
      console.log("Limited access")
      break
    case "unknown":
      console.log("Invalid role")
      break
     default:
      console.log("Invalid command");
  }
}

// Test the function with different roles
console.log(getAction("admin")); // Output: Manage users and settings
console.log(getAction("editor")); // Output: Edit content
console.log(getAction("viewer")); // Output: View content
console.log(getAction("guest")); // Output: Limited access
console.log(getAction("unknown")); // Output: Invalid role
