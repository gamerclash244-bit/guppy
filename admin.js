const fishName = document.getElementById('fishName');
const fishPrice = document.getElementById('fishPrice');
const fishImage = document.getElementById('fishImage');
const addFish = document.getElementById('addFish');
const fishList = document.getElementById('fishList');

addFish.onclick = () => {
  const name = fishName.value;
  const price = parseFloat(fishPrice.value);
  const image = fishImage.value;
  if (!name || !price || !image) return alert("Fill all fields!");

  db.ref("fishes").push({ name, price, image });
  fishName.value = fishPrice.value = fishImage.value = "";
};

db.ref("fishes").on("value", (snapshot) => {
  fishList.innerHTML = "";
  snapshot.forEach((child) => {
    const data = child.val();
    const li = document.createElement("li");
    li.textContent = `${data.name} - $${data.price}`;
    fishList.appendChild(li);
  });
});