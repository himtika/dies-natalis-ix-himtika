// Tambahkan fungsi Loader
window.addEventListener("load", function () {
  const loaderWrapper = document.getElementById("loader-wrapper");

  if (loaderWrapper) {
    document.body.style.overflow = "hidden";

    setTimeout(() => {
      loaderWrapper.classList.add("hidden-wrapper"); // Mulai transisi opacity 0.5s
    }, 1000); // Loader tetap tampil minimal 1.5 detik agar animasi terlihat

    setTimeout(() => {
      loaderWrapper.style.display = "none"; // Sembunyikan setelah transisi selesai
      document.body.style.overflow = "auto";
    }, 2000); // Sesuai dengan durasi transition CSS + jeda tampilan
  }
});

// Mencegah Drag & Drop pada Semua Gambar
document.addEventListener("dragstart", function (event) {
  event.preventDefault();
});
// Mencegah Klik Kanan pada Gambar Secara Spesifik
document.querySelectorAll("img").forEach((img) => {
  img.addEventListener("contextmenu", (event) => event.preventDefault());
});

// HERO SECTION
document.addEventListener("DOMContentLoaded", function () {
  let getStartedBtn = document.querySelector(".button");
  let aboutSection = document.getElementById("about");

  // Ketika tombol Get Started diklik, scroll ke bagian About
  getStartedBtn.addEventListener("click", function () {
    aboutSection.scrollIntoView({ behavior: "smooth" });
  });
});

// ### NAVBAR
// Navbar Fixed
function updateNavbar() {
  const header = document.querySelector("#navbar");
  const fixedNav = header.offsetTop;
  console.log(fixedNav);

  // if (window.pageYOffset > fixedNav) {
  //     header.classList.add('navbar-fixed');
  //     header.classList.remove('navbar-absolute');
  // }
  // else {
  //     header.classList.remove('navbar-fixed');
  //     header.classList.add('navbar-absolute');
  // }
  if (scrollY <= 400) {
    // TAMPILKAN navbar absolute
    header.classList.remove("navbar-fixed");
    header.classList.add("navbar-absolute");
    header.style.transform = "translateY(0)";
    header.style.opacity = "1";
  } else if (scrollY > 400 && scrollY <= 550) {
    // SEMBUNYIKAN NAVBAR
    header.style.transform = "translateY(-10px)";
    header.style.opacity = "0";
    document.body.classList.remove("nav-open");
    navMenu.classList.remove("dropdown-appear");
    navMenu.classList.add("hidden");
  } else {
    // TAMPILKAN navbar fixed
    header.classList.add("navbar-fixed");
    header.classList.remove("navbar-absolute");
    header.style.transform = "translateY(0)";
    header.style.opacity = "1";
  }
}

window.addEventListener("scroll", updateNavbar);
updateNavbar();

// Hamburger
const hamburger = document.querySelector("#hamburger");
const navMenu = document.querySelector("#nav-menu");

hamburger.addEventListener("click", function () {
  // hamburger.classList.toggle('hamburger-active');
  // navMenu.classList.toggle('hidden');
  const isMobile = window.innerWidth < 1024; // Tailwind 'lg' = 1024px

  if (navMenu.classList.contains("hidden")) {
    document.body.classList.toggle("nav-open");
    navMenu.classList.remove("hidden");
    navMenu.classList.add("dropdown-appear");
    navMenu.style.transform = "translateY(-10px)";
    navMenu.style.opacity = "0";

    setTimeout(() => {
      navMenu.style.transform = "translateY(0)";
      navMenu.style.opacity = "1";
    }, 10);
  } else {
    if (isMobile) {
      navMenu.style.transform = "translateY(-10px)";
      navMenu.style.opacity = "0";
      document.body.classList.remove("nav-open");
      navMenu.classList.remove("dropdown-appear");
      setTimeout(() => {
        navMenu.classList.add("hidden");
      }, 300);
    }
  }
});

