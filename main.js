const WHATSAPP_NUMBER = "558331420950";

const PLAN_MESSAGES = {
  "79,90":
    "Olá! Quero assinar o plano FLASH de R$ 79,90 (500 Mega + Chip 5G Flash Móvel incluso). Pode me passar detalhes?",
  "99,90":
    "Olá! Quero assinar o plano FLASH de R$ 99,90 (500 Mega + 25GB no Chip 5G + conteúdo de canais e filmes). Pode me passar detalhes?",
  "149,90":
    "Olá! Quero assinar o plano FLASH de R$ 149,90 (500 Mega + 3 chips + Box TV). Pode me passar detalhes?",
};

const header = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav");
const planButtons = document.querySelectorAll(".whatsapp-plan");
const form = document.getElementById("form-contato");

const buildWhatsAppLink = (message) => {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`;
};

const handleScroll = () => {
  if (!header) return;
  header.classList.toggle("scrolled", window.scrollY > 8);
};

const closeMenu = () => {
  if (!nav || !menuToggle) return;
  nav.classList.remove("active");
  menuToggle.setAttribute("aria-expanded", "false");
};

window.addEventListener("scroll", handleScroll);
handleScroll();

if (menuToggle && nav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("active");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });
}

planButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const planKey = button.dataset.plan;
    const message = PLAN_MESSAGES[planKey] || "Olá! Quero assinar um plano FLASH.";
    window.open(buildWhatsAppLink(message), "_blank");
  });
});

if (form) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = form.nome.value.trim();
    const phone = form.telefone.value.trim();
    const message = form.mensagem.value.trim();
    const finalMessage = `Olá! Meu nome é ${name}. Meu telefone é ${phone}. ${message}`;
    window.open(buildWhatsAppLink(finalMessage), "_blank");
  });
}

