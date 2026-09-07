/* Scroll reveal, counters, typing animation, parallax hero */
(function () {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Scroll reveal ---------- */
  /* Auto-tag common content so every major section reveals */
  function autoTag() {
    const sels = [
      ".section h2", ".section h3", ".section > .container > p",
      ".card", ".masonry figure", ".timeline .tl-day", ".stat",
      ".testimonial", ".slider__track > *", "form", ".btn-row", ".feature"
    ];
    sels.forEach((sel) => {
      document.querySelectorAll(sel).forEach((el, i) => {
        if (el.closest(".site-header, .mobile-menu, .lightbox, #preloader")) return;
        if (!el.hasAttribute("data-reveal")) {
          el.setAttribute("data-reveal", "");
          if (!el.dataset.delay) el.dataset.delay = String(Math.min(i % 6, 5) * 80);
        }
      });
    });
  }

  function initReveal() {
    autoTag();
    const items = document.querySelectorAll("[data-reveal]");
    if (!("IntersectionObserver" in window) || reduce) {
      items.forEach((i) => i.classList.add("in-view"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en, idx) => {
          if (en.isIntersecting) {
            const delay = parseInt(en.target.dataset.delay ?? idx * 70, 10) || 0;
            setTimeout(() => en.target.classList.add("in-view"), delay);
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px" }
    );
    items.forEach((i) => io.observe(i));
  }

  /* ---------- Counters ---------- */
  function initCounters() {
    const nums = document.querySelectorAll("[data-count]");
    if (!nums.length) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const el = en.target;
        const target = parseFloat(el.dataset.count);
        const suffix = el.dataset.suffix || "";
        const dur = 1600;
        const start = performance.now();
        const tick = (now) => {
          const p = Math.min((now - start) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased).toLocaleString("en-IN") + suffix;
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        io.unobserve(el);
      });
    }, { threshold: 0.4 });
    nums.forEach((n) => io.observe(n));
  }

  /* ---------- Typing animation ---------- */
  function initTyping() {
    const el = document.querySelector("[data-typed]");
    if (!el) return;
    const words = JSON.parse(el.dataset.typed);
    let w = 0, c = 0, deleting = false;
    const loop = () => {
      const word = words[w];
      el.textContent = deleting ? word.slice(0, --c) : word.slice(0, ++c);
      let speed = deleting ? 45 : 90;
      if (!deleting && c === word.length) { speed = 1600; deleting = true; }
      else if (deleting && c === 0) { deleting = false; w = (w + 1) % words.length; speed = 350; }
      setTimeout(loop, speed);
    };
    if (reduce) { el.textContent = words[0]; return; }
    loop();
  }

  /* ---------- Hero parallax ---------- */
  /* ---------- Image reveal ---------- */
  function initImageReveal() {
    const skip = ".site-header, .mobile-menu, .lightbox, #preloader, .hero__bg, .page-hero, .brand, footer .brand";
    const imgs = [...document.querySelectorAll("img")].filter(
      (img) => !img.closest(skip) && !img.classList.contains("img-fx")
    );
    if (!imgs.length) return;

    const reveal = (img) => {
      const show = () => img.classList.add("is-revealed");
      if (img.complete && img.naturalWidth) requestAnimationFrame(show);
      else {
        img.addEventListener("load", show, { once: true });
        img.addEventListener("error", show, { once: true });
        setTimeout(show, 2500);
      }
    };

    imgs.forEach((img) => img.classList.add("img-fx"));

    if (reduce || !("IntersectionObserver" in window)) {
      imgs.forEach((img) => img.classList.add("is-revealed"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          io.unobserve(en.target);
          const delay = (parseInt(en.target.dataset.delay, 10) || 0) % 400;
          setTimeout(() => reveal(en.target), delay);
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px" }
    );
    imgs.forEach((img) => io.observe(img));
  }

  function initParallax() {
    const bg = document.querySelector(".hero__bg");
    if (!bg || reduce) return;
    let ticking = false;
    window.addEventListener("scroll", () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        bg.style.transform = `translate3d(0, ${window.scrollY * 0.28}px, 0)`;
        ticking = false;
      });
    }, { passive: true });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initReveal();
    initCounters();
    initTyping();
    initParallax();
    initImageReveal();
  });
})();
