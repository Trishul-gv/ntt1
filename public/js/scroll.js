/* Scroll progress bar, back-to-top visibility, smooth anchor scroll */
(function () {
  function initProgress() {
    const bar = document.querySelector(".progress-bar");
    const onScroll = () => {
      const h = document.documentElement;
      const pct = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
      if (bar) bar.style.width = pct + "%";
      const top = document.querySelector(".float-top");
      if (top) top.classList.toggle("show", h.scrollTop > 500);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  function initTop() {
    document.addEventListener("click", (e) => {
      const t = e.target.closest(".float-top");
      if (t) window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  document.addEventListener("DOMContentLoaded", () => { initProgress(); initTop(); });
  document.addEventListener("components:loaded", initProgress);
})();
