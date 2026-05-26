/* ============================================================
   BMI Presentation — Navigation, Animations, Keyboard Controls
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  // ── Elements ──
  const slides = document.querySelectorAll(".slide");
  const dotLinks = document.querySelectorAll(".dot-nav a");
  const navLinks = document.querySelectorAll(".nav-links a");
  const currentSectionSpan = document.getElementById("current-section");
  const progressBar = document.getElementById("progress-bar");
  const navbar = document.querySelector(".navbar");
  const keyboardHint = document.querySelector(".keyboard-hint");

  // ── Intersection Observer — highlight active slide ──
  // Improved detection: find the slide with the most visible area
  function updateActiveSlidenow() {
    let maxVisibility = 0;
    let activeSlideId = null;

    slides.forEach((slide) => {
      const rect = slide.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Calculate visible height of the slide
      const visibleTop = Math.max(0, rect.top);
      const visibleBottom = Math.min(windowHeight, rect.bottom);
      const visibleHeight = Math.max(0, visibleBottom - visibleTop);

      // Calculate visibility as a percentage
      const visibility = visibleHeight / windowHeight;

      // Update if this slide is more visible than the previous max
      if (visibility > maxVisibility) {
        maxVisibility = visibility;
        activeSlideId = slide.id;
      }
    });

    // Only update if we found a significantly visible slide (> 5%)
    if (activeSlideId && maxVisibility > 0.05) {
      setActiveSlide(activeSlideId);
    }
  }

  // Initial check
  updateActiveSlidenow();

  function setActiveSlide(id) {
    // Update dot nav
    dotLinks.forEach((dot) => {
      dot.classList.toggle("active", dot.getAttribute("href") === `#${id}`);
    });
    // Update top nav
    navLinks.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
    });
    // Update mobile location indicator
    const sectionMap = {
      title: "Home",
      about: "About",
      features: "Features",
      tech: "Tech Stack",
      architecture: "Architecture",
      dependencies: "Modules",
      classes: "Classes",
      pointers: "Pointers",
      fileio: "File I/O",
      "bmi-classification": "BMI Scale",
      "ui-flow": "UI Flow",
      "program-flow": "Program Flow",
      thankyou: "Thank You",
    };
    if (currentSectionSpan) {
      currentSectionSpan.textContent = sectionMap[id] || id;
    }
  }

  // ── Entrance Animations (fade-up / fade-in) ──
  const animElements = document.querySelectorAll(".fade-up, .fade-in");

  const animObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        } else {
          entry.target.classList.remove("visible");
        }
      });
    },
    { threshold: 0.15 },
  );

  animElements.forEach((el) => animObserver.observe(el));

  // ── Scroll Progress Bar ──
  function updateProgress() {
    const scrollTop = window.scrollY;
    const docHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = `${progress}%`;

    // Navbar style on scroll
    navbar.classList.toggle("scrolled", scrollTop > 50);

    // Update active slide based on viewport visibility
    updateActiveSlidenow();

    // Hide keyboard hint after first scroll
    if (scrollTop > 100 && keyboardHint) {
      keyboardHint.classList.add("hidden");
    }
  }

  window.addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();

  // ── Keyboard Navigation ──
  document.addEventListener("keydown", (e) => {
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

    const slideArray = Array.from(slides);
    let currentIndex = -1;

    // Find current visible slide
    slideArray.forEach((slide, i) => {
      const rect = slide.getBoundingClientRect();
      if (
        rect.top <= window.innerHeight * 0.4 &&
        rect.bottom > window.innerHeight * 0.4
      ) {
        currentIndex = i;
      }
    });

    if (currentIndex === -1) currentIndex = 0;

    let targetIndex = currentIndex;

    switch (e.key) {
      case "ArrowDown":
      case "ArrowRight":
      case "PageDown":
        e.preventDefault();
        targetIndex = Math.min(currentIndex + 1, slideArray.length - 1);
        break;
      case "ArrowUp":
      case "ArrowLeft":
      case "PageUp":
        e.preventDefault();
        targetIndex = Math.max(currentIndex - 1, 0);
        break;
      case "Home":
        e.preventDefault();
        targetIndex = 0;
        break;
      case "End":
        e.preventDefault();
        targetIndex = slideArray.length - 1;
        break;
      default:
        return;
    }

    if (targetIndex !== currentIndex) {
      slideArray[targetIndex].scrollIntoView({ behavior: "smooth" });
    }
  });

  // ── Smooth scroll for nav clicks ──
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute("href"));
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  // ── Animated counter for gauge ──
  const gaugeValue = document.querySelector(".gauge-value");
  if (gaugeValue) {
    const target = parseFloat(gaugeValue.dataset.target) || 22.5;
    let current = 0;
    const duration = 2000;
    const startTime = performance.now();

    function animateGauge(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out
      const ease = 1 - Math.pow(1 - progress, 3);
      current = ease * target;
      gaugeValue.textContent = current.toFixed(1);

      if (progress < 1) {
        requestAnimationFrame(animateGauge);
      }
    }

    // Start when title slide is visible
    const titleObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          requestAnimationFrame(animateGauge);
          titleObserver.disconnect();
        }
      },
      { threshold: 0.5 },
    );

    const titleSlide = document.getElementById("title");
    if (titleSlide) titleObserver.observe(titleSlide);
  }
});
