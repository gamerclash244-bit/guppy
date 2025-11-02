// --- DOM refs
const productsContainer = document.getElementById('products');
const cartBtn = document.getElementById('cartBtn');
const cart = document.getElementById('cart');
const cartItems = document.getElementById('cartItems');
const totalText = document.getElementById('total');

let cartList = [];

// ----------------- Firebase listener (if you're using Firebase) -----------------
// Ensure `db` is defined and initialized earlier in your code with firebase config.
// This creates elements with both 'product' and 'fish-card' classes so search will find them.
if (typeof db !== 'undefined' && db.ref) {
  db.ref("fishes").on("value", (snapshot) => {
    productsContainer.innerHTML = ""; // wipe then re-add
    snapshot.forEach((child) => {
      const fish = child.val();
      const div = document.createElement('div');
      // create both classes so CSS and search work
      div.classList.add('product', 'fish-card');

      // structure matches static cards so querySelector("h3") works
      div.innerHTML = `
        <a href="#" class="fish-link">
          <img src="${fish.image || 'placeholder.jpg'}" alt="${fish.name || ''}" />
          <div class="fish-info">
            <h3>${fish.name}</h3>
            <p>₹${fish.price}</p>
          </div>
        </a>
        <button type="button" onclick="addToCart('${child.key}', '${fish.name}', ${fish.price})">Add to Cart</button>
      `;
      productsContainer.appendChild(div);
    });
  });
}

// ----------------- Cart functions -----------------
function addToCart(id, name, price) {
  cartList.push({ id, name, price });
  updateCart();
}

function updateCart() {
  cartItems.innerHTML = "";
  let total = 0;
  cartList.forEach((item, i) => {
    total += Number(item.price) || 0;
    const li = document.createElement('li');
    li.innerHTML = `${item.name} - ₹${item.price} <button onclick="removeItem(${i})">❌</button>`;
    cartItems.appendChild(li);
  });
  totalText.textContent = `Total: ₹${total}`;
}

function removeItem(index) {
  cartList.splice(index, 1);
  updateCart();
}

cartBtn.onclick = () => cart.classList.toggle('hidden');

// ----------------- Search function (works for static and dynamic cards) -----------------
function search() {
  const searchBox = document.getElementById("search");
  if (!searchBox) return;
  const searchText = searchBox.value.trim().toUpperCase();

  // select both static fish-card and dynamically created product elements
  const items = document.querySelectorAll(".fish-card, .product");

  items.forEach(item => {
    const h3 = item.querySelector("h3");
    const name = h3 ? h3.textContent.trim().toUpperCase() : "";
    // if search box is empty, show all
    if (searchText === "" || name.indexOf(searchText) > -1) {
      item.style.display = "";
    } else {
      item.style.display = "none";
    }
  });
}

// Also attach input listener in case user pastes text or types without keyup firing
const searchInput = document.getElementById('search');
if (searchInput) {
  searchInput.addEventListener('input', search);
}