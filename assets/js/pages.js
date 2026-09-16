document.querySelectorAll("#year").forEach((el) => { el.textContent = new Date().getFullYear(); });

document.querySelectorAll(".row-expand-all").forEach((button) => {
  const list = document.querySelector(button.dataset.target);
  if (!list) return;
  const rows = [...list.querySelectorAll(".row-details, .talk-details, .tl-details")];
  const sync = () => {
    const visible = rows.filter((row) => !row.closest("[hidden]"));
    const allOpen = visible.length > 0 && visible.every((row) => row.open);
    button.textContent = allOpen ? "Collapse all" : "Expand all";
    button.setAttribute("aria-pressed", String(allOpen));
  };
  rows.forEach((row) => row.addEventListener("toggle", sync));
  button.addEventListener("click", () => {
    const visible = rows.filter((row) => !row.closest("[hidden]"));
    const open = !visible.every((row) => row.open);
    visible.forEach((row) => { row.open = open; });
    sync();
  });
  sync();
});

// Conference presentations: filter chips (All / Talks / Posters / Awarded).
(() => {
  const list = document.querySelector("#talks-list");
  const filters = [...document.querySelectorAll(".talk-filter")];
  if (!list || !filters.length) return;
  const items = [...list.querySelectorAll(".tl-item")];
  const apply = (mode) => {
    items.forEach((item) => {
      const show = mode === "all" || (mode === "award" ? item.dataset.award === "1" : item.dataset.kind === mode);
      item.hidden = !show;
      item.classList.remove("is-last-visible");
    });
    const visible = items.filter((item) => !item.hidden);
    if (visible.length) visible[visible.length - 1].classList.add("is-last-visible");
    filters.forEach((f) => f.setAttribute("aria-pressed", String(f.dataset.filter === mode)));
  };
  filters.forEach((f) => f.addEventListener("click", () => apply(f.dataset.filter)));
  apply("all");
})();
