const container = document.getElementById("container");
const signUpBtn = document.getElementById("signUp");
const signInBtn = document.getElementById("signIn");

// Clicking "Sign Up" slides the overlay to the left,
// revealing the Sign Up form
signUpBtn.addEventListener("click", function() {
    container.classList.add("right-panel-active");
});

// Clicking "Sign In" slides the overlay back to the right,
// revealing the Sign In form
signInBtn.addEventListener("click", function() {
    container.classList.remove("right-panel-active");
});