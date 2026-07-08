const track = document.querySelector(".track");

let isPaused = false;
let position = 0;
let baseSpeed = 2;
let currentSpeed = baseSpeed;
let targetSpeed = baseSpeed;
let direction = 1;
let loopWidth = 0;

function duplicateSlides() {
  const slides = Array.from(track.children);
  slides.forEach(slide => {
    const clone = slide.cloneNode(true);
    track.appendChild(clone);
  });
}
// Calcul de loopWidth APRÈS chargement complet des images
function computeLoopWidth() {
  const slides = Array.from(track.querySelectorAll(".slide"));
  const half = slides.length / 2;

  let w = 0;
  for (let i = 0; i < half; i++) {
    w += slides[i].offsetWidth;
  }

  loopWidth = w;
}

// On recalcule quand toutes les images sont chargées
const allImgs = Array.from(track.querySelectorAll("img"));
let loadedCount = 0;

function onImgLoad() {
  loadedCount++;
  if (loadedCount >= allImgs.length) computeLoopWidth();
}

allImgs.forEach(img => {
  if (img.complete && img.naturalWidth > 0) {
    onImgLoad();
  } else {
    img.addEventListener("load",  onImgLoad);
    img.addEventListener("error", onImgLoad); // évite un blocage si image absente
  }
});

window.addEventListener("load", () => {
  duplicateSlides();   // 👈 IMPORTANT
  computeLoopWidth();  // 👈 ensuite seulement
});
window.addEventListener("resize",  computeLoopWidth);

// Sécurité : recalcul si une image se charge tard
track.querySelectorAll("img").forEach(img => {
  img.addEventListener("load", computeLoopWidth);
});

// PAUSE / PLAY
function togglePause() {
  isPaused = !isPaused;
}


document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    e.preventDefault();
    togglePause();
  }
});

// SCROLL
window.addEventListener("wheel", (e) => {
  const intensity = Math.abs(e.deltaY) * 0.01;
  targetSpeed += intensity;

  if (e.deltaY > 0) {
    direction = -1;
  } else {
    direction = 1;
  }
});

// ANIMATION
function animate() {
  if (!isPaused && loopWidth > 0) {

    currentSpeed += (targetSpeed - currentSpeed) * 1.8;
    targetSpeed += (baseSpeed - targetSpeed) * 0.08;

    position -= currentSpeed * direction;

    // Boucle infinie propre
   if (position <= -loopWidth) {
  position += loopWidth;
}

if (position > 0) {
  position -= loopWidth;
}
    track.style.transform = `translateX(${position}px)`;
  }

  requestAnimationFrame(animate);
}

animate();

const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const images = document.querySelectorAll(".slide img");

// ouvrir
document.addEventListener("click", (e) => {

  const img = e.target.closest(".slide img");
  const video = e.target.closest(".slide video");

  // ===== IMAGE =====
  if (img) {
    lightbox.innerHTML = `
      <img src="${img.src}">
    `;

    lightbox.classList.add("active");
    document.body.classList.add("lightbox-open");
  }

  // ===== VIDEO =====
  if (video) {

    const videoClone = video.cloneNode(true);

    videoClone.muted = false;
    videoClone.controls = true;
    videoClone.currentTime = 0;

    lightbox.innerHTML = "";
    lightbox.appendChild(videoClone);

    lightbox.classList.add("active");
    document.body.classList.add("lightbox-open");

    videoClone.play().catch(() => {});
  }

});
// fermer
lightbox.addEventListener("click", () => {
  // récupérer la vidéo si elle existe
  const video = lightbox.querySelector("video");

  if (video) {
    video.pause();        // stop
    video.currentTime = 0; // reset
    video.muted = true;   // coupe le son (sécurité)
  }

  lightbox.classList.remove("active");
  document.body.classList.remove("lightbox-open");

  lightbox.innerHTML = ""; // supprime la vidéo du DOM
});

const cursor = document.getElementById("cursor");

// suivre la souris
document.addEventListener("mousemove", (e) => {
  cursor.style.top = e.clientY + "px";
  cursor.style.left = e.clientX + "px";
});

// afficher seulement dans le slider
const slider = document.querySelector(".slider");

slider.addEventListener("mouseenter", () => {
  cursor.classList.add("active");
});

slider.addEventListener("mouseleave", () => {
  cursor.classList.remove("active");
});

// changer texte selon état
function updateCursor() {
  cursor.textContent = isPaused ? "Play avec espace" : "Pause avec espace";
}

// intégrer avec ton toggle existant
const originalToggle = togglePause;

togglePause = function () {
  originalToggle();
  updateCursor();
};

// init
updateCursor();

// ========== TRANSITION PAGE =========
document.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", function (e) {
    const url = this.href;

    // on ignore les liens externes
    if (!url.includes(".html")) return;

    e.preventDefault();

    document.body.classList.add("fade-out");

    setTimeout(() => {
      window.location.href = url;
    }, 400); // doit correspondre au CSS (0.4s)
  });
});

window.addEventListener("load", () => {
  document.body.classList.remove("fade-out");
});

window.addEventListener("load", () => {
  const items = document.querySelectorAll(".fade-item");

  items.forEach((el, i) => {
    setTimeout(() => {
      el.classList.add("show");
    }, i * 150); // délai entre chaque élément
  });
});