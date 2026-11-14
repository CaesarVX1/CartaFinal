(() => {
  const birthday = document.querySelector("#anniversary-destination");
  const body = document.querySelector("#anniversary-entry-content");
  const footer = birthday?.querySelector(".birthday-controls");
  const adminList = document.querySelector("#wish-admin-list");
  const adminCount = document.querySelector("#wish-admin-count");
  if (!birthday || !body || !footer || !adminList) return;
  const node = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  };
  const button = (text, handler) => {
    const element = node("button", "wish-archive-button", text);
    element.type = "button";
    element.addEventListener("click", handler);
    return element;
  };
  const formatter = new Intl.DateTimeFormat("es-ES", { dateStyle: "long", timeStyle: "short" });
  const dateLabel = (value) => Number.isFinite(new Date(value).getTime()) ? formatter.format(new Date(value)) : "Fecha desconocida";
  function localDate(value) {
    const date = new Date(value);
    if (!Number.isFinite(date.getTime())) return "";
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 19);
  }

  async function request(payload, signal) {
    const endpoint = window.CARTA_CONFIG?.wishesEndpoint;
    if (!endpoint) throw new Error("El archivo no está conectado a Supabase.");
    const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload), signal });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      const messages = {
        400: "No se pudo completar la operación. Comprueba los datos y que la función de Supabase esté actualizada.",
        401: "La sesión ya no es válida. Vuelve a entrar al archivo.",
        403: "Este acceso es solo de lectura; no permite cambiar deseos.",
        409: "Este deseo cambió o ya no existe. Cierra la ventana y actualiza el archivo antes de intentarlo de nuevo.",
      };
      throw new Error(messages[response.status] || "No se pudo conectar con el archivo. Inténtalo de nuevo.");
    }
    return result;
  }

  async function allWishes(action, password, signal) {
    const wishes = [];
    let page = 0, result;
    do {
      result = await request({ action, password, page }, signal);
      if (!Array.isArray(result.wishes)) throw new Error("El archivo devolvió una respuesta no válida.");
      wishes.push(...result.wishes);
      page += 1;
    } while (result.hasMore === true);
    return { wishes: [...new Map(wishes.map((wish) => [String(wish.id), wish])).values()], role: result.role };
  }

  const gallery = node("section", "birthday-wishes");
  gallery.id = "birthday-wishes";
  gallery.setAttribute("aria-label", "Deseos entre las estrellas");
  gallery.hidden = true;
  const heading = node("header", "birthday-wishes__header");
  const headingCopy = node("div");
  headingCopy.append(node("p", "birthday-eyebrow", "Lo que confiamos a las estrellas"), node("h2", "", "Un cielo de deseos"));
  const refresh = button("Actualizar", () => refreshGallery());
  heading.append(headingCopy, refresh);
  const galleryStatus = node("p", "birthday-wishes__status");
  galleryStatus.setAttribute("role", "status");
  const cards = node("div", "birthday-wishes__cards");
  gallery.append(heading, galleryStatus, cards);
  body.append(gallery);
  const galleryToggle = button("Ocultar deseos", () => {
    gallery.hidden = !gallery.hidden;
    galleryToggle.textContent = gallery.hidden ? "Mostrar deseos" : "Ocultar deseos";
    galleryToggle.setAttribute("aria-expanded", String(!gallery.hidden));
    if (!gallery.hidden) refreshGallery();
  });
  galleryToggle.classList.add("anniversary-destination__back");
  galleryToggle.setAttribute("aria-controls", gallery.id);
  galleryToggle.hidden = true;
  footer.insertBefore(galleryToggle, document.querySelector("#birthday-return"));
  let galleryOpen = false, galleryEpoch = 0, poll = null, galleryRequest = null, gallerySignature = "";

  function renderCards(wishes) {
    const signature = JSON.stringify(wishes);
    if (signature === gallerySignature) return;
    gallerySignature = signature;
    const fragment = document.createDocumentFragment();
    wishes.forEach((wish) => {
      const card = node("article", "birthday-wishes__card");
      const time = node("time", "birthday-wishes__date", dateLabel(wish.created_at));
      time.dateTime = wish.created_at;
      card.append(node("span", "birthday-wishes__star", "✦"), time, node("p", "birthday-wishes__text", wish.wish));
      fragment.append(card);
    });
    cards.replaceChildren(fragment);
  }

  async function refreshGallery() {
    clearTimeout(poll);
    if (!galleryOpen || document.hidden || gallery.hidden || galleryRequest) return;
    const epoch = galleryEpoch;
    const controller = new AbortController();
    galleryRequest = controller;
    refresh.disabled = true;
    if (!gallerySignature) galleryStatus.textContent = "Buscando los deseos que llegaron a las estrellas...";
    try {
      const { wishes } = await allWishes("gallery", undefined, controller.signal);
      if (!galleryOpen || epoch !== galleryEpoch) return;
      renderCards(wishes);
      galleryStatus.textContent = wishes.length ? `${wishes.length} ${wishes.length === 1 ? "deseo guardado" : "deseos guardados"}` : "Todavía no hay deseos guardados. Los próximos aparecerán aquí.";
    } catch (error) {
      if (error.name !== "AbortError" && galleryOpen && epoch === galleryEpoch) galleryStatus.textContent = error.message;
    } finally {
      if (galleryRequest === controller) galleryRequest = null;
      if (galleryOpen && epoch === galleryEpoch) {
        refresh.disabled = false;
        poll = setTimeout(refreshGallery, 15000);
      }
    }
  }

  function closeGallery() {
    galleryOpen = false;
    galleryEpoch += 1;
    clearTimeout(poll);
    galleryRequest?.abort();
    galleryRequest = null;
    gallery.hidden = galleryToggle.hidden = true;
  }

  function openGallery() {
    closeGallery();
    galleryOpen = true;
    gallery.hidden = galleryToggle.hidden = false;
    galleryToggle.textContent = "Ocultar deseos";
    galleryToggle.setAttribute("aria-expanded", "true");
    refreshGallery();
  }

  let adminPassword = "", adminRole = "viewer", adminWishes = [], adminEpoch = 0;
  let selected = null, deleting = false, busy = false, initialDate = "";
  const editor = node("dialog", "wish-editor");
  editor.id = "wish-editor";
  editor.setAttribute("aria-labelledby", "wish-editor-title");
  const editorTitle = node("h2", "", "Editar deseo");
  editorTitle.id = "wish-editor-title";
  const form = node("form", "wish-editor__form");
  const textLabel = node("label", "", "Texto del deseo");
  const text = node("textarea");
  text.id = "wish-editor-text";
  text.required = true;
  text.maxLength = 600;
  text.rows = 6;
  textLabel.htmlFor = text.id;
  const dateLabelNode = node("label", "", "Fecha y hora de creación");
  const date = node("input");
  date.type = "datetime-local";
  date.id = "wish-editor-date";
  date.required = true;
  date.step = "1";
  dateLabelNode.htmlFor = date.id;
  const zone = node("p", "wish-editor__note", `Hora local: ${Intl.DateTimeFormat().resolvedOptions().timeZone}.`);
  const confirmation = node("p", "wish-editor__confirmation", "¿Eliminar este deseo definitivamente? No se puede deshacer.");
  const editorStatus = node("p", "wish-editor__status");
  editorStatus.setAttribute("role", "status");
  const editorActions = node("div", "wish-editor__actions");
  const cancel = button("Cancelar", () => { if (!busy) editor.close(); });
  const save = node("button", "wish-archive-button", "Guardar cambios");
  save.type = "submit";
  editorActions.append(cancel, save);
  form.append(textLabel, text, dateLabelNode, date, zone, confirmation, editorStatus, editorActions);
  editor.append(editorTitle, form);
  document.body.append(editor);

  function openEditor(wish, remove) {
    if (adminRole !== "admin" || busy) return;
    selected = wish;
    deleting = remove;
    text.value = wish.wish;
    date.value = localDate(wish.created_at);
    initialDate = date.value;
    text.readOnly = date.readOnly = remove;
    confirmation.hidden = !remove;
    editorStatus.textContent = "";
    editorTitle.textContent = remove ? "Eliminar deseo" : "Editar deseo";
    save.textContent = remove ? "Sí, eliminar definitivamente" : "Guardar cambios";
    editor.showModal();
    (remove ? cancel : text).focus();
  }

  function renderAdmin() {
    adminList.replaceChildren();
    adminCount.textContent = `${adminWishes.length} ${adminWishes.length === 1 ? "deseo guardado" : "deseos guardados"}`;
    if (!adminWishes.length) adminList.append(node("p", "wish-admin__empty", "Todavía no hay ningún deseo esperando aquí."));
    adminWishes.forEach((wish, index) => {
      const article = node("article", "wish-admin__item");
      article.append(node("p", "wish-admin__item-meta", `Deseo ${String(adminWishes.length - index).padStart(2, "0")} · ${dateLabel(wish.created_at)}`), node("p", "wish-admin__item-message", wish.wish));
      adminList.append(article);
    });
  }

  function lockAdmin() {
    adminEpoch += 1;
    adminPassword = "";
    adminRole = "viewer";
    adminWishes = [];
    if (editor.open) editor.close();
  }

  async function openAdmin(password, wishes, role, hasMore) {
    lockAdmin();
    const epoch = adminEpoch;
    adminPassword = password;
    adminRole = role === "admin" ? "admin" : "viewer";
    adminWishes = Array.isArray(wishes) ? wishes : [];
    renderAdmin();
    if (hasMore) {
      try {
        const result = await allWishes("list", password);
        if (epoch !== adminEpoch) return;
        adminWishes = result.wishes;
        renderAdmin();
      } catch { if (epoch === adminEpoch) adminCount.textContent += " · No se pudo cargar el resto; vuelve a entrar para reintentar."; }
    }
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (busy || !selected || adminRole !== "admin") return;
    const wish = selected;
    const epoch = adminEpoch;
    const createdAt = date.value === initialDate ? wish.created_at : new Date(date.value).toISOString();
    busy = true;
    save.disabled = cancel.disabled = true;
    editorStatus.textContent = deleting ? "Eliminando..." : "Guardando cambios...";
    try {
      const result = await request({ action: deleting ? "delete" : "update", password: adminPassword, id: wish.id,
        wish: text.value.trim(), createdAt, previous: { wish: wish.wish, createdAt: wish.created_at } });
      if (epoch !== adminEpoch) return;
      adminWishes = deleting ? adminWishes.filter((item) => String(item.id) !== String(wish.id))
        : adminWishes.map((item) => String(item.id) === String(wish.id) ? result.wish : item);
      adminWishes.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      renderAdmin();
      editor.close();
      window.dispatchEvent(new Event("wishes:changed"));
    } catch (error) {
      if (epoch === adminEpoch) editorStatus.textContent = error.message;
    } finally {
      busy = false;
      save.disabled = cancel.disabled = false;
    }
  });
  editor.addEventListener("cancel", (event) => { if (busy) event.preventDefault(); });
  editor.addEventListener("close", () => { selected = null; text.value = date.value = ""; });
  document.addEventListener("visibilitychange", () => { if (!document.hidden) refreshGallery(); else clearTimeout(poll); });
  window.addEventListener("wishes:changed", () => { gallerySignature = ""; refreshGallery(); });
  window.CARTA_WISHES = Object.freeze({ openGallery, closeGallery, openAdmin, lockAdmin });
})();
