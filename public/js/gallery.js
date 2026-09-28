/* Masonry gallery filtering + lightbox: fade/slide, swipe, keyboard */
(function () {
  document.addEventListener("DOMContentLoaded", () => {
    const grid = document.querySelector(".masonry");
    if (!grid) return;
    const figures = [...grid.querySelectorAll("figure")];

    /* Filtering */
    document.querySelectorAll(".filters button").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".filters button").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const cat = btn.dataset.filter;
        figures.forEach((f) => {
          const show = cat === "all" || f.dataset.category === cat;
          f.style.display = show ? "" : "none";
        });
      });
    });

    /* Lightbox */
    const lb = document.querySelector(".lightbox");
    if (!lb) return;
    const lbImg = lb.querySelector("img");
    const lbPrev = lb.querySelector(".lb-prev");
    const lbNext = lb.querySelector(".lb-next");
    let index = 0, lastFocus = null;
    let mode = "gallery", renderRequest = 0;
    const visible = () => figures.filter((f) => f.style.display !== "none");

    const render = (dir = 0) => {
      const list = visible();
      if (!list.length) return;
      const img = list[index].querySelector("img");
      const request = ++renderRequest;
      lbImg.style.setProperty("--lb-shift", dir ? `${dir * -18}px` : "0px");
      lbImg.classList.add("is-swapping");
      const next = new Image();
      next.onload = next.onerror = () => {
        if (request !== renderRequest || mode !== "gallery") return;
        lbImg.src = next.src;
        lbImg.alt = img.alt;
        lbImg.style.setProperty("--lb-shift", dir ? `${dir * 18}px` : "0px");
        requestAnimationFrame(() => requestAnimationFrame(() => lbImg.classList.remove("is-swapping")));
      };
      next.src = img.dataset.full || img.src;
    };

    const close = () => {
      renderRequest++;
      mode = "gallery";
      lb.classList.remove("open");
      lb.classList.remove("lightbox--brochure");
      lb.setAttribute("aria-label", "Image viewer");
      document.body.classList.remove("menu-open");
      lastFocus && lastFocus.focus?.();
    };
    const open = (fig) => {
      lastFocus = document.activeElement;
      mode = "gallery";
      lb.classList.remove("lightbox--brochure");
      lb.setAttribute("aria-label", "Image viewer");
      index = visible().indexOf(fig);
      render();
      lb.classList.add("open");
      document.body.classList.add("menu-open");
      lb.querySelector(".lb-close").focus();
    };
    const openBrochure = (button) => {
      renderRequest++;
      mode = "brochure";
      lastFocus = button;
      lbImg.classList.remove("is-swapping");
      lbImg.src = button.dataset.brochure;
      lbImg.alt = button.dataset.brochureAlt || "Package itinerary brochure";
      lb.setAttribute("aria-label", button.dataset.brochureTitle || "Package itinerary brochure");
      lb.classList.add("lightbox--brochure", "open");
      document.body.classList.add("menu-open");
      lb.querySelector(".lb-close").focus();
    };
    const move = (d) => {
      if (mode !== "gallery") return;
      const list = visible();
      if (!list.length) return;
      index = (index + d + list.length) % list.length;
      render(d);
    };

    figures.forEach((f) => {
      f.addEventListener("click", () => open(f));
      f.tabIndex = 0;
      f.addEventListener("keydown", (e) => { if (e.key === "Enter") open(f); });
    });
    document.querySelectorAll("[data-brochure]").forEach((button) => {
      button.addEventListener("click", () => openBrochure(button));
    });
    lb.querySelector(".lb-close").addEventListener("click", close);
    lbPrev.addEventListener("click", () => move(-1));
    lbNext.addEventListener("click", () => move(1));
    document.addEventListener("keydown", (e) => {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") close();
      if (mode === "gallery" && e.key === "ArrowLeft") move(-1);
      if (mode === "gallery" && e.key === "ArrowRight") move(1);
    });
    lb.addEventListener("click", (e) => { if (e.target === lb) close(); });

    /* Swipe gestures */
    let sx = 0, sy = 0, tracking = false;
    lb.addEventListener("touchstart", (e) => {
      tracking = e.touches.length === 1;
      if (tracking) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }
    }, { passive: true });
    lb.addEventListener("touchend", (e) => {
      if (!tracking) return;
      tracking = false;
      const t = e.changedTouches[0];
      const dx = t.clientX - sx, dy = t.clientY - sy;
      if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy)) move(dx < 0 ? 1 : -1);
      else if (dy > 90 && Math.abs(dy) > Math.abs(dx)) close();
    }, { passive: true });
  });
})();
