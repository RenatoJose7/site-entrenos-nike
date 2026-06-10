const WHATSAPP_NUMBER = "5511999999999"; // Troque pelo número real. Exemplo: 5511988887777
const CART_STORAGE_KEY = "entrenos-cart";
const FAVORITES_STORAGE_KEY = "entrenos-favorites";

const products = [
  {
    id: "logo-classica",
    name: "Logo Clássica",
    price: 49.9,
    image: "assets/camiseta-classica.svg",
    gallery: ["assets/camiseta-classica.svg", "assets/modelo-camiseta.png", "assets/logo-principal.png"],
    description: "A camiseta preta essencial da ENTRENÓS: presença limpa, logo forte e cara de drop principal.",
    short: "Camiseta preta · Estampa frontal",
    sizes: ["P", "M", "G", "GG"],
    related: ["entre-nos", "en-minimal"],
  },
  {
    id: "entre-nos",
    name: "Entre Nós",
    price: 49.9,
    image: "assets/camiseta-resenha.svg",
    gallery: ["assets/camiseta-resenha.svg", "assets/modelo-camiseta.png", "assets/logo-mascotes.png"],
    description: "Mascotes, amizade e resenha em uma peça feita para sair do básico sem perder o conforto.",
    short: "Mascotes · Amizade · Resenha",
    sizes: ["P", "M", "G", "GG"],
    related: ["logo-classica", "so-mais-uma"],
  },
  {
    id: "so-mais-uma",
    name: "Só Mais Uma",
    price: 44.9,
    image: "assets/camiseta-frases.svg",
    gallery: ["assets/camiseta-frases.svg", "assets/modelo-camiseta.png", "assets/logo-icon.png"],
    description: "Frase descontraída com energia de rolê: simples, direta e fácil de usar todo dia.",
    short: "Frase descontraída · Drop resenha",
    sizes: ["P", "M", "G", "GG"],
    related: ["entre-nos", "en-minimal"],
  },
  {
    id: "en-minimal",
    name: "EN Minimal",
    price: 39.9,
    image: "assets/camiseta-minimal.svg",
    gallery: ["assets/camiseta-minimal.svg", "assets/modelo-camiseta.png", "assets/logo-icon.png"],
    description: "Monograma discreto, visual premium e fácil de combinar com qualquer peça do guarda-roupa.",
    short: "Ícone circular · Visual discreto",
    sizes: ["P", "M", "G", "GG"],
    related: ["logo-classica", "so-mais-uma"],
  },
];

const productGrid = document.querySelector("#productGrid");
const cartDrawer = document.querySelector("#cartDrawer");
const favoritesDrawer = document.querySelector("#favoritesDrawer");
const cartItems = document.querySelector("#cartItems");
const favoritesItems = document.querySelector("#favoritesItems");
const cartEmpty = document.querySelector("#cartEmpty");
const favoritesEmpty = document.querySelector("#favoritesEmpty");
const cartTotal = document.querySelector("#cartTotal");
const checkoutButton = document.querySelector("#checkoutButton");
const productDetail = document.querySelector("#productDetail");
const detailContent = document.querySelector("#detailContent");
const screenOverlay = document.querySelector(".screen-overlay");
const menuToggle = document.querySelector(".menu-toggle");

let cart = readStorage(CART_STORAGE_KEY, []);
let favorites = readStorage(FAVORITES_STORAGE_KEY, []);
let activeProductId = null;

function readStorage(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
}

