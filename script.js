// Sliding carousel (one-by-one)
let index = 0;
const slidesContainer = document.querySelector(".slides");
const slideCount = document.querySelectorAll(".slimg").length;

function slideNext() {
  index++;
  if (index >= slideCount) index = 0;
  slidesContainer.style.transform = `translateX(-${index * 100}%)`;
}

setInterval(slideNext, 3000); // Change every 3 seconds