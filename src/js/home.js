/* ==========================================================================
   Home Page Scripts
   Dependencies: none
   ========================================================================== */

/* ── Announcement Bar Dismiss (Progressive Enhancement) ── */

(function () {
  const STORAGE_KEY = "cereble-announcement-dismissed";
  const bar = document.querySelector("[data-announcement-bar]");
  const btn = document.querySelector("[data-announcement-dismiss]");

  if (!bar || !btn) return;

  try {
    if (localStorage.getItem(STORAGE_KEY) === "true") {
      bar.hidden = true;
      return;
    }
  } catch (e) {
    /* localStorage unavailable (private browsing) — bar stays visible */
  }

  btn.hidden = false;

  btn.addEventListener("click", function () {
    bar.hidden = true;
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch (e) {
      /* localStorage unavailable — dismiss works for this session only */
    }
  });
})();

/* ── Testimonials Carousel (Progressive Enhancement) ── */

(function () {
  var section = document.querySelector("[data-testimonials-carousel]");
  if (!section) return;

  var viewport = section.querySelector(".testimonials__viewport");
  var track = section.querySelector(".testimonials__track");
  var container = section.querySelector(".testimonials__container");

  if (!viewport || !track || !container) return;

  var cards = track.querySelectorAll(".testimonials__card");
  if (cards.length < 2) return;

  var SLIDE_INTERVAL = 3000; /* 3s per slide on desktop */
  var RESUME_DELAY = 8000; /* 8s pause after user interaction before auto-resume */
  var DESKTOP_VISIBLE = 3;
  var MOBILE_BP = 768;

  var currentIndex = 0;
  var timer = null;
  var resumeTimer = null;
  var prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  /* Mark track as JS-enhanced (enables CSS transition, disables scroll-snap) */
  track.setAttribute("data-carousel-enhanced", "");
  viewport.style.overflow = "hidden";

  /* ── Helpers ── */

  function getVisibleCount() {
    return window.innerWidth >= MOBILE_BP ? DESKTOP_VISIBLE : 1;
  }

  function getMaxIndex() {
    var visible = getVisibleCount();
    var max = cards.length - visible;
    return max > 0 ? max : 0;
  }

  function slideTo(index) {
    var max = getMaxIndex();
    currentIndex = index > max ? 0 : index < 0 ? max : index;

    /* Calculate offset: card width + gap */
    var card = cards[0];
    var gap = parseFloat(getComputedStyle(track).gap) || 0;
    var offset = currentIndex * (card.offsetWidth + gap);

    track.style.transform = "translateX(-" + offset + "px)";
    updateDots();
  }

  function advance() {
    slideTo(currentIndex + 1);
  }

  /* ── Auto-slide ── */

  function startAutoSlide() {
    if (prefersReducedMotion) return;
    stopAutoSlide();
    timer = setInterval(advance, SLIDE_INTERVAL);
  }

  function stopAutoSlide() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  function scheduleResume() {
    if (resumeTimer) clearTimeout(resumeTimer);
    resumeTimer = setTimeout(startAutoSlide, RESUME_DELAY);
  }

  /* ── Dot navigation ── */

  var dotsNav = null;
  var dotsList = null;
  var dots = [];

  function createDots() {
    var totalDots = getMaxIndex() + 1;
    if (totalDots <= 1) {
      if (dotsNav) dotsNav.hidden = true;
      return;
    }

    if (!dotsNav) {
      dotsNav = document.createElement("nav");
      dotsNav.setAttribute("aria-label", "Testimonial navigation");
      dotsList = document.createElement("ul");
      dotsList.className = "testimonials__dots";
      dotsNav.appendChild(dotsList);
      container.appendChild(dotsNav);

      /* Click listener added once — event delegation on the list */
      dotsList.addEventListener("click", function (e) {
        var target = e.target.closest("[data-slide-index]");
        if (!target) return;
        stopAutoSlide();
        slideTo(parseInt(target.getAttribute("data-slide-index"), 10));
        scheduleResume();
      });
    }

    dotsNav.hidden = false;
    dotsList.innerHTML = "";
    dots = [];

    for (var i = 0; i < totalDots; i++) {
      var li = document.createElement("li");
      var btn = document.createElement("button");
      btn.className = "testimonials__dot";
      btn.type = "button";
      btn.setAttribute(
        "aria-label",
        "Show testimonial " + (i + 1) + " of " + totalDots,
      );
      btn.setAttribute("data-slide-index", i);
      li.appendChild(btn);
      dotsList.appendChild(li);
      dots.push(btn);
    }
  }

  function updateDots() {
    for (var i = 0; i < dots.length; i++) {
      dots[i].setAttribute(
        "aria-current",
        i === currentIndex ? "true" : "false",
      );
    }
  }

  /* ── Pause on interaction ── */

  section.addEventListener("mouseenter", function () {
    stopAutoSlide();
  });

  section.addEventListener("mouseleave", function () {
    startAutoSlide();
  });

  section.addEventListener("pointerdown", function () {
    stopAutoSlide();
    scheduleResume();
  });

  section.addEventListener("focusin", function () {
    stopAutoSlide();
  });

  section.addEventListener("focusout", function () {
    scheduleResume();
  });

  /* ── Resize handling ── */

  var resizeTimeout = null;
  window.addEventListener("resize", function () {
    if (resizeTimeout) clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function () {
      createDots();
      slideTo(Math.min(currentIndex, getMaxIndex()));
    }, 150);
  });

  /* ── Reduced motion listener ── */

  var motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (motionQuery.addEventListener) {
    motionQuery.addEventListener("change", function (e) {
      prefersReducedMotion = e.matches;
      if (prefersReducedMotion) {
        stopAutoSlide();
      } else {
        startAutoSlide();
      }
    });
  }

  /* ── Init ── */

  createDots();
  updateDots();
  startAutoSlide();
})();

/* ── FAQ Accordion (Progressive Enhancement) ── */

(function () {
  var accordion = document.querySelector("[data-faq-accordion]");
  if (!accordion) return;

  var items = accordion.querySelectorAll(".faq__item");
  if (!items.length) return;

  /* Collapse all on load */
  items.forEach(function (item) {
    var trigger = item.querySelector(".faq__trigger");
    var answer = item.querySelector(".faq__answer");
    if (!trigger || !answer) return;
    trigger.setAttribute("aria-expanded", "false");
    answer.hidden = true;
  });

  /* Event delegation on the <dl> */
  accordion.addEventListener("click", function (e) {
    var trigger = e.target.closest(".faq__trigger");
    if (!trigger) return;

    var item = trigger.closest(".faq__item");
    var answer = item.querySelector(".faq__answer");
    if (!answer) return;

    var isOpen = trigger.getAttribute("aria-expanded") === "true";

    /* Close all others (exclusive accordion) */
    items.forEach(function (otherItem) {
      var otherTrigger = otherItem.querySelector(".faq__trigger");
      var otherAnswer = otherItem.querySelector(".faq__answer");
      if (otherItem !== item && otherTrigger && otherAnswer) {
        otherTrigger.setAttribute("aria-expanded", "false");
        otherAnswer.hidden = true;
      }
    });

    /* Toggle current */
    trigger.setAttribute("aria-expanded", isOpen ? "false" : "true");
    answer.hidden = isOpen;
  });
})();
