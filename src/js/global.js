/* ==========================================================================
   Global Scripts — Shared across all pages
   Dependencies: none
   ========================================================================== */

/* ── Mobile Navigation Toggle (Progressive Enhancement) ── */

(function () {
  var header = document.querySelector("[data-header]");
  if (!header) return;

  var toggle = header.querySelector("[data-header-toggle]");
  var nav = header.querySelector("[data-header-nav]");
  if (!toggle || !nav) return;

  /* Mark as JS-enhanced — CSS uses this to hide nav on mobile */
  header.setAttribute("data-nav-enhanced", "");

  /* Reveal the toggle button (hidden by default in HTML for no-JS) */
  toggle.hidden = false;
  toggle.setAttribute("aria-expanded", "false");

  toggle.addEventListener("click", function () {
    var isOpen = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", isOpen ? "false" : "true");

    if (!isOpen) {
      /* Focus first nav link when opening */
      var firstLink = nav.querySelector("a");
      if (firstLink) firstLink.focus();
    }
  });

  /* Close on Escape key */
  header.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      var isOpen = toggle.getAttribute("aria-expanded") === "true";
      if (isOpen) {
        toggle.setAttribute("aria-expanded", "false");
        toggle.focus();
      }
    }
  });

  /* Close nav when a link is clicked (mobile) */
  nav.addEventListener("click", function (e) {
    if (e.target.closest("a")) {
      toggle.setAttribute("aria-expanded", "false");
    }
  });

  /* ── Sticky stacking: position header below announcement bar ── */

  var bar = document.querySelector("[data-announcement-bar]");

  function updateHeaderTop() {
    var barHeight = bar && !bar.hidden ? bar.offsetHeight : 0;
    header.style.top = barHeight + "px";
  }

  updateHeaderTop();
  window.addEventListener("resize", updateHeaderTop);

  /* Re-measure when announcement bar is dismissed (hidden attribute changes) */
  if (bar && "MutationObserver" in window) {
    new MutationObserver(updateHeaderTop).observe(bar, {
      attributes: true,
      attributeFilter: ["hidden"],
    });
  }

  /* ── Scroll-shrink: compact header on scroll ── */

  var SCROLL_THRESHOLD = 10;
  var ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;

    requestAnimationFrame(function () {
      var navOpen = toggle.getAttribute("aria-expanded") === "true";

      if (window.scrollY > SCROLL_THRESHOLD && !navOpen) {
        header.classList.add("header--compact");
      } else if (window.scrollY <= SCROLL_THRESHOLD) {
        header.classList.remove("header--compact");
      }

      ticking = false;
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });

  /* Remove compact when mobile nav opens, restore when it closes */
  toggle.addEventListener("click", function () {
    setTimeout(function () {
      var navOpen = toggle.getAttribute("aria-expanded") === "true";
      if (navOpen) {
        header.classList.remove("header--compact");
      } else if (window.scrollY > SCROLL_THRESHOLD) {
        header.classList.add("header--compact");
      }
    }, 0);
  });
})();
