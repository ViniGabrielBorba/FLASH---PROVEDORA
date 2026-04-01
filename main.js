
/* ============================================================
   FLASH — main.js v7
   ============================================================ */

"use strict";

/* ── Constants ─────────────────────────────────────────── */
const WHATSAPP_NUMBER = "558331420950";

const PLAN_MESSAGES = {
  "59,90":  "Olá! Quero assinar o plano FLASH de R$ 59,90 (50 Mega de internet). Pode me passar mais detalhes?",
  "74,90":  "Olá! Quero assinar o plano FLASH de R$ 74,90 (300 Mega de internet). Pode me passar mais detalhes?",
  "89,90":  "Olá! Quero assinar o plano FLASH de R$ 89,90 (600 Mega de internet). Pode me passar mais detalhes?",
  "109,90": "Olá! Quero assinar o plano FLASH de R$ 109,90 (1 Giga de internet). Pode me passar mais detalhes?",
  "79,90":  "Olá! Quero assinar o plano FLASH de R$ 79,90 (500 Mega + Chip Flash Móvel com 1GB incluso). Pode me passar mais detalhes?",
  "99,90":  "Olá! Quero assinar o plano FLASH de R$ 99,90 (500 Mega + Chip Flash Móvel com 25GB + canais e filmes). Pode me passar mais detalhes?",
  "149,90": "Olá! Quero assinar o plano FLASH de R$ 149,90 (800 Mega + 3 Chips Flash Móvel com 50GB cada). Pode me passar mais detalhes?",
};

/* CEPs/bairros com cobertura (exemplo - substitua pelos CEPs reais) */
const COVERED_PREFIXES = ["58297", "58296", "58295", "58298"];

const buildWhatsAppLink = (msg) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;

const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

/* ══════════════════════════════════════════════════════════
   OFFER BAR
   ══════════════════════════════════════════════════════════ */
const offerBar   = document.getElementById("offer-bar");
const offerClose = document.getElementById("offer-bar-close");
const OFFER_KEY  = "flash_offer_closed";

const initOfferBar = () => {
  if (!offerBar || sessionStorage.getItem(OFFER_KEY)) return;

  document.body.classList.add("offer-bar-visible");
  offerBar.style.height = "44px";

  requestAnimationFrame(() => {
    offerBar.classList.add("visible");
  });

  offerClose?.addEventListener("click", () => {
    offerBar.style.height = "0";
    offerBar.classList.remove("visible");
    document.body.classList.remove("offer-bar-visible");
    sessionStorage.setItem(OFFER_KEY, "1");
  });
};

initOfferBar();

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
   MOBILE MENU
   ══════════════════════════════════════════════════════════ */
const menuToggle = document.querySelector(".menu-toggle");
const nav        = document.querySelector(".nav");

const closeMenu = () => {
  nav?.classList.remove("active");
  menuToggle?.setAttribute("aria-expanded", "false");
};

if (menuToggle && nav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = nav.classList.contains("active");
    if (isOpen) { closeMenu(); } else {
      nav.classList.add("active");
      menuToggle.setAttribute("aria-expanded", "true");
    }
  });
  nav.querySelectorAll(".nav-link").forEach((l) => l.addEventListener("click", closeMenu));
  document.addEventListener("click", (e) => { if (!header?.contains(e.target)) closeMenu(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenu(); });
}

/* ══════════════════════════════════════════════════════════
   SMOOTH SCROLL
   ══════════════════════════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (e) => {
    const id     = anchor.getAttribute("href").slice(1);
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    const offerH  = document.body.classList.contains("offer-bar-visible") ? 44 : 0;
    const headerH = (header?.offsetHeight ?? 76) + offerH;
    const targetY = target.getBoundingClientRect().top + window.scrollY - headerH;
    window.scrollTo({ top: targetY, behavior: "smooth" });
  });
});

/* ══════════════════════════════════════════════════════════
   PLAN BUTTONS
   ══════════════════════════════════════════════════════════ */
document.querySelectorAll(".whatsapp-plan").forEach((btn) => {
  btn.addEventListener("click", () => {
    const msg = PLAN_MESSAGES[btn.dataset.plan] ?? "Olá! Quero assinar um plano FLASH.";
    window.open(buildWhatsAppLink(msg), "_blank", "noopener,noreferrer");
  });
});

/* ══════════════════════════════════════════════════════════
   CONTACT FORM
   ══════════════════════════════════════════════════════════ */
const form      = document.getElementById("form-contato");
const submitBtn = document.getElementById("submit-btn");

if (form && submitBtn) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name    = form.nome.value.trim();
    const phone   = form.telefone.value.trim();
    const message = form.mensagem.value.trim();
    if (!name || !phone || !message) return;

    submitBtn.setAttribute("data-loading", "true");
    const spanEl   = submitBtn.querySelector("span");
    const original = spanEl?.textContent ?? "";
    if (spanEl) spanEl.textContent = "Abrindo WhatsApp...";

    setTimeout(() => {
      window.open(
        buildWhatsAppLink(`Olá! Meu nome é ${name}. Telefone: ${phone}.\n\n${message}`),
        "_blank", "noopener,noreferrer"
      );
      submitBtn.removeAttribute("data-loading");
      if (spanEl) spanEl.textContent = original;
    }, 400);
  });
}

