
const WHATSAPP_NUMBER = "558331420950";

const PLAN_MESSAGES = {
  "79,90":  "Olá! Quero assinar o plano FLASH de R$ 79,90 (500 Mega + Chip 5G Flash Móvel incluso). Pode me passar detalhes?",
  "99,90":  "Olá! Quero assinar o plano FLASH de R$ 99,90 (500 Mega + 25GB no Chip 5G + conteúdo de canais e filmes). Pode me passar detalhes?",
  "149,90": "Olá! Quero assinar o plano FLASH de R$ 149,90 (500 Mega + 3 chips + Box TV). Pode me passar detalhes?",
};

const buildWhatsAppLink = (message) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

/* ── Header scroll ─────────────────────────────────────── */
const header = document.querySelector(".site-header");

const handleScroll = () => {
  if (!header) return;
  header.classList.toggle("scrolled", window.scrollY > 10);
};

window.addEventListener("scroll", handleScroll, { passive: true });
handleScroll();

/* ── Mobile menu ───────────────────────────────────────── */
const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav");

const closeMenu = () => {
  nav?.classList.remove("active");
  menuToggle?.setAttribute("aria-expanded", "false");
};

if (menuToggle && nav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("active");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });
  nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
}

/* ── Plan buttons ──────────────────────────────────────── */
document.querySelectorAll(".whatsapp-plan").forEach((btn) => {
  btn.addEventListener("click", () => {
    const msg = PLAN_MESSAGES[btn.dataset.plan] ?? "Olá! Quero assinar um plano FLASH.";
    window.open(buildWhatsAppLink(msg), "_blank");
  });
});

/* ── Contact form ──────────────────────────────────────── */
const form = document.getElementById("form-contato");

if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name    = form.nome.value.trim();
    const phone   = form.telefone.value.trim();
    const message = form.mensagem.value.trim();
    window.open(
      buildWhatsAppLink(`Olá! Meu nome é ${name}. Meu telefone é ${phone}. ${message}`),
      "_blank"
    );
  });
}

/* ── Scroll animations ─────────────────────────────────── */
const animatedEls = document.querySelectorAll("[data-animate], [data-animate-delay]");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  animatedEls.forEach((el) => observer.observe(el));
} else {
  // Fallback for older browsers
  animatedEls.forEach((el) => el.classList.add("visible"));
}

/* ── Phone mask ────────────────────────────────────────── */
const phoneInput = document.getElementById("telefone");

if (phoneInput) {
  phoneInput.addEventListener("input", () => {
    let v = phoneInput.value.replace(/\D/g, "").slice(0, 11);
    if (v.length > 6) v = `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7)}`;
    else if (v.length > 2) v = `(${v.slice(0,2)}) ${v.slice(2)}`;
    else if (v.length > 0) v = `(${v}`;
    phoneInput.value = v;
  });
}

