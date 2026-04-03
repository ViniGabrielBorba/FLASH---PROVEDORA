
/* ============================================================
   FLASH — main.js v9
   Melhorias: throttle no scroll, focus trap no menu, validação
   inline no formulário, ano dinâmico no footer, e mais.
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

/* CEPs com cobertura — 5 primeiros dígitos */
const COVERED_PREFIXES = new Set(["58297", "58296", "58295", "58298"]);

const buildWhatsAppLink = (msg) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;

const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

/* ── Throttle com requestAnimationFrame ────────────────── */
const rafThrottle = (fn) => {
  let ticking = false;
  return (...args) => {
    if (!ticking) {
      requestAnimationFrame(() => { fn(...args); ticking = false; });
      ticking = true;
    }
  };
};

/* ══════════════════════════════════════════════════════════
   ANO DINÂMICO NO FOOTER
   ══════════════════════════════════════════════════════════ */
const footerYear = document.getElementById("footer-year");
if (footerYear) footerYear.textContent = new Date().getFullYear();

/* ══════════════════════════════════════════════════════════
   HEADER — scroll behaviour
   ══════════════════════════════════════════════════════════ */
const header = document.querySelector(".site-header");

const updateHeader = () => {
  if (!header) return;
  header.classList.toggle("scrolled", window.scrollY > 10);
};

window.addEventListener("scroll", rafThrottle(updateHeader), { passive: true });
updateHeader();

/* ══════════════════════════════════════════════════════════
   MOBILE MENU + FOCUS TRAP
   ══════════════════════════════════════════════════════════ */
const menuToggle = document.querySelector(".menu-toggle");
const nav        = document.querySelector(".nav");

const FOCUSABLE = 'a[href], button:not([disabled]), input, textarea, [tabindex]:not([tabindex="-1"])';

const closeMenu = () => {
  nav?.classList.remove("active");
  menuToggle?.setAttribute("aria-expanded", "false");
};

const openMenu = () => {
  nav?.classList.add("active");
  menuToggle?.setAttribute("aria-expanded", "true");
  /* Foca primeiro link ao abrir */
  requestAnimationFrame(() => nav?.querySelector(FOCUSABLE)?.focus());
};

if (menuToggle && nav) {
  menuToggle.addEventListener("click", () => {
    nav.classList.contains("active") ? closeMenu() : openMenu();
  });

  nav.querySelectorAll(".nav-link").forEach((l) => l.addEventListener("click", closeMenu));
  document.addEventListener("click", (e) => { if (!header?.contains(e.target)) closeMenu(); });

  /* Fecha com Escape, faz focus trap com Tab */
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { closeMenu(); menuToggle.focus(); return; }

    if (e.key === "Tab" && nav.classList.contains("active") && window.innerWidth < 768) {
      const focusable = [...nav.querySelectorAll(FOCUSABLE)];
      const first = focusable[0];
      const last  = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    }
  });
}

/* ══════════════════════════════════════════════════════════
   SMOOTH SCROLL
   ══════════════════════════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (e) => {
    const id     = anchor.getAttribute("href").slice(1);
    if (!id) return;
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    const headerH = header?.offsetHeight ?? 76;
    const targetY = target.getBoundingClientRect().top + window.scrollY - headerH;
    window.scrollTo({ top: targetY, behavior: "smooth" });
    /* Foca no destino para leitores de tela */
    target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
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
   CONTACT FORM — validação inline
   ══════════════════════════════════════════════════════════ */
const form      = document.getElementById("form-contato");
const submitBtn = document.getElementById("submit-btn");

const setFieldError = (input, errorId, message) => {
  const err = document.getElementById(errorId);
  if (!err) return;
  if (message) {
    err.textContent = message;
    err.hidden = false;
    input.setAttribute("aria-invalid", "true");
  } else {
    err.textContent = "";
    err.hidden = true;
    input.removeAttribute("aria-invalid");
  }
};

const clearFormErrors = () => {
  [
    [form?.nome,      "nome-error"],
    [form?.telefone,  "tel-error"],
    [form?.mensagem,  "msg-error"],
  ].forEach(([el, id]) => el && setFieldError(el, id, ""));
};

