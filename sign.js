document.getElementById("signupForm").addEventListener("submit", function(e) {
  e.preventDefault(); // prevent page refresh

  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  // You can save this to Firebase or your server here
  console.log("New user:", { username, email, password });

  alert("Sign up successful!");
  this.reset();
});