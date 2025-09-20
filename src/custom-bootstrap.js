// Initialize Bootstrap JS features and small app integrations

import "bootstrap/dist/js/bootstrap.bundle.min.js";

document.addEventListener("DOMContentLoaded", () => {
  // Enable tooltips
  try {
    const tList = Array.from(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tList.forEach((el) => new window.bootstrap.Tooltip(el));
  } catch (e) { /* noop */ }

  // Enable popovers
  try {
    const pList = Array.from(document.querySelectorAll('[data-bs-toggle="popover"]'));
    pList.forEach((el) => new window.bootstrap.Popover(el));
  } catch (e) { /* noop */ }

  // Lazy-load map iframe inside elements with .card.map and data-map-src
  try {
    const maps = document.querySelectorAll(".card.map");
    maps.forEach((card) => {
      let loaded = false;
      const loadMap = () => {
        if (loaded) return;
        const src = card.getAttribute("data-map-src");
        if (!src) return;
        const iframe = document.createElement("iframe");
        iframe.src = src;
        iframe.width = "100%";
        iframe.height = "200";
        iframe.style.border = "0";
        iframe.loading = "lazy";
        // remove placeholder text and append iframe
        card.querySelectorAll(".map-placeholder").forEach(n => n.remove());
        card.appendChild(iframe);
        loaded = true;
      };
      card.addEventListener("mouseenter", loadMap, { once: true });
      card.addEventListener("focusin", loadMap, { once: true });
      card.addEventListener("click", loadMap, { once: true });
    });
  } catch (e) { /* noop */ }
});