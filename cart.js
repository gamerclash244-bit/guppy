// Example cart data (you can replace this with your real cart list from localStorage or Firebase)
let cart = JSON.parse(localStorage.getItem("cartList")) || [
  { name: "Goldfish", price: 200, image: "messi1.jpg" },
  { name: "Guppy", price: 150, image: "messi2.jpg" }
];

function displayCart() {
  const cartContainer = document.getElementById("cartItems");
  const totalDisplay = document.getElementById("cartTotal");
  cartContainer.innerHTML = "";
  let total = 0;

  if (cart.length === 0) {
    cartContainer.innerHTML = "<p>Your cart is empty 🐠</p>";
    totalDisplay.textContent = "₹0";
    return;
  }

  cart.forEach((item, index) => {
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `
      <img src="${item.image}" alt="${item.name}">
      <div class="info">
        <h3>${item.name}</h3>
        <p>₹${item.price}</p>
      </div>
      <button class="remove-btn" onclick="removeItem(${index})">Remove</button>
    `;
    cartContainer.appendChild(div);
    total += item.price;
  });

  totalDisplay.textContent = `₹${total}`;
}

function removeItem(index) {
  cart.splice(index, 1);
  localStorage.setItem("cartList", JSON.stringify(cart));
  displayCart();
}

document.getElementById("checkoutBtn").addEventListener("click", () => {
  if (cart.length === 0) {
    alert("Your cart is empty!");
  } else {
    alert("Thank you for your purchase! 🐟");
    cart = [];
    localStorage.removeItem("cartList");
    displayCart();
  }
});

displayCart();