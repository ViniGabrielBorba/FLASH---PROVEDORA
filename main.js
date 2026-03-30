
/* ============================================================
   FLASH — main.js v6
   ============================================================ */

"use strict";

/* ── Constants ─────────────────────────────────────────── */
const WHATSAPP_NUMBER = "558331420950";

const PLAN_MESSAGES = {
  /* Planos sem chip */
  "59,90":  "Olá! Quero assinar o plano FLASH de R$ 59,90 (50 Mega de internet). Pode me passar mais detalhes?",
  "74,90":  "Olá! Quero assinar o plano FLASH de R$ 74,90 (300 Mega de internet). Pode me passar mais detalhes?",
  "89,90":  "Olá! Quero assinar o plano FLASH de R$ 89,90 (600 Mega de internet). Pode me passar mais detalhes?",
  "109,90": "Olá! Quero assinar o plano FLASH de R$ 109,90 (1 Giga de internet). Pode me passar mais detalhes?",
  /* Planos com chip */
  "79,90":  "Olá! Quero assinar o plano FLASH de R$ 79,90 (500 Mega + Chip Flash Móvel com 1GB incluso). Pode me passar mais detalhes?",
  "99,90":  "Olá! Quero assinar o plano FLASH de R$ 99,90 (500 Mega + Chip Flash Móvel com 25GB + conteúdo de canais e filmes). Pode me passar mais detalhes?",
  "149,90": "Olá! Quero assinar o plano FLASH de R$ 149,90 (800 Mega + 3 Chips Flash Móvel com 50GB cada). Pode me passar mais detalhes?",
};

const buildWhatsAppLink = (message) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

/* ── Utility: easing ───────────────────────────────────── */
const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

/* ══════════════════════════════════════════════════════════
   HEADER — scroll behaviour
   ══════════════════════════════════════════════════════════ */
const header = document.querySelector(".site-header");

const updateHeader = () => {
  if (!header) return;
  header.classList.toggle("scrolled", window.scrollY > 10);
};

window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

/* ══════════════════════════════════════════════════════════
   MOBILE MENU — hamburger ↔ X
   ══════════════════════════════════════════════════════════ */
const menuToggle  = document.querySelector(".menu-toggle");
const nav         = document.querySelector(".nav");

const closeMenu = () => {
  if (!nav || !menuToggle) return;
  nav.classList.remove("active");
  menuToggle.setAttribute("aria-expanded", "false");
};

const openMenu = () => {
  if (!nav || !menuToggle) return;
  nav.classList.add("active");
  menuToggle.setAttribute("aria-expanded", "true");
};

if (menuToggle && nav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = nav.classList.contains("active");
    isOpen ? closeMenu() : openMenu();
  });

  // Close on nav link click
  nav.querySelectorAll(".nav-link").forEach((link) =>
    link.addEventListener("click", closeMenu)
  );

  // Close when clicking outside
  document.addEventListener("click", (e) => {
    if (!header?.contains(e.target)) closeMenu();
  });

  // Close on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });
}

/* ══════════════════════════════════════════════════════════
   SMOOTH SCROLL — offset for fixed header
   ══════════════════════════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (e) => {
    const id     = anchor.getAttribute("href").slice(1);
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();

    const headerH  = header?.offsetHeight ?? 76;
    const targetY  = target.getBoundingClientRect().top + window.scrollY - headerH;
    window.scrollTo({ top: targetY, behavior: "smooth" });
  });
});

/* ══════════════════════════════════════════════════════════
   PLAN BUTTONS — open WhatsApp
   ══════════════════════════════════════════════════════════ */
document.querySelectorAll(".whatsapp-plan").forEach((btn) => {
  btn.addEventListener("click", () => {
    const msg = PLAN_MESSAGES[btn.dataset.plan] ?? "Olá! Quero assinar um plano FLASH.";
    window.open(buildWhatsAppLink(msg), "_blank", "noopener,noreferrer");
  });
});

/* ══════════════════════════════════════════════════════════
   CONTACT FORM — submit → WhatsApp
   ══════════════════════════════════════════════════════════ */
const form       = document.getElementById("form-contato");
const submitBtn  = document.getElementById("submit-btn");

