const revealItems = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    });
  },
  {
    threshold: 0.2,
  }
);

revealItems.forEach((item, index) => {
  item.style.transitionDelay = `${index * 120}ms`;
  revealObserver.observe(item);
});

const welcomeMenu = document.querySelector("#welcome-menu");
const letterButtons = document.querySelectorAll("[data-letter-target]");
const lockedButtons = document.querySelectorAll("[data-locked]");
const backMenuButton = document.querySelector("#btn-back-menu");
const heroOriginal = document.querySelector("#hero-original");
const heroMayo = document.querySelector("#hero-mayo");
const cartaOriginal = document.querySelector("#carta-original");
const cartaMayo = document.querySelector("#carta-mayo");
const mayoVideoStage = document.querySelector("#mayo-video-stage");
const mayoVideo = document.querySelector("#mayo-video");
const playMayoVideoButton = document.querySelector("#btn-play-mayo-video");

if (welcomeMenu) {
  document.body.classList.add("menu-open");

  const hideLockedMessages = () => {
    document.querySelectorAll(".welcome-menu__message.is-visible").forEach((message) => {
      message.classList.remove("is-visible");
    });
  };

  const openMenu = () => {
    hideLockedMessages();
    resetMayoVideo();
    welcomeMenu.classList.remove("is-hidden");
    document.body.classList.add("menu-open");

    if (backMenuButton) {
      backMenuButton.classList.remove("is-visible");
    }
  };

  const unlockMenu = () => {
    hideLockedMessages();
    welcomeMenu.classList.add("is-hidden");
    document.body.classList.remove("menu-open");

    if (backMenuButton) {
      backMenuButton.classList.add("is-visible");
    }
  };

  const showExperience = (target) => {
    if (!heroOriginal || !heroMayo || !cartaOriginal || !cartaMayo) {
      return;
    }

    if (target === "mayo") {
      resetMayoVideo();
      document.body.classList.add("theme-mayo");
      heroOriginal.style.display = "none";
      heroMayo.style.removeProperty("display");
      cartaOriginal.style.display = "none";
      cartaMayo.style.removeProperty("display");
      return;
    }

    resetMayoVideo();
    document.body.classList.remove("theme-mayo");
    heroMayo.style.display = "none";
    heroOriginal.style.removeProperty("display");
    cartaMayo.style.display = "none";
    cartaOriginal.style.removeProperty("display");
  };

  letterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      showExperience(button.dataset.letterTarget);
      unlockMenu();
    });
  });

  lockedButtons.forEach((button) => {
    const messageId = button.getAttribute("aria-describedby");
    const message = messageId ? document.querySelector(`#${messageId}`) : null;

    button.addEventListener("click", () => {
      hideLockedMessages();
      button.classList.remove("is-shaking");
      void button.offsetWidth;
      button.classList.add("is-shaking");

      if (message) {
        message.classList.add("is-visible");
      }
    });

    button.addEventListener("animationend", () => {
      button.classList.remove("is-shaking");
    });
  });

  if (backMenuButton) {
    backMenuButton.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
      openMenu();
    });
  }

  function resetMayoVideo() {
    if (!mayoVideo || !mayoVideoStage) {
      return;
    }

    mayoVideo.pause();
    mayoVideo.currentTime = 0;
    mayoVideoStage.classList.remove("is-playing");
  }

  if (playMayoVideoButton && mayoVideo && mayoVideoStage) {
    playMayoVideoButton.addEventListener("click", async () => {
      mayoVideoStage.classList.add("is-playing");

      try {
        await mayoVideo.play();
      } catch (error) {
        mayoVideoStage.classList.remove("is-playing");
      }
    });
  }
}
