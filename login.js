document.getElementById("loginForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  // Temporary example check
  if (email === "" || password === "") {
    alert("Please fill out all fields.");
    return;
  }

  // Simulated login success
  alert("Login successful!");
  window.location.href = "index.html"; // go to home page
});