function saveCart() {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

function saveFavorites() {
  localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
}

function formatMoney(value) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function getProduct(productId) {
  return products.find((product) => product.id === productId);
}

function getCartCount() {
  return cart.reduce((total, item) => total + item.quantity, 0);
}

function getCartTotal() {
  return cart.reduce((total, item) => {
    const product = getProduct(item.productId);
    return product ? total + product.price * item.quantity : total;
  }, 0);
}

function isFavorite(productId) {
  return favorites.includes(productId);
}

function renderProducts() {
  if (!productGrid) return;

  productGrid.innerHTML = products.map((product, index) => {
    const favoriteClass = isFavorite(product.id) ? " is-favorite" : "";
    const delayClass = index ? ` delay-${Math.min(index, 3)}` : "";

    return `
      <article class="product-card reveal is-visible${delayClass}" data-product-id="${product.id}">
        <figure>
          <button class="product-media" type="button" data-detail="${product.id}" aria-label="Ver detalhes de ${product.name}">
            <img src="${product.image}" alt="Camiseta ${product.name} ENTRENÓS" />
          </button>
          <button class="favorite-button${favoriteClass}" type="button" data-favorite="${product.id}" aria-label="Favoritar ${product.name}">♥</button>
        </figure>
        <div class="product-info">
          <div>
            <h3>${product.name}</h3>
            <p>${product.short}</p>
          </div>
          <strong>${formatMoney(product.price)}</strong>
        </div>
        <div class="product-card-controls">
          <label>
            <span>Tamanho</span>
            <select class="size-select" data-card-size="${product.id}">
              ${product.sizes.map((size) => `<option value="${size}">${size}</option>`).join("")}
            </select>
          </label>
          <button class="detail-link" type="button" data-detail="${product.id}">Detalhes</button>
        </div>
        <button class="buy-button" type="button" data-add-cart="${product.id}">Adicionar ao carrinho</button>
      </article>
    `;
  }).join("");
}

function renderFavorites() {
  document.querySelectorAll(".favorite-count").forEach((element) => {
    element.textContent = String(favorites.length);
  });

  if (!favoritesItems || !favoritesEmpty) return;

  const favoriteProducts = favorites.map(getProduct).filter(Boolean);

  favoritesItems.innerHTML = favoriteProducts.map((product) => `
    <article class="favorite-item" data-favorite-id="${product.id}">
      <img src="${product.image}" alt="${product.name}" />
      <div>
        <div class="favorite-item-head">
          <strong>${product.name}</strong>
          <button type="button" data-favorite="${product.id}" aria-label="Remover ${product.name} dos favoritos">×</button>
        </div>
        <span>${formatMoney(product.price)}</span>
        <p>Tamanhos: ${product.sizes.join(", ")}</p>
        <div class="favorite-item-actions">
          <button type="button" data-detail="${product.id}">Ver detalhes</button>
          <button type="button" data-favorite-add-cart="${product.id}">Adicionar</button>
        </div>
      </div>
    </article>
  `).join("");

  favoritesEmpty.hidden = favoriteProducts.length > 0;
}

function renderCart() {
  document.querySelectorAll(".cart-count").forEach((element) => {
    element.textContent = String(getCartCount());
  });

  if (!cartItems || !cartTotal) return;

  cartItems.innerHTML = cart.map((item) => {
    const product = getProduct(item.productId);
    if (!product) return "";

    return `
      <article class="cart-item" data-cart-key="${item.key}">
        <img src="${product.image}" alt="${product.name}" />
        <div>
          <div class="cart-item-head">
            <strong>${product.name}</strong>
            <button type="button" data-remove-cart="${item.key}" aria-label="Remover ${product.name}">×</button>
          </div>
          <span>Tamanho ${item.size}</span>
          <div class="quantity-control">
            <button type="button" data-qty-minus="${item.key}" aria-label="Diminuir quantidade">−</button>
            <input type="number" min="1" value="${item.quantity}" data-qty-input="${item.key}" aria-label="Quantidade de ${product.name}">
            <button type="button" data-qty-plus="${item.key}" aria-label="Aumentar quantidade">+</button>
          </div>
          <p>${formatMoney(product.price)} · Subtotal ${formatMoney(product.price * item.quantity)}</p>
        </div>
      </article>
    `;
  }).join("");

  const hasItems = cart.length > 0;
  cartEmpty.hidden = hasItems;
  checkoutButton.disabled = !hasItems;
  cartTotal.textContent = formatMoney(getCartTotal());
}

function renderDetail(productId) {
  const product = getProduct(productId);
  if (!product || !detailContent) return;

  activeProductId = productId;
  const relatedProducts = product.related.map(getProduct).filter(Boolean);
  const favoriteClass = isFavorite(product.id) ? " is-favorite" : "";

  detailContent.innerHTML = `
    <div class="detail-gallery">
      <div class="detail-main-image">
        <img src="${product.gallery[0]}" alt="${product.name}" id="detailMainImage" />
      </div>
      <div class="detail-thumbs">
        ${product.gallery.map((image, index) => `
          <button class="${index === 0 ? "is-active" : ""}" type="button" data-gallery-image="${image}">
            <img src="${image}" alt="Visual ${index + 1} de ${product.name}" />
          </button>
        `).join("")}
      </div>
    </div>

    <div class="detail-info">
      <p class="eyebrow dark">Produto ENTRENÓS</p>
      <h2>${product.name}</h2>
      <strong class="detail-price">${formatMoney(product.price)}</strong>
      <p>${product.description}</p>

      <div class="detail-options">
        <div>
          <span>Tamanho</span>
          <div class="size-pills" data-detail-sizes>
            ${product.sizes.map((size, index) => `
              <button class="${index === 0 ? "is-selected" : ""}" type="button" data-size="${size}">${size}</button>
            `).join("")}
          </div>
        </div>
        <label class="detail-quantity">
          <span>Quantidade</span>
          <input type="number" min="1" value="1" id="detailQuantity">
        </label>
      </div>

      <div class="detail-actions">
        <button class="button button-primary" type="button" data-detail-add="${product.id}">Adicionar ao carrinho</button>
        <button class="detail-favorite${favoriteClass}" type="button" data-favorite="${product.id}">♥ Favoritar</button>
      </div>

      <div class="related-products">
        <span>Combine também</span>
        <div>
          ${relatedProducts.map((related) => `
            <button type="button" data-detail="${related.id}">
              <img src="${related.image}" alt="${related.name}" />
              <strong>${related.name}</strong>
            </button>
          `).join("")}
        </div>
      </div>
    </div>
  `;
}

function addToCart(productId, size, quantity = 1) {
  const product = getProduct(productId);
  if (!product) return;

  const selectedSize = size || product.sizes[0];
  const amount = Math.max(1, Number(quantity) || 1);
  const key = `${productId}-${selectedSize}`;
  const existingItem = cart.find((item) => item.key === key);

  if (existingItem) {
    existingItem.quantity += amount;
  } else {
    cart.push({ key, productId, size: selectedSize, quantity: amount });
  }

  saveCart();
  renderCart();

  if (productDetail?.classList.contains("is-open")) {
    closeDetail();
  }

  favoritesDrawer?.classList.remove("is-open");
  favoritesDrawer?.setAttribute("aria-hidden", "true");
  openCart();
}

function removeCartItem(key) {
  cart = cart.filter((item) => item.key !== key);
  saveCart();
  renderCart();
}

function updateCartQuantity(key, quantity) {
  const item = cart.find((cartItem) => cartItem.key === key);
  if (!item) return;

  item.quantity = Math.max(1, Number(quantity) || 1);
  saveCart();
  renderCart();
}

function toggleFavorite(productId) {
  favorites = isFavorite(productId)
    ? favorites.filter((id) => id !== productId)
    : [...favorites, productId];

  saveFavorites();
  renderProducts();
  renderFavorites();
  renderCart();

  if (activeProductId) {
    renderDetail(activeProductId);
  }
}

function openCart() {
  screenOverlay.hidden = false;
  favoritesDrawer?.classList.remove("is-open");
  favoritesDrawer?.setAttribute("aria-hidden", "true");
  cartDrawer?.classList.add("is-open");
  cartDrawer?.setAttribute("aria-hidden", "false");
}

function openFavorites() {
  renderFavorites();
  screenOverlay.hidden = false;
  cartDrawer?.classList.remove("is-open");
  cartDrawer?.setAttribute("aria-hidden", "true");
  favoritesDrawer?.classList.add("is-open");
  favoritesDrawer?.setAttribute("aria-hidden", "false");
}

function closePanels() {
  screenOverlay.hidden = true;
  cartDrawer?.classList.remove("is-open");
  cartDrawer?.setAttribute("aria-hidden", "true");
  favoritesDrawer?.classList.remove("is-open");
  favoritesDrawer?.setAttribute("aria-hidden", "true");
}

function openDetail(productId) {
  closePanels();
  renderDetail(productId);
  productDetail?.classList.add("is-open");
  productDetail?.setAttribute("aria-hidden", "false");
  document.body.classList.add("detail-open");
}

function closeDetail() {
  productDetail?.classList.remove("is-open");
  productDetail?.setAttribute("aria-hidden", "true");
  document.body.classList.remove("detail-open");
  activeProductId = null;
}

function buildCheckoutMessage() {
  const lines = cart.map((item) => {
    const product = getProduct(item.productId);
    const subtotal = product.price * item.quantity;
    return `- ${product.name} | Tam: ${item.size} | Qtd: ${item.quantity} | Subtotal: ${formatMoney(subtotal)}`;
  });

  return [
    "Olá! Vim pelo site da ENTRENÓS Store e quero finalizar este pedido:",
    "",
    ...lines,
    "",
    `Total: ${formatMoney(getCartTotal())}`,
  ].join("\n");
}

function checkoutWhatsApp() {
  if (!cart.length) return;
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildCheckoutMessage())}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

