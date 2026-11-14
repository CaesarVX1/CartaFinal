(() => {
  window.createMoonReader = (scene, image, reducedMotion, canOpen) => {
    const hit = document.createElement("button");
    hit.type = "button";
    hit.className = "moon-reader-hit";
    hit.setAttribute("aria-label", "Leer el fragmento del pergamino");
    hit.setAttribute("aria-haspopup", "dialog");
    hit.hidden = true;
    const caption = document.createElement("span");
    caption.textContent = "Leer fragmento";
    hit.append(caption);
    scene.parentElement.append(hit);

    const dialog = document.createElement("dialog");
    dialog.className = "moon-reader";
    dialog.setAttribute("aria-labelledby", "moon-reader-title");
    const header = document.createElement("header");
    const label = document.createElement("p");
    label.className = "moon-reader__signal";
    label.textContent = "LUNAR LINK // FRAGMENT 01";
    const title = document.createElement("h2");
    title.id = "moon-reader-title";
    title.textContent = "Un mensaje entre las estrellas";
    header.append(label, title);
    const body = document.createElement("div");
    body.className = "moon-reader__body";
    body.tabIndex = 0;
    for (const text of [
      "16 de septiembre de 2026 · 2:09 de la madrugada.",
      "Acabo de terminar esta entrada. Debería estar durmiendo, pero me hace ilusión imaginarte descubriendo todo esto. Faltan casi dos meses para tu cumpleaños y quiero prepararte algo muy especial, algo en lo que cada lugar tenga un poquito de ti.",
      "Empezamos por la Luna por aquella serie que viste por mí, que te gustó y de la que después me hiciste un dibujo. Ese detalle se quedó conmigo. Quería devolverte un poquito de aquello y traerte hasta aquí. Esta vez, sin dejar a nadie atrás.",
      "En el segundo camino encontrarás algunas cosas muy especiales que los dos le pedimos al cielo. Quizá, al volver con el tiempo, descubramos que alguna se cumplió. Y si vuelves a escribir allí, yo seguiré pasando a mirarlo, aunque algún día nos distanciemos. No tienes que escribir para mí ni avisarme: ese cielo seguirá siendo tuyo.",
      "El tercero guarda un pedacito de una etapa muy importante de tu vida y un mensaje que no creo que te esperes. No puedo devolverte aquellos días, pero quizá sí acercarte algo de lo que sentías entonces.",
      "Y el cuarto será para lo que permanece: recuerdos que parecían perdidos y pequeños instantes que merecen volver a encontrarte. Hay cosas que el tiempo cambia, pero no les quita lo que significaron.",
      "Estas son mis ideas esta madrugada. Ahora toca darles forma... ojalá mi yo del futuro consiga sacarte una sonrisa con ellas.",
      "PD: Antes de tu cumpleaños hacemos un año hablando, y también tengo una idea para ese día. Me va a romper bastante la cabeza jajaja. Tiene que ver con la foto que te eché cuando nos conocimos, después de que me dijeras: «Si quieres, puedes echarme una foto». Te pillé sonriendo, sin darte cuenta del momento, con esos colmillos que tanto te criticas y que a mí tanto me gustan.",
      "Tengo ganas de que lleguen las Fallas o ese puente para volver a verte. Y de que llegue tu cumpleaños y descubras todo esto. Me importas mucho. 🫶",
      "Puedes acompañar el recorrido con cualquiera de las canciones del selector, salvo en un camino: allí la música es un pedacito de tu historia y no se puede cambiar. Ya entenderás por qué.",
      "César.",
    ]) {
      const p = document.createElement("p");
      p.textContent = text;
      body.append(p);
    }
    const footer = document.createElement("footer");
    const close = document.createElement("button");
    close.type = "button";
    close.textContent = "Cerrar";
    footer.append(close);
    dialog.append(header, body, footer);
    document.body.append(dialog);
    hit.addEventListener("click", () => {
      if (hit.hidden || !canOpen()) return;
      body.scrollTop = 0;
      dialog.showModal();
      close.focus({ preventScroll: true });
    });
    close.addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
    reducedMotion.addEventListener("change", () => {
      if (reducedMotion.matches) dialog.getAnimations().forEach((animation) => animation.cancel());
    });
    function sync() {
      if (hit.hidden) return;
      hit.style.transform = image.style.transform;
      hit.style.width = image.style.width;
      hit.style.height = image.style.height;
    }
    function hide() {
      hit.hidden = true;
      if (dialog.open) dialog.close();
    }
    return { sync, hide, show() { hit.hidden = false; sync(); } };
  };
})();
