(function () {
  "use strict";

  const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (!reduceMotionQuery.matches) {
    document.addEventListener("DOMContentLoaded", () => {
      document.body.classList.add("page-enter");
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          document.body.classList.remove("page-enter");
        });
      });
    });
  }

  document.addEventListener("click", (event) => {
    const link = event.target.closest("a.nav-link");
    if (!link) {
      return;
    }

    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    const href = link.getAttribute("href");
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
      return;
    }

    if (link.target && link.target !== "_self") {
      return;
    }

    const targetUrl = new URL(link.href, window.location.href);
    if (targetUrl.origin !== window.location.origin) {
      return;
    }

    if (targetUrl.pathname === window.location.pathname && targetUrl.hash) {
      return;
    }

    if (reduceMotionQuery.matches) {
      return;
    }

    event.preventDefault();
    document.body.classList.add("page-leave");
    window.setTimeout(() => {
      window.location.href = link.href;
    }, 180);
  });
})();