/* ══════════════════════════════════════════════════════════
   CEP COVERAGE CHECKER
   ══════════════════════════════════════════════════════════ */
const coverageForm    = document.getElementById("coverage-form");
const coverageResult  = document.getElementById("coverage-result");
const coverageAddress = document.getElementById("coverage-address");
const cepInput        = document.getElementById("cep-input");
const coverageBtn     = document.getElementById("coverage-btn");

/* CEP mask */
if (cepInput) {
  cepInput.addEventListener("input", () => {
    let v = cepInput.value.replace(/\D/g, "").slice(0, 8);
    if (v.length > 5) v = `${v.slice(0, 5)}-${v.slice(5)}`;
    cepInput.value = v;
  });
}

const showCoverageResult = (type, icon, text, extra = "") => {
  coverageResult.className = `coverage-result ${type}`;
  coverageResult.innerHTML = `
    <span class="result-icon" aria-hidden="true">${icon}</span>
    <div>
      <span>${text}</span>
      ${extra}
    </div>
  `;
  coverageResult.hidden = false;
};

const showCoverageLoading = () => {
  coverageResult.className = "coverage-result loading";
  coverageResult.innerHTML = `
    <div class="spinner" aria-hidden="true"></div>
    <span>Consultando cobertura…</span>
  `;
  coverageResult.hidden = false;
  coverageAddress.hidden = true;
};

if (coverageForm) {
  coverageForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const raw = cepInput.value.replace(/\D/g, "");
    if (raw.length !== 8) {
      showCoverageResult("error", "⚠️", "Por favor, informe um CEP válido com 8 dígitos.");
      return;
    }

    showCoverageLoading();

    const btnSpan = coverageBtn.querySelector("span");
    if (btnSpan) btnSpan.textContent = "Verificando...";
    coverageBtn.disabled = true;

    try {
      const res  = await fetch(`https://viacep.com.br/ws/${raw}/json/`);
      const data = await res.json();

      if (btnSpan) btnSpan.textContent = "Verificar cobertura";
      coverageBtn.disabled = false;

      if (data.erro) {
        showCoverageResult("error", "❌", "CEP não encontrado. Verifique e tente novamente.");
        coverageAddress.hidden = true;
        return;
      }

      /* Show address preview */
      const city    = data.localidade ?? "";
      const state   = data.uf ?? "";
      const street  = data.logradouro ? `${data.logradouro}, ` : "";
      const district = data.bairro ? `${data.bairro} — ` : "";
      coverageAddress.innerHTML = `<strong>📍 Endereço encontrado</strong>${street}${district}${city} - ${state}`;
      coverageAddress.hidden = false;

      /* Check coverage */
      const prefix  = raw.slice(0, 5);
      const covered = COVERED_PREFIXES.includes(prefix) || city.toLowerCase().includes("rio tinto");

      if (covered) {
        showCoverageResult(
          "success",
          "✅",
          `Boa notícia! A FLASH <strong>atende sua região</strong> em ${city} - ${state}.`,
          `<a class="coverage-result-action" href="${buildWhatsAppLink(`Olá! Verificando cobertura no CEP ${cepInput.value} em ${city} - ${state}. Quero assinar um plano!`)}" target="_blank" rel="noopener noreferrer">Assinar pelo WhatsApp →</a>`
        );
      } else {
        showCoverageResult(
          "error",
          "📡",
          `Ainda não atendemos <strong>${city} - ${state}</strong> com esse CEP.`,
          `<a class="coverage-result-action" href="${buildWhatsAppLink(`Olá! Moro em ${city} - ${state} (CEP: ${cepInput.value}). Vocês têm previsão de cobertura na minha área?`)}" target="_blank" rel="noopener noreferrer">Avisar quando chegar →</a>`
        );
      }
    } catch {
      if (btnSpan) btnSpan.textContent = "Verificar cobertura";
      coverageBtn.disabled = false;
      showCoverageResult("error", "⚠️", "Erro ao consultar o CEP. Verifique sua conexão e tente novamente.");
    }
  });
}

/* ══════════════════════════════════════════════════════════
   EXIT INTENT POPUP
   ══════════════════════════════════════════════════════════ */
const popup        = document.getElementById("exit-popup");
const popupClose   = document.getElementById("popup-close");
const popupDismiss = document.getElementById("popup-dismiss");
const popupCopy    = document.getElementById("popup-copy");
const POPUP_KEY    = "flash_popup_shown";
let   popupShown   = false;

const showPopup = () => {
  if (popupShown || sessionStorage.getItem(POPUP_KEY)) return;
  popupShown = true;
  sessionStorage.setItem(POPUP_KEY, "1");
  popup.hidden = false;
  document.body.style.overflow = "hidden";
};

const hidePopup = () => {
  popup.hidden = true;
  document.body.style.overflow = "";
};

