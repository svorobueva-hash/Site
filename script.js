const slides = document.querySelectorAll(".slide");
const section = document.querySelector(".scroll-section");

window.addEventListener("scroll", () => {

const rect = section.getBoundingClientRect();
const progress = Math.min(
Math.max(-rect.top / (rect.height - window.innerHeight), 0),
1
);

const index = Math.floor(progress * slides.length);

slides.forEach(s => s.classList.remove("active"));

if(slides[index]){
slides[index].classList.add("active");
}

});