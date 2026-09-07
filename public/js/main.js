/* Core site behaviour: theme, nav, forms, counters, sliders, FAQ, ripple */
(function () {
  /* ---------- Theme (saved preference) ---------- */
  const root = document.documentElement;
  const saved = localStorage.getItem("ntt-theme");
  if (saved) root.setAttribute("data-theme", saved);
  else if (window.matchMedia("(prefers-color-scheme: dark)").matches) root.setAttribute("data-theme", "dark");

  function toggleTheme() {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    localStorage.setItem("ntt-theme", next);
  }

  /* ---------- Preloader ---------- */
  window.addEventListener("load", () => {
    const p = document.getElementById("preloader");
    if (p) setTimeout(() => p.classList.add("hidden"), 250);
  });

  /* ---------- Ripple on buttons ---------- */
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn");
    if (!btn) return;
    const r = document.createElement("span");
    const size = Math.max(btn.offsetWidth, btn.offsetHeight);
    const rect = btn.getBoundingClientRect();
    r.className = "ripple";
    r.style.width = r.style.height = size + "px";
    r.style.left = e.clientX - rect.left - size / 2 + "px";
    r.style.top = e.clientY - rect.top - size / 2 + "px";
    btn.appendChild(r);
    setTimeout(() => r.remove(), 620);
  });

  /* ---------- Header behaviour, runs after components load ---------- */
  function initHeader() {
    const header = document.querySelector(".site-header");
    const hero = document.querySelector(".hero");
    if (!header) return;

    const onScroll = () => {
      const trigger = hero ? window.innerHeight * 0.6 : 40;
      header.classList.toggle("is-solid", window.scrollY > trigger || !hero);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const burger = document.querySelector(".hamburger");
    const menu = document.querySelector(".mobile-menu");
    if (burger && menu) {
      let backdrop = document.querySelector(".menu-backdrop");
      if (!backdrop) {
        backdrop = document.createElement("div");
        backdrop.className = "menu-backdrop";
        document.body.appendChild(backdrop);
      }
      menu.setAttribute("aria-hidden", "true");
      let lastFocus = null;

      const focusables = () =>
        [...menu.querySelectorAll('a[href],button:not([disabled]),summary,[tabindex]:not([tabindex="-1"])')]
          .filter((el) => el.offsetParent !== null);

      const setMenu = (open) => {
        if (menu.classList.contains("open") === open) return;
        menu.classList.toggle("open", open);
        backdrop.classList.toggle("open", open);
        burger.classList.toggle("open", open);
        burger.setAttribute("aria-expanded", String(open));
        menu.setAttribute("aria-hidden", String(!open));
        document.body.classList.toggle("menu-open", open);
        if (open) {
          lastFocus = document.activeElement;
          setTimeout(() => focusables()[0]?.focus(), 60);
        } else {
          lastFocus && lastFocus.focus?.();
        }
      };

      burger.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        setMenu(!menu.classList.contains("open"));
      });
      backdrop.addEventListener("click", () => setMenu(false));
      menu.addEventListener("click", (e) => {
        if (e.target.closest("a") || e.target.closest(".menu-close")) setMenu(false);
      });
      document.addEventListener("keydown", (e) => {
        if (!menu.classList.contains("open")) return;
        if (e.key === "Escape") { setMenu(false); return; }
        if (e.key !== "Tab") return;
        const list = focusables();
        if (!list.length) return;
        const first = list[0], last = list[list.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      });
      window.addEventListener("resize", () => { if (window.innerWidth > 1024) setMenu(false); });
    }

    document.querySelectorAll(".has-drop > button").forEach((b) => {
      b.addEventListener("click", () => b.parentElement.classList.toggle("open"));
    });

    document.querySelectorAll("[data-theme-toggle]").forEach((b) => b.addEventListener("click", toggleTheme));
  }
  document.addEventListener("components:loaded", initHeader);

  /* ---------- Testimonial / generic slider ---------- */
  function initSliders() {
    document.querySelectorAll("[data-slider]").forEach((slider) => {
      const track = slider.querySelector(".slider__track");
      const slides = [...track.children];
      let i = 0;
      const perView = () => (window.innerWidth < 640 ? 1 : window.innerWidth < 960 ? 2 : 3);
      const max = () => Math.max(0, slides.length - perView());
      const go = (n) => {
        i = Math.min(Math.max(n, 0), max());
        const w = slides[0].getBoundingClientRect().width + 22.4;
        track.style.transform = `translateX(${-i * w}px)`;
      };
      slider.parentElement.querySelectorAll("[data-slide-prev]").forEach((b) => b.addEventListener("click", () => go(i - 1)));
      slider.parentElement.querySelectorAll("[data-slide-next]").forEach((b) => b.addEventListener("click", () => go(i + 1)));
      let timer = setInterval(() => go(i >= max() ? 0 : i + 1), 6000);
      slider.addEventListener("mouseenter", () => clearInterval(timer));
      slider.addEventListener("mouseleave", () => (timer = setInterval(() => go(i >= max() ? 0 : i + 1), 6000)));
      window.addEventListener("resize", () => go(i));
    });
  }

  /* ---------- Forms: validation + WhatsApp fallback ---------- */
  function initForms() {
    document.querySelectorAll("form[data-enquiry]").forEach((form) => {
      form.addEventListener("submit", (e) => {
        const name = form.querySelector('[name="name"]');
        const phone = form.querySelector('[name="phone"]');
        if (name && name.value.trim().length < 2) {
          e.preventDefault();
          name.focus();
          alert("Please enter your name.");
          return;
        }
        if (phone && !/^[0-9+\-\s()]{8,16}$/.test(phone.value.trim())) {
          e.preventDefault();
          phone.focus();
          alert("Please enter a valid phone number.");
        }
      });
    });

    document.querySelectorAll("[data-wa-send]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const form = btn.closest("form");
        const get = (n) => (form.querySelector(`[name="${n}"]`) || {}).value || "";
        const msg = `Hello Nithesh Tours And Travels,%0AName: ${encodeURIComponent(get("name"))}%0APhone: ${encodeURIComponent(get("phone"))}%0ATrip: ${encodeURIComponent(get("package") || get("subject"))}%0AMessage: ${encodeURIComponent(get("message"))}`;
        window.open(`https://wa.me/919482242996?text=${msg}`, "_blank", "noopener");
      });
    });
  }

  /* ---------- Expandable place lists on package cards ---------- */
  function initExpandableLists() {
    document.querySelectorAll("[data-expand-list]").forEach((list) => {
      const items = [...list.querySelectorAll("li")];
      const toggle = list.parentElement.querySelector("[data-expand-toggle]");
      if (!toggle) return;

      const moreCount = Math.max(0, items.length - 4);
      if (moreCount === 0) {
        toggle.hidden = true;
        return;
      }

      const collapse = () => {
        items.forEach((item, index) => {
          item.classList.toggle("is-hidden", index >= 4);
        });
        toggle.setAttribute("aria-expanded", "false");
        toggle.innerHTML = 'Show more <span aria-hidden="true">⌄</span>';
      };

      const expand = () => {
        items.forEach((item) => item.classList.remove("is-hidden"));
        toggle.setAttribute("aria-expanded", "true");
        toggle.innerHTML = 'Show less <span aria-hidden="true">⌃</span>';
      };

      collapse();
      toggle.addEventListener("click", () => {
        const expanded = toggle.getAttribute("aria-expanded") === "true";
        expanded ? collapse() : expand();
      });
    });
  }

  /* ---------- FAQ: close siblings ---------- */
  function initFaq() {
    document.querySelectorAll(".faq").forEach((group) => {
      group.querySelectorAll("details").forEach((d) => {
        d.addEventListener("toggle", () => {
          if (d.open) group.querySelectorAll("details").forEach((o) => o !== d && (o.open = false));
        });
      });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initSliders();
    initForms();
    initExpandableLists();
    initFaq();
  });
})();

/* ---------- PWA service worker (production hosts only) ---------- */
(function () {
  const h = location.hostname;
  const blocked =
    window.top !== window.self ||
    h === "localhost" || h === "127.0.0.1" ||
    h.startsWith("id-preview--") || h.startsWith("preview--") ||
    h.endsWith("lovableproject.com") || h.endsWith("lovable.app") ||
    h.endsWith("beta.lovable.dev") ||
    new URLSearchParams(location.search).has("sw-off");

  if (!("serviceWorker" in navigator)) return;
  if (blocked) {
    navigator.serviceWorker.getRegistrations?.().then((rs) => rs.forEach((r) => r.unregister()));
    return;
  }
  window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(() => {}));
})();
