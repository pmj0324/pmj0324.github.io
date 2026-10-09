// Cross-document page transitions: carousel push for the content and a background pan.
(() => {
  const ORDER = ["index", "about", "research", "publications", "blog", "calendar", "game"];
  const BG_STEP = 60; // px of background pan per page in the nav order
  const rank = (href) => {
    try {
      const path = new URL(href, location.href).pathname.replace(/\/+$/, "");
      const name = path.includes("/blog") ? "blog" : ((path.split("/").pop() || "index").replace(/\.html$/, "") || "index");
      const i = ORDER.indexOf(name);
      return i < 0 ? 0 : i;
    } catch (e) { return 0; }
  };
  const here = rank(location.href);
  window.__pageRank = here;
  window.__bgStep = BG_STEP;
  window.__bgPages = ORDER.length;
  const rootStyle = document.documentElement.style;
  rootStyle.setProperty("--bgp-rank", here);
  rootStyle.setProperty("--bgp-step", `${BG_STEP}px`);
  rootStyle.setProperty("--bgp-pages", ORDER.length);

  window.addEventListener("pageswap", (event) => {
    if (!event.viewTransition) return;
    try { sessionStorage.setItem("vt-from-rank", String(here)); } catch (e) {}
  });

  window.addEventListener("pagereveal", (event) => {
    if (!event.viewTransition) return;
    let from = here;
    try { from = Number(sessionStorage.getItem("vt-from-rank")); } catch (e) {}
    if (!Number.isFinite(from)) from = here;
    const root = document.documentElement.style;
    root.setProperty("--vt-dist", here >= from ? "100vw" : "-100vw");
    root.setProperty("--vt-bg-from", `${(here - from) * BG_STEP}px`);
    // Show scroll-reveal content right away so the incoming snapshot isn't missing it.
    const reveal = () => document.querySelectorAll(".motion-reveal").forEach((el) => el.classList.add("is-visible"));
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", reveal, { once: true });
    else reveal();
  });
})();