function closeMenu() {
  document.body.classList.remove("menu-open");
  menuToggle?.setAttribute("aria-expanded", "false");
  menuToggle?.setAttribute("aria-label", "Abrir menu");
}

menuToggle?.addEventListener("click", () => {
  const isOpen = document.body.classList.toggle("menu-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
});

document.addEventListener("click", (event) => {
  const target = event.target;
  const addButton = target.closest("[data-add-cart]");
  const detailAddButton = target.closest("[data-detail-add]");
  const detailButton = target.closest("[data-detail]");
  const favoriteButton = target.closest("[data-favorite]");
  const removeButton = target.closest("[data-remove-cart]");
  const minusButton = target.closest("[data-qty-minus]");
  const plusButton = target.closest("[data-qty-plus]");
  const favoriteAddCartButton = target.closest("[data-favorite-add-cart]");
  const galleryButton = target.closest("[data-gallery-image]");
  const sizeButton = target.closest("[data-size]");

  if (target.closest(".cart-trigger")) {
    openCart();
  }

  if (target.closest("[data-close-panels]")) {
    closePanels();
  }

  if (target.closest("[data-close-detail]")) {
    closeDetail();
  }

  if (target.closest(".js-show-favorites")) {
    openFavorites();
  }

  if (addButton) {
    const productId = addButton.dataset.addCart;
    const size = document.querySelector(`[data-card-size="${productId}"]`)?.value;
    addToCart(productId, size, 1);
  }

  if (detailAddButton) {
    const selectedSize = document.querySelector("[data-detail-sizes] .is-selected")?.dataset.size;
    const quantity = document.querySelector("#detailQuantity")?.value;
    addToCart(detailAddButton.dataset.detailAdd, selectedSize, quantity);
  }

  if (detailButton) {
    openDetail(detailButton.dataset.detail);
  }

  if (favoriteButton) {
    toggleFavorite(favoriteButton.dataset.favorite);
  }

  if (favoriteAddCartButton) {
    const product = getProduct(favoriteAddCartButton.dataset.favoriteAddCart);
    if (!product) return;
    addToCart(product.id, product.sizes[0], 1);
  }

  if (removeButton) {
    removeCartItem(removeButton.dataset.removeCart);
  }

  if (minusButton) {
    const item = cart.find((cartItem) => cartItem.key === minusButton.dataset.qtyMinus);
    updateCartQuantity(minusButton.dataset.qtyMinus, item.quantity - 1);
  }

  if (plusButton) {
    const item = cart.find((cartItem) => cartItem.key === plusButton.dataset.qtyPlus);
    updateCartQuantity(plusButton.dataset.qtyPlus, item.quantity + 1);
  }

  if (galleryButton) {
    document.querySelector("#detailMainImage").src = galleryButton.dataset.galleryImage;
    document.querySelectorAll("[data-gallery-image]").forEach((button) => button.classList.remove("is-active"));
    galleryButton.classList.add("is-active");
  }

  if (sizeButton) {
    document.querySelectorAll("[data-size]").forEach((button) => button.classList.remove("is-selected"));
    sizeButton.classList.add("is-selected");
  }
});

document.addEventListener("input", (event) => {
  const input = event.target.closest("[data-qty-input]");
  if (input) {
    updateCartQuantity(input.dataset.qtyInput, input.value);
  }
});

document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", closeMenu);
});

checkoutButton?.addEventListener("click", checkoutWhatsApp);

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

renderProducts();
renderFavorites();
renderCart();
