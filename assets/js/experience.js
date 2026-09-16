    document.getElementById("year").textContent = new Date().getFullYear();

    const monthIndex = (value) => {
      const [year, month] = value.split("-").map(Number);
      return year * 12 + month - 1;
    };
    const today = new Date();
    // Ongoing roles are drawn through at least Dec 2026 (the internship runs through December).
    const currentMonth = Math.max(today.getFullYear() * 12 + today.getMonth(), 2026 * 12 + 11);
    const periods = [...document.querySelectorAll(".experience-period")].map((element) => {
      const dates = element.querySelectorAll("time");
      return { element, start: monthIndex(dates[0].dateTime),
        end: dates[1] ? monthIndex(dates[1].dateTime) : currentMonth, current: !dates[1] };
    });
    const earliest = Math.min(...periods.map((period) => period.start));
    const firstYear = Math.floor(earliest / 12);
    const timelineStart = earliest - 2;
    const lastMonth = Math.max(currentMonth, ...periods.map((period) => period.end));
    const timelineEnd = (Math.floor(lastMonth / 12) + 1) * 12;
    const timelineSpan = Math.max(1, timelineEnd - timelineStart);
    const pct = (month) => `${100 * (month - timelineStart) / timelineSpan}%`;
    const years = [];
    for (let y = firstYear; y * 12 < timelineEnd; y++) years.push(y);
    periods.forEach(({ element, start, end, current }) => {
      element.style.setProperty("--period-start", pct(start));
      element.style.setProperty("--period-length", `${100 * (end - start + 1) / timelineSpan}%`);
      element.style.setProperty("--period-end", pct(end + 1));
      element.closest(".experience-item").classList.toggle("is-current", current);
      const grid = document.createElement("span");
      grid.className = "period-grid"; grid.setAttribute("aria-hidden", "true");
      years.filter((y) => y * 12 > timelineStart).forEach((y) => { const tick = document.createElement("i"); tick.style.left = pct(y * 12); grid.append(tick); });
      element.prepend(grid);
    });
    // Duration label above each bar (ongoing roles count up to today, not to the drawn end).
    const realMonth = today.getFullYear() * 12 + today.getMonth();
    periods.forEach(({ element, start, end, current }) => {
      const months = (current ? Math.max(start, realMonth) : end) - start + 1;
      const label = document.createElement("span");
      label.className = "period-duration";
      label.textContent = months < 12 ? `${months} mo` : `${(months / 12).toFixed(1)} y`;
      element.querySelector(".period-track").append(label);
    });
    const axis = document.createElement("div");
    axis.className = "period-axis"; axis.setAttribute("aria-hidden", "true");
    years.forEach((y) => { const label = document.createElement("span"); label.textContent = y; label.style.left = pct((Math.max(y * 12, timelineStart) + Math.min((y + 1) * 12, timelineEnd)) / 2); axis.append(label); });
    document.querySelector(".experience-list").after(axis);
    // Place the tilted date labels: each ends at its pin, both on one baseline,
    // nudged apart when they would collide and kept inside the timeline column.
    const COS = Math.cos(25 * Math.PI / 180), SIN = Math.sin(25 * Math.PI / 180);
    const layoutDates = () => periods.forEach(({ element, start, end }) => {
      const track = element.querySelector(".period-track");
      const width = track.offsetWidth;
      const startLabel = element.querySelector(".period-dates > time");
      const endLabel = element.querySelector(".period-end");
      const startReach = startLabel.offsetWidth * COS + 2;
      const endReach = endLabel.offsetWidth * COS + 2;
      const overhang = endLabel.offsetHeight * SIN + 2;
      const toX = (month) => width * (month - timelineStart) / timelineSpan;
      let endX = Math.min(width - overhang, toX(end + 1));
      let startX = Math.min(toX(start), endX - endReach - 8);
      if (startX < startReach) {
        startX = startReach;
        endX = Math.min(width - overhang, Math.max(endX, startX + endReach + 8));
      }
      startLabel.style.right = `${width - startX + 2}px`;
      const duration = element.querySelector(".period-duration");
      const half = duration.offsetWidth / 2;
      const mid = (toX(start) + Math.min(width, toX(end + 1))) / 2;
      duration.style.left = `${Math.min(width - half, Math.max(half, mid))}px`;
      endLabel.style.right = `${width - endX + 2}px`;
    });
    layoutDates();
    window.addEventListener("resize", layoutDates);

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const revealItems = document.querySelectorAll(".motion-reveal");

    if (reduceMotion || !("IntersectionObserver" in window)) {
      revealItems.forEach((item) => item.classList.add("is-visible"));
    } else {
      const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.14, rootMargin: "0px 0px -5%" });
      revealItems.forEach((item) => revealObserver.observe(item));
    }

    const setOpen = (card, open) => {
      card.classList.toggle("is-open", open);
      card.querySelector(".experience-trigger").setAttribute("aria-expanded", String(open));
      card.querySelector(".experience-detail").setAttribute("aria-hidden", String(!open));
    };
    const experienceCards = [...document.querySelectorAll(".experience-item")];
    const expandAll = document.querySelector(".experience-expand-all");
    const syncExpandAll = () => {
      const allOpen = experienceCards.every((card) => card.classList.contains("is-open"));
      expandAll.textContent = allOpen ? "Collapse all" : "Expand all";
      expandAll.setAttribute("aria-pressed", String(allOpen));
    };
    experienceCards.forEach((card) => {
      card.querySelector(".experience-trigger").addEventListener("click", () => {
        setOpen(card, !card.classList.contains("is-open"));
        syncExpandAll();
      });
    });
    expandAll.addEventListener("click", () => {
      const open = !experienceCards.every((card) => card.classList.contains("is-open"));
      experienceCards.forEach((card) => setOpen(card, open));
      syncExpandAll();
    });