if (form && submitBtn) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name    = form.nome.value.trim();
    const phone   = form.telefone.value.trim();
    const message = form.mensagem.value.trim();

    if (!name || !phone || !message) return;

    // Visual feedback
    submitBtn.setAttribute("data-loading", "true");
    const spanEl = submitBtn.querySelector("span");
    const original = spanEl?.textContent ?? "Enviar pelo WhatsApp";
    if (spanEl) spanEl.textContent = "Abrindo WhatsApp";

    setTimeout(() => {
      window.open(
        buildWhatsAppLink(`Olá! Meu nome é ${name}. Meu telefone: ${phone}.\n\n${message}`),
        "_blank",
        "noopener,noreferrer"
      );
      submitBtn.removeAttribute("data-loading");
      if (spanEl) spanEl.textContent = original;
    }, 400);
  });
}

/* ══════════════════════════════════════════════════════════
   SCROLL ANIMATIONS — IntersectionObserver
   ══════════════════════════════════════════════════════════ */
const animatedEls = document.querySelectorAll("[data-animate], [data-animate-delay]");

if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
  );
  animatedEls.forEach((el) => io.observe(el));
} else {
  animatedEls.forEach((el) => el.classList.add("visible"));
}

/* ══════════════════════════════════════════════════════════
   COUNTER ANIMATION — stats section
   ══════════════════════════════════════════════════════════ */
const counters   = document.querySelectorAll(".stat-number[data-count]");
const DURATION   = 1800; // ms

const animateCount = (el) => {
  const target = parseInt(el.dataset.count, 10);
  const start  = performance.now();

  const step = (now) => {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / DURATION, 1);
    el.textContent = Math.floor(easeOutExpo(progress) * target).toLocaleString("pt-BR");
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target.toLocaleString("pt-BR");
  };

  requestAnimationFrame(step);
};

if ("IntersectionObserver" in window && counters.length) {
  const counterIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          counterIO.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );
  counters.forEach((c) => counterIO.observe(c));
}

/* ══════════════════════════════════════════════════════════
   PHONE MASK
   ══════════════════════════════════════════════════════════ */
const phoneInput = document.getElementById("telefone");

if (phoneInput) {
  phoneInput.addEventListener("input", () => {
    let v = phoneInput.value.replace(/\D/g, "").slice(0, 11);
    if      (v.length > 6) v = `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7)}`;
    else if (v.length > 2) v = `(${v.slice(0,2)}) ${v.slice(2)}`;
    else if (v.length > 0) v = `(${v}`;
    phoneInput.value = v;
  });
}

/* ══════════════════════════════════════════════════════════
   RIPPLE EFFECT — primary buttons
   ══════════════════════════════════════════════════════════ */
document.querySelectorAll(".btn-primary").forEach((btn) => {
  btn.addEventListener("click", function (e) {
    const rect   = this.getBoundingClientRect();
    const size   = Math.max(rect.width, rect.height) * 2;
    const x      = e.clientX - rect.left - size / 2;
    const y      = e.clientY - rect.top  - size / 2;
    const ripple = document.createElement("span");

    Object.assign(ripple.style, {
      position: "absolute",
      width:    `${size}px`,
      height:   `${size}px`,
      left:     `${x}px`,
      top:      `${y}px`,
      background: "rgba(255,255,255,0.18)",
      borderRadius: "50%",
      transform: "scale(0)",
      animation: "ripple 0.55s linear",
      pointerEvents: "none",
    });

    this.appendChild(ripple);
    ripple.addEventListener("animationend", () => ripple.remove());
  });
});

// Inject ripple keyframe once
const sheet = document.createElement("style");
sheet.textContent = `
  @keyframes ripple {
    to { transform: scale(1); opacity: 0; }
  }
`;
document.head.appendChild(sheet);

/* ══════════════════════════════════════════════════════════
   ACTIVE NAV LINK — highlight on scroll
   ══════════════════════════════════════════════════════════ */
const sections = document.querySelectorAll("section[id]");

const updateActiveNav = () => {
  const scrollY = window.scrollY + (header?.offsetHeight ?? 76) + 40;
  let current  = "";

  sections.forEach((sec) => {
    if (sec.offsetTop <= scrollY) current = sec.id;
  });

  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === `#${current}`);
  });
};

window.addEventListener("scroll", updateActiveNav, { passive: true });
updateActiveNav();

