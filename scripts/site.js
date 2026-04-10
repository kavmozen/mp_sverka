import { siteConfig } from "./config.js";

const yearEls = document.querySelectorAll("#currentYear");
yearEls.forEach((el) => {
  el.textContent = String(new Date().getFullYear());
});

const navToggle = document.querySelector(".nav-toggle");
const mobileMenu = document.getElementById("mobileMenu");

if (navToggle && mobileMenu) {
  navToggle.addEventListener("click", () => {
    const expanded = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!expanded));
    mobileMenu.classList.toggle("open", !expanded);
  });

  mobileMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navToggle.setAttribute("aria-expanded", "false");
      mobileMenu.classList.remove("open");
    });
  });
}

const telegramLinks = document.querySelectorAll(".contact-telegram");
telegramLinks.forEach((link) => {
  link.href = siteConfig.telegramUrl;
  link.target = "_blank";
  link.rel = "noreferrer noopener";
});

const emailLinks = document.querySelectorAll(".contact-email");
emailLinks.forEach((link) => {
  link.href = `mailto:${siteConfig.email}`;
  link.textContent = siteConfig.email;
});
