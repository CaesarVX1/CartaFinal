(() => {
  const dock = document.querySelector("#floating-controls");
  const welcome = document.querySelector("#welcome-menu");
  const starFragment = document.querySelector("#star-fragment");
  const admin = document.querySelector("#wish-admin");
  const arrival = document.querySelector("#cyber-arrival-screen");
  const video = document.querySelector("#cyber-video-overlay");
  const sky = document.querySelector("#starry-sky");
  const warnings = document.querySelector("#cyber-warning-layer");
  const nativeDialogs = [...document.querySelectorAll("dialog")];
  const managedInert = new Map();
  const focusReturns = new Map();
  let active = null;
  let allowsDock = false;
  let queued = false;

  function isVisible(element) { return element?.classList.contains("is-visible"); }

  function restoreInert() {
    managedInert.forEach((previous, element) => { element.inert = previous; });
    managedInert.clear();
  }

  function isolate(container, allowed) {
    [...container.children].forEach((element) => {
      if (element.matches("script, style, link, audio, dialog") || allowed.includes(element)) return;
      if (allowed.some((node) => element.contains(node))) {
        isolate(element, allowed);
      } else {
        managedInert.set(element, element.inert);
        element.inert = true;
      }
    });
  }

  function focusable(container) {
    return [...container.querySelectorAll('button, input, textarea, select, a[href], [tabindex], video[controls], audio[controls]')].filter((element) =>
      !element.disabled && (element.tabIndex >= 0 || element.matches("video[controls], audio[controls]")) && !element.closest("[inert], [hidden]") &&
      element.getClientRects().length > 0 && getComputedStyle(element).visibility !== "hidden"
    );
  }

  function measureDock() {
    const height = dock?.classList.contains("is-visible") && !dock.classList.contains("is-covered")
      ? dock.getBoundingClientRect().height : 0;
    document.body.style.setProperty("--controls-height", `${Math.ceil(height)}px`);
  }

  function sync() {
    queued = false;
    const nativeOpen = nativeDialogs.some((dialog) => dialog.open);
    const blocking = isVisible(admin) ? admin : isVisible(starFragment) ? starFragment : null;
    const warning = warnings?.querySelector(".cyber-warning-card");
    const next = nativeOpen ? null : blocking ||
      (!welcome.classList.contains("is-hidden") ? welcome : null) ||
      (isVisible(arrival) ? arrival : null) || (isVisible(video) ? video : null) || warning || (isVisible(sky) ? sky : null);
    allowsDock = !!next && [arrival, video, warning, sky].includes(next);
    restoreInert();
    welcome.inert = welcome.classList.contains("is-hidden");
    dock.classList.toggle("is-covered", nativeOpen || !!blocking);
    dock.inert = nativeOpen || !!blocking || !dock.classList.contains("is-visible");
    document.body.classList.toggle("ui-overlay-open", nativeOpen || !!blocking || !!warning || isVisible(arrival) || isVisible(video) || isVisible(sky));
    if (next) isolate(document.body, allowsDock ? [next, dock] : [next]);
    if (next !== active) {
      const previous = active;
      active = next;
      if (next) focusReturns.set(next, document.activeElement);
      if (!nativeOpen) {
        const restore = focusReturns.get(previous);
        if (restore?.isConnected && !restore.closest("[inert]") && restore.getClientRects().length && getComputedStyle(restore).visibility !== "hidden") {
          restore.focus({ preventScroll: true });
        } else if (next) {
          const initial = next === welcome ? next.querySelector("[data-letter-target]") : focusable(next)[0];
          if (next !== welcome || document.activeElement !== document.body) initial?.focus({ preventScroll: true });
        }
      }
    }
    measureDock();
  }

  function queueSync() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(sync);
  }

  [welcome, starFragment, admin, arrival, video, sky, dock, ...nativeDialogs].filter(Boolean).forEach((element) => {
    new MutationObserver(queueSync).observe(element, { attributes: true, attributeFilter: ["class", "open"] });
  });
  new MutationObserver(queueSync).observe(warnings, { childList: true });
  new ResizeObserver(measureDock).observe(dock);

  function updateViewport() {
    const viewport = window.visualViewport;
    document.body.style.setProperty("--viewport-height", `${Math.round(viewport?.height || innerHeight)}px`);
    document.body.style.setProperty("--viewport-top", `${Math.round(viewport?.offsetTop || 0)}px`);
    measureDock();
  }
  window.addEventListener("resize", updateViewport);
  window.visualViewport?.addEventListener("resize", updateViewport);
  window.visualViewport?.addEventListener("scroll", updateViewport);

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Tab" || !active || nativeDialogs.some((dialog) => dialog.open)) return;
    const elements = [...focusable(active), ...(allowsDock ? focusable(dock) : [])];
    if (!elements.length) return;
    const index = elements.indexOf(document.activeElement);
    if (event.shiftKey && index <= 0) {
      event.preventDefault(); elements.at(-1).focus();
    } else if (!event.shiftKey && (index < 0 || index === elements.length - 1)) {
      event.preventDefault(); elements[0].focus();
    }
  });
  updateViewport();
  sync();
})();