if (form && submitBtn) {
  /* Limpa erro ao digitar */
  form.addEventListener("input", (e) => {
    const map = { nome: "nome-error", telefone: "tel-error", mensagem: "msg-error" };
    const id  = map[e.target.name];
    if (id) setFieldError(e.target, id, "");
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    clearFormErrors();

    const name    = form.nome.value.trim();
    const phone   = form.telefone.value.trim();
    const message = form.mensagem.value.trim();

    let valid = true;
    if (!name)    { setFieldError(form.nome,     "nome-error", "Por favor, informe seu nome."); valid = false; }
    if (!phone)   { setFieldError(form.telefone, "tel-error",  "Por favor, informe seu telefone."); valid = false; }
    if (!message) { setFieldError(form.mensagem, "msg-error",  "Por favor, escreva sua mensagem."); valid = false; }
    if (!valid) { form.querySelector("[aria-invalid]")?.focus(); return; }

    submitBtn.setAttribute("data-loading", "true");
    const spanEl   = submitBtn.querySelector("span");
    const original = spanEl?.textContent ?? "";
    if (spanEl) spanEl.textContent = "Abrindo WhatsApp...";

    setTimeout(() => {
      window.open(
        buildWhatsAppLink(`Olá! Meu nome é ${name}.\nTelefone: ${phone}.\n\n${message}`),
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
    /* Remove erro ao digitar */
    cepInput.removeAttribute("aria-invalid");
    const err = document.getElementById("cep-error");
    if (err) err.hidden = true;
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

const setCepError = (msg) => {
  if (!cepInput) return;
  cepInput.setAttribute("aria-invalid", "true");
  const err = document.getElementById("cep-error");
  if (err) { err.textContent = msg; err.hidden = false; }
};

if (coverageForm) {
  coverageForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const raw = cepInput.value.replace(/\D/g, "");
    if (raw.length !== 8) {
      setCepError("Por favor, informe um CEP válido com 8 dígitos.");
      cepInput.focus();
      return;
    }

    showCoverageLoading();

    const btnSpan = coverageBtn.querySelector("span");
    if (btnSpan) btnSpan.textContent = "Verificando...";
    coverageBtn.disabled = true;

    try {
      const res  = await fetch(`https://viacep.com.br/ws/${raw}/json/`);
      if (!res.ok) throw new Error("HTTP error");
      const data = await res.json();

      if (btnSpan) btnSpan.textContent = "Verificar cobertura";
      coverageBtn.disabled = false;

      if (data.erro) {
        showCoverageResult("error", "❌", "CEP não encontrado. Verifique e tente novamente.");
        coverageAddress.hidden = true;
        return;
      }

      const city     = data.localidade ?? "";
      const state    = data.uf ?? "";
      const street   = data.logradouro ? `${data.logradouro}, ` : "";
      const district = data.bairro ? `${data.bairro} — ` : "";
      coverageAddress.innerHTML = `<strong>📍 Endereço encontrado</strong>${street}${district}${city} - ${state}`;
      coverageAddress.hidden = false;

      const prefix  = raw.slice(0, 5);
      const covered = COVERED_PREFIXES.has(prefix) || city.toLowerCase().includes("rio tinto");

      if (covered) {
        showCoverageResult(
          "success", "✅",
          `Boa notícia! A FLASH <strong>atende sua região</strong> em ${city} - ${state}.`,
          `<a class="coverage-result-action" href="${buildWhatsAppLink(`Olá! Verificando cobertura no CEP ${cepInput.value} em ${city} - ${state}. Quero assinar um plano!`)}" target="_blank" rel="noopener noreferrer">Assinar pelo WhatsApp →</a>`
        );
      } else {
        showCoverageResult(
          "error", "📡",
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
   SPEED BARS
   ══════════════════════════════════════════════════════════ */
const speedBars = document.querySelectorAll(".speed-bar[data-pct]");

if ("IntersectionObserver" in window && speedBars.length) {
  const sbIO = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) {
        const pct = e.target.dataset.pct;
        setTimeout(() => {
          e.target.style.width = `${pct}%`;
          e.target.setAttribute("aria-valuenow", pct);
        }, 200);
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
    const val = Math.floor(easeOutExpo(t) * target);
    el.textContent = val.toLocaleString("pt-BR");
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
   RIPPLE EFFECT (só em dispositivos que suportam hover)
   ══════════════════════════════════════════════════════════ */
if (window.matchMedia("(hover: hover)").matches) {
  /* Injeta keyframe uma única vez */
  const sheet = document.createElement("style");
  sheet.textContent = `@keyframes ripple { to { transform: scale(1); opacity: 0; } }`;
  document.head.appendChild(sheet);

  document.querySelectorAll(".btn-primary").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      const rect   = this.getBoundingClientRect();
      const size   = Math.max(rect.width, rect.height) * 2;
      const ripple = document.createElement("span");
      Object.assign(ripple.style, {
        position:     "absolute",
        width:        `${size}px`,
        height:       `${size}px`,
        left:         `${e.clientX - rect.left - size / 2}px`,
        top:          `${e.clientY - rect.top  - size / 2}px`,
        background:   "rgba(255,255,255,0.18)",
        borderRadius: "50%",
        transform:    "scale(0)",
        animation:    "ripple 0.55s linear",
        pointerEvents:"none",
      });
      this.appendChild(ripple);
      ripple.addEventListener("animationend", () => ripple.remove());
    });
  });
}

/* ══════════════════════════════════════════════════════════
   ACTIVE NAV LINK — throttled
   ══════════════════════════════════════════════════════════ */
const sections = document.querySelectorAll("section[id]");

const updateActiveNav = () => {
  const scrollY = window.scrollY + (header?.offsetHeight ?? 76) + 40;
  let current   = "";
  sections.forEach((s) => { if (s.offsetTop <= scrollY) current = s.id; });
  document.querySelectorAll(".nav-link").forEach((l) => {
    l.classList.toggle("active", l.getAttribute("href") === `#${current}`);
  });
};

window.addEventListener("scroll", rafThrottle(updateActiveNav), { passive: true });
updateActiveNav();