function updateNavMenuDisplay() {
  const isMobile = window.innerWidth < 1024;

  if (isMobile) {
    // Hanya tambahkan hidden jika menu belum dibuka (misalnya user belum klik hamburger)
    if (!document.body.classList.contains("nav-open")) {
      navMenu.classList.add("hidden");
    } else {
      navMenu.classList.remove("dropdown-appear");
      navMenu.classList.add("hidden");
      document.body.classList.remove("nav-open");
    }
  } else {
    navMenu.classList.remove("dropdown-appear");
    navMenu.classList.remove("hidden");
    navMenu.style.opacity = "1";
    navMenu.style.transform = "translateY(0)";
  }
}

// Jalankan saat halaman pertama kali dimuat
updateNavMenuDisplay();

// Jalankan juga saat ukuran layar berubah
window.addEventListener("resize", updateNavMenuDisplay);

// Menutup Navbar saat klik di luar kotak navbar
window.addEventListener("click", function (event) {
  const isMobile = window.innerWidth < 1024;

  // Cek: apakah klik di luar navMenu dan bukan pada hamburger
  if (
    isMobile &&
    !navMenu.contains(event.target) &&
    !hamburger.contains(event.target) &&
    !navMenu.classList.contains("hidden") // navbar sedang terbuka
  ) {
    // Tambahkan animasi keluar
    navMenu.style.transform = "translateY(-10px)";
    navMenu.style.opacity = "0";
    document.body.classList.remove("nav-open");
    navMenu.classList.remove("dropdown-appear");

    // Setelah animasi selesai (0.3 detik), sembunyikan menu
    setTimeout(() => {
      navMenu.classList.add("hidden");
    }, 300);
  }
});
// ### NAVBAR

// WHY WE DIVE — Mobile Card Interaction
function initPurposeCards() {
  const cards = document.querySelectorAll("#purpose .purpose-card");

  if (!cards.length) {
    console.warn("Purpose cards tidak ditemukan!");
    return;
  }

  cards.forEach((card) => {
    card.addEventListener("click", () => {
      if (window.innerWidth >= 1024) return;

      // Cek apakah card yang diklik sudah aktif
      const wasActive = card.classList.contains("is-active");

      cards.forEach((item) => {
        // Jika card sebelumnya aktif, nonaktifkan semuanya
        // Jika belum aktif, aktifkan hanya card yang diklik
        const isActive = !wasActive && item === card;

        item.classList.toggle("is-active", isActive);
        item.setAttribute("aria-pressed", String(isActive));
      });
    });

    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        card.click();
      }
    });
  });

  console.log("Purpose cards initialized:", cards.length);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPurposeCards);
} else {
  initPurposeCards();
}

// ==================== TIMELINE SECTION ====================
document.addEventListener("DOMContentLoaded", () => {
  const section = document.getElementById("timeline-section");
  if (!section) return;

  const slides = section.querySelectorAll(".timeline-slide");
  const dots = section.querySelectorAll(".timeline-dot");
  const prevBtn = document.getElementById("timeline-prev");
  const nextBtn = document.getElementById("timeline-next");

  if (!slides.length || !prevBtn || !nextBtn) return;

  let currentIndex = 0;

  function showSlide(index) {
    // Circular navigation: kembali ke awal / akhir
    currentIndex = (index + slides.length) % slides.length;

    slides.forEach((slide, i) => {
      const isActive = i === currentIndex;

      slide.classList.toggle("timeline-active", isActive);
      slide.setAttribute("aria-hidden", String(!isActive));
    });

    dots.forEach((dot, i) => {
      const isActive = i === currentIndex;

      dot.classList.toggle("timeline-dot-active", isActive);

      if (isActive) {
        dot.setAttribute("aria-current", "true");
      } else {
        dot.removeAttribute("aria-current");
      }
    });
  }

  prevBtn.addEventListener("click", () => {
    showSlide(currentIndex - 1);
  });

  nextBtn.addEventListener("click", () => {
    showSlide(currentIndex + 1);
  });

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      showSlide(index);
    });
  });

  showSlide(0);
});
// ==================== TIMELINE SECTION ====================