/* Desktop: mouse leaving viewport (exit intent) */
document.addEventListener("mouseleave", (e) => {
  if (e.clientY <= 0) showPopup();
});

/* Mobile: scroll up quickly after 60% page scroll */
let lastScrollY = 0;
let didScrollDeep = false;

window.addEventListener("scroll", () => {
  const pct = (window.scrollY + window.innerHeight) / document.body.scrollHeight;
  if (pct > 0.6) didScrollDeep = true;

  if (didScrollDeep && window.scrollY < lastScrollY - 120) showPopup();
  lastScrollY = window.scrollY;
}, { passive: true });

/* Fallback: show after 45s on page */
setTimeout(showPopup, 45_000);

popupClose?.addEventListener("click",   hidePopup);
popupDismiss?.addEventListener("click", hidePopup);

popup?.addEventListener("click", (e) => {
  if (e.target === popup) hidePopup();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !popup?.hidden) hidePopup();
});

/* Copy promo code */
if (popupCopy) {
  popupCopy.addEventListener("click", () => {
    const code = document.getElementById("popup-code")?.textContent ?? "FLASH50";
    navigator.clipboard?.writeText(code).catch(() => {});
    popupCopy.classList.add("copied");
    popupCopy.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
    setTimeout(() => {
      popupCopy.classList.remove("copied");
      popupCopy.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
    }, 2000);
  });
}

/* ══════════════════════════════════════════════════════════
   SCROLL ANIMATIONS
   ══════════════════════════════════════════════════════════ */
const animatedEls = document.querySelectorAll("[data-animate], [data-animate-delay]");

if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); }
    }),
    { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
  );
  animatedEls.forEach((el) => io.observe(el));
} else {
  animatedEls.forEach((el) => el.classList.add("visible"));
}

/* ══════════════════════════════════════════════════════════
   SPEED BARS — animate on scroll
   ══════════════════════════════════════════════════════════ */
const speedBars = document.querySelectorAll(".speed-bar[data-pct]");

if ("IntersectionObserver" in window && speedBars.length) {
  const sbIO = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) {
        const pct = e.target.dataset.pct;
        setTimeout(() => { e.target.style.width = `${pct}%`; }, 200);
        sbIO.unobserve(e.target);
      }
    }),
    { threshold: 0.3 }
  );
  speedBars.forEach((b) => sbIO.observe(b));
}

/* ══════════════════════════════════════════════════════════
   COUNTER ANIMATION
   ══════════════════════════════════════════════════════════ */
const counters = document.querySelectorAll(".stat-number[data-count]");
const DURATION = 1800;

const animateCount = (el) => {
  const target = parseInt(el.dataset.count, 10);
  const start  = performance.now();
  const step   = (now) => {
    const t = Math.min((now - start) / DURATION, 1);
    el.textContent = Math.floor(easeOutExpo(t) * target).toLocaleString("pt-BR");
    if (t < 1) requestAnimationFrame(step);
    else el.textContent = target.toLocaleString("pt-BR");
  };
  requestAnimationFrame(step);
};

if ("IntersectionObserver" in window && counters.length) {
  const cIO = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) { animateCount(e.target); cIO.unobserve(e.target); }
    }),
    { threshold: 0.5 }
  );
  counters.forEach((c) => cIO.observe(c));
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
   RIPPLE EFFECT
   ══════════════════════════════════════════════════════════ */
document.querySelectorAll(".btn-primary").forEach((btn) => {
  btn.addEventListener("click", function (e) {
    const rect   = this.getBoundingClientRect();
    const size   = Math.max(rect.width, rect.height) * 2;
    const ripple = document.createElement("span");
    Object.assign(ripple.style, {
      position: "absolute",
      width: `${size}px`, height: `${size}px`,
      left: `${e.clientX - rect.left - size / 2}px`,
      top:  `${e.clientY - rect.top  - size / 2}px`,
      background: "rgba(255,255,255,0.18)", borderRadius: "50%",
      transform: "scale(0)", animation: "ripple 0.55s linear",
      pointerEvents: "none",
    });
    this.appendChild(ripple);
    ripple.addEventListener("animationend", () => ripple.remove());
  });
});

const sheet = document.createElement("style");
sheet.textContent = `@keyframes ripple { to { transform: scale(1); opacity: 0; } }`;
document.head.appendChild(sheet);

/* ══════════════════════════════════════════════════════════
   ACTIVE NAV LINK
   ══════════════════════════════════════════════════════════ */
const sections = document.querySelectorAll("section[id]");

const updateActiveNav = () => {
  const offerH  = document.body.classList.contains("offer-bar-visible") ? 44 : 0;
  const scrollY = window.scrollY + (header?.offsetHeight ?? 76) + offerH + 40;
  let current   = "";
  sections.forEach((s) => { if (s.offsetTop <= scrollY) current = s.id; });
  document.querySelectorAll(".nav-link").forEach((l) => {
    l.classList.toggle("active", l.getAttribute("href") === `#${current}`);
  });
};

window.addEventListener("scroll", updateActiveNav, { passive: true });
updateActiveNav();
