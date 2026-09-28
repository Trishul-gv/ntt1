/* Loads reusable HTML components (header, footer, floating buttons)
   into any page that has <div data-include="components/header.html"></div> */
(function () {
  const PHONE = "+919482242996";
  const WHATSAPP = "919482242996";
  const EMAIL = "nitheshtravelsckm@gmail.com";
  const MAPS = "https://maps.app.goo.gl/pwsdoigqZkwTpUfS7";

  async function include(el) {
    const url = el.getAttribute("data-include");
    try {
      const res = await fetch(url, { cache: "no-cache" });
      el.innerHTML = await res.text();
    } catch (e) {
      console.warn("Could not load component:", url, e);
    }
  }

  async function loadComponents() {
    const nodes = [...document.querySelectorAll("[data-include]")];
    await Promise.all(nodes.map(include));
    highlightCurrentPage();
    document.dispatchEvent(new CustomEvent("components:loaded"));
  }

  /* Highlight the active nav link */
  function highlightCurrentPage() {
    const here = (location.pathname.split("/").pop() || "index.html").toLowerCase();
    document.querySelectorAll(".nav__links a, .mobile-menu a").forEach((a) => {
      const href = (a.getAttribute("href") || "").toLowerCase();
      if (href === here) a.setAttribute("aria-current", "page");
    });
  }

  window.NTT = { PHONE, WHATSAPP, EMAIL, MAPS };
  document.addEventListener("DOMContentLoaded", loadComponents);
})();