// ==================== LOGO SECTION ====================
document.addEventListener("DOMContentLoaded", () => {
  const section = document.getElementById("logo-section");
  if (!section) return;

  const slides = section.querySelectorAll(".logo-slide");
  const dots = section.querySelectorAll(".logo-dot");
  const prevBtn = document.getElementById("logo-prev");
  const nextBtn = document.getElementById("logo-next");

  if (!slides.length || !prevBtn || !nextBtn) return;

  let currentIndex = 0;

  function showLogoSlide(index) {
    currentIndex = (index + slides.length) % slides.length;

    slides.forEach((slide, i) => {
      const isActive = i === currentIndex;
      slide.classList.toggle("logo-active", isActive);
      slide.setAttribute("aria-hidden", String(!isActive));
    });

    dots.forEach((dot, i) => {
      const isActive = i === currentIndex;
      dot.classList.toggle("logo-dot-active", isActive);

      if (isActive) {
        dot.setAttribute("aria-current", "true");
      } else {
        dot.removeAttribute("aria-current");
      }
    });
  }

  prevBtn.addEventListener("click", () => {
    showLogoSlide(currentIndex - 1);
  });

  nextBtn.addEventListener("click", () => {
    showLogoSlide(currentIndex + 1);
  });

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      showLogoSlide(index);
    });
  });

  showLogoSlide(0);
});
// ==================== LOGO SECTION ====================

// ==================== MASCOT SECTION ====================
document.addEventListener("DOMContentLoaded", () => {
  const section = document.getElementById("maskot-section");
  if (!section) return;

  const slides = section.querySelectorAll(".mascot-slide");
  const dots = section.querySelectorAll(".mascot-dot");
  const prevBtn = document.getElementById("mascot-prev");
  const nextBtn = document.getElementById("mascot-next");

  if (!slides.length || !prevBtn || !nextBtn) return;

  let currentIndex = 0;

  function showMascotSlide(index) {
    currentIndex = (index + slides.length) % slides.length;

    slides.forEach((slide, i) => {
      const isActive = i === currentIndex;
      slide.classList.toggle("mascot-active", isActive);
      slide.setAttribute("aria-hidden", String(!isActive));
    });

    dots.forEach((dot, i) => {
      const isActive = i === currentIndex;
      dot.classList.toggle("mascot-dot-active", isActive);

      if (isActive) {
        dot.setAttribute("aria-current", "true");
      } else {
        dot.removeAttribute("aria-current");
      }
    });
  }

  prevBtn.addEventListener("click", () => {
    showMascotSlide(currentIndex - 1);
  });

  nextBtn.addEventListener("click", () => {
    showMascotSlide(currentIndex + 1);
  });

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      showMascotSlide(index);
    });
  });

  showMascotSlide(0);
});
// ==================== MASCOT SECTION ====================

// ## DOKUMENTASI SECTION
// POP UP DOKUMENTASI

const imagePaths = Array.from(
  { length: 15 },
  (_, i) => `/assets/images/dokumentasi/diesnat-gallery-${i + 1}.webp`,
);

const images = [...document.querySelectorAll("#dokumentasi .image")];

// popup
const popup = document.querySelector(".popup");
const closeBtn = document.querySelector(".close-btn");
const largeImage = document.querySelector(".large-image");
const imageIndex = document.querySelector(".index");
const leftArrow = document.querySelector(".left-arrow");
const rightArrow = document.querySelector(".right-arrow");
const body = document.body;

let index = 0;

// Popup Image Diesnat
images.forEach((item) => {
  item.addEventListener("click", () => {
    index = Number(item.dataset.index);
    updateImage(index);
    popup.classList.toggle("active");
    body.style.overflow = "hidden";
  });
});

const updateImage = (i) => {
  // pastikan index-nya muter terus (loop)
  if (i < 0) i = imagePaths.length - 1;
  if (i >= imagePaths.length) i = 0;

  largeImage.src = imagePaths[i];
  imageIndex.textContent = (i + 1).toString().padStart(2, "0");
  index = i;
};

closeBtn.addEventListener("click", () => {
  popup.classList.toggle("active");
  body.style.overflow = "";
});

leftArrow?.addEventListener("click", () => updateImage(index - 1));
rightArrow?.addEventListener("click", () => updateImage(index + 1));

// Card More Moments
const moreMoments = document.querySelector("#dokumentasi .gallery-more");

moreMoments?.addEventListener("click", () => {
  index = 7;
  updateImage(index);
  popup.classList.toggle("active");
  body.style.overflow = "hidden";
});

moreMoments?.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    moreMoments.click();
  }
});

// ## DOKUMENTASI SECTION
