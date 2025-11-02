const productsContainer = document.getElementById('products');
const cartBtn = document.getElementById('cartBtn');
const cart = document.getElementById('cart');
const cartItems = document.getElementById('cartItems');
const totalText = document.getElementById('total');

let cartList = [];

db.ref("fishes").on("value", (snapshot) => {
  productsContainer.innerHTML = "";
  snapshot.forEach((child) => {
    const fish = child.val();
    const div = document.createElement('div');
    div.classList.add('product');
    div.innerHTML = `
      <img src="${fish.image}" width="200"><h3>${fish.name}</h3>
      <p>$${fish.price}</p>
      <button onclick="addToCart('${child.key}', '${fish.name}', ${fish.price})">Add to Cart</button>
    `;
    productsContainer.appendChild(div);
  });
});

function addToCart(id, name, price) {
  cartList.push({ id, name, price });
  updateCart();
}

function updateCart() {
  cartItems.innerHTML = "";
  let total = 0;
  cartList.forEach((item, i) => {
    total += item.price;
    const li = document.createElement('li');
    li.innerHTML = `${item.name} - $${item.price} 
      <button onclick="removeItem(${i})">❌</button>`;
    cartItems.appendChild(li);
  });
  totalText.textContent = `Total: $${total}`;
}

function removeItem(index) {
  cartList.splice(index, 1);
  updateCart();
}

cartBtn.onclick = () => cart.classList.toggle('hidden');




const search = () => {
    const searchbox = document.getElementById("products").value.toUppercase();
    const storeitems = documet.getElementById("fish-card")
    const product = document.querySelectorAll("fish-link")
    const pname = document.getElementTagName("h3")
    
    for (var i =0; < pname.length; i++) {
        let match = product[i].getElementByTagName("h3")[0];
        
        if(match) {
            let textvalue = match.textcontent || match.innerHTML
            
            if (textvalue.toUpperCase().indexof(searchbox) > -1) {
                product[i].style.display = "";
            } else {
                product[i].style.display = "none";
        }
    }
}