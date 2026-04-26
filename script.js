const TRADENEST_CATEGORIES = [
  { slug: "adhesives", label: "Adhesives", icon: "🧱" },
  { slug: "hardware", label: "Hardware", icon: "🔩" },
  { slug: "tools", label: "Tools", icon: "🛠️" },
  { slug: "plumbing", label: "Plumbing", icon: "🚰" },
  { slug: "tiles", label: "Tiles", icon: "◻️" },
];

const TRADENEST_BRANDS = ["UltraTech", "Astral", "Kajaria", "Pidilite", "Hindware", "Bosch", "Jaquar"];

const HERO_SLIDES = [
  {
    title: "Construction Materials, Faster Enquiries",
    text: "Search tiles, adhesives, tools and plumbing supplies in one place. Get project pricing on WhatsApp within minutes.",
    image:
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1400&q=80",
  },
  {
    title: "Bulk Orders For Sites, Stores And Contractors",
    text: "Share your quantity, district and preferred brand. Tradenest prepares a quotation without a traditional checkout flow.",
    image:
      "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1400&q=80",
  },
  {
    title: "Built For WhatsApp-First Buying",
    text: "Add items to the enquiry cart, send one structured message and continue the conversation over phone or WhatsApp.",
    image:
      "https://images.unsplash.com/photo-1599707254554-027aeb4deacd?auto=format&fit=crop&w=1400&q=80",
  },
];

const PLACEHOLDER_IMAGE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 420">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#ffedd5"/>
          <stop offset="100%" stop-color="#e0f2fe"/>
        </linearGradient>
      </defs>
      <rect width="640" height="420" fill="url(#g)"/>
      <rect x="90" y="78" width="460" height="264" rx="18" fill="#ffffff" opacity="0.88"/>
      <path d="M190 270h260M190 228h174M190 186h206" stroke="#94a3b8" stroke-width="18" stroke-linecap="round"/>
      <circle cx="154" cy="190" r="24" fill="#f97316"/>
      <text x="320" y="362" font-size="32" text-anchor="middle" fill="#475569" font-family="Segoe UI, Arial">Tradenest Product</text>
    </svg>
  `);

let allProducts = [];
let filteredProducts = [];
let selectedBrand = "All";
let searchTerm = "";

const getPageCategory = () => document.body.dataset.pageCategory || "";

const getDistrict = () => {
  const districtSelect = document.querySelector("[data-district-select]");
  return districtSelect?.value || "Other";
};

const getQuantityFromCard = (productId) => {
  const input = document.querySelector(`[data-qty-input="${productId}"]`);
  return Math.max(1, Number(input?.value || 1));
};

window.updateQty = (productId, change) => {
  const input = document.querySelector(`[data-qty-input="${productId}"]`);
  if (!input) {
    return;
  }

  const nextValue = Math.max(1, Number(input.value || 1) + change);
  input.value = nextValue;
};

const generateWhatsAppUrl = (message) => {
  const phone = window.TRADENEST_CONFIG?.phoneNumber || "9998869515";
  return `https://wa.me/${phone}?text=${message}`;
};

const formatProductMessage = (productName, quantity, district) =>
  encodeURIComponent(`Hello, I want price for ${productName} ${quantity} pcs for ${district}`);

const showToast = (text, tone = "dark") => {
  const toast = document.getElementById("toast");
  if (!toast) {
    return;
  }

  toast.textContent = text;
  toast.className =
    `fixed bottom-4 left-1/2 z-[80] -translate-x-1/2 rounded-full px-5 py-3 text-sm font-semibold shadow-xl transition ${tone === "success" ? "bg-emerald-600 text-white" : "bg-slate-900 text-white"}`;
  toast.classList.remove("hidden");

  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.add("hidden"), 2400);
};

const createCategoryGrid = () => {
  const grid = document.getElementById("category-grid");
  const nav = document.getElementById("category-nav");
  const mobileNav = document.getElementById("category-nav-mobile");
  const navMarkup = TRADENEST_CATEGORIES.map((category) => {
    const active = category.slug === getPageCategory();
    return `
      <a href="${category.slug}.html"
        class="nav-pill whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold ${active ? "bg-slate-900 text-white" : "bg-white text-slate-700"}">
        ${category.label}
      </a>
    `;
  }).join("");

  if (grid) {
    grid.innerHTML = TRADENEST_CATEGORIES.map(
      (category) => `
        <a href="${category.slug}.html" class="section-card fade-up rounded-3xl p-5 text-center">
          <div class="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-2xl">${category.icon}</div>
          <h3 class="text-base font-bold text-slate-900">${category.label}</h3>
          <p class="mt-2 text-sm text-slate-500">Enquire instantly for ${category.label.toLowerCase()} supplies.</p>
        </a>
      `
    ).join("");
  }

  if (nav) {
    nav.innerHTML = navMarkup;
  }

  if (mobileNav) {
    mobileNav.innerHTML = navMarkup;
  }
};

const createHeroSlider = () => {
  const slider = document.getElementById("hero-slider");
  if (!slider) {
    return;
  }

  slider.innerHTML = HERO_SLIDES.map(
    (slide, index) => `
      <article class="hero-slide ${index === 0 ? "block" : "hidden"} rounded-[2rem] p-8 text-white md:p-12"
        data-hero-slide="${index}"
        style="background-image: linear-gradient(90deg, rgba(15,23,42,.8), rgba(15,23,42,.3)), url('${slide.image}')">
        <div class="max-w-2xl">
          <span class="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]">Tradenest</span>
          <h1 class="mt-5 text-3xl font-black leading-tight md:text-5xl">${slide.title}</h1>
          <p class="mt-4 max-w-xl text-sm text-slate-100 md:text-base">${slide.text}</p>
          <div class="mt-8 flex flex-wrap gap-3">
            <a href="#featured-products" class="rounded-full bg-orange-500 px-5 py-3 text-sm font-bold text-white">Browse Products</a>
            <a href="#bulk-order" class="rounded-full border border-white/30 px-5 py-3 text-sm font-bold text-white">Request Bulk Quote</a>
          </div>
        </div>
      </article>
    `
  ).join("");

  let activeSlide = 0;
  window.setInterval(() => {
    const slides = slider.querySelectorAll("[data-hero-slide]");
    if (!slides.length) {
      return;
    }

    slides[activeSlide].classList.add("hidden");
    activeSlide = (activeSlide + 1) % slides.length;
    slides[activeSlide].classList.remove("hidden");
  }, 4200);
};

const populateBrandStrip = () => {
  const container = document.getElementById("brand-strip");
  if (!container) {
    return;
  }

  container.innerHTML = TRADENEST_BRANDS.map(
    (brand) => `
      <div class="brand-chip rounded-2xl px-5 py-4 text-center">
        <p class="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Trusted Brand</p>
        <h3 class="mt-1 text-lg font-black text-slate-900">${brand}</h3>
      </div>
    `
  ).join("");
};

const updateBrandFilter = () => {
  const brandFilter = document.getElementById("brand-filter");
  if (!brandFilter) {
    return;
  }

  const brands = ["All", ...new Set(allProducts.map((product) => product.brand).filter(Boolean))];
  brandFilter.innerHTML = brands
    .map((brand) => `<option value="${brand}">${brand}</option>`)
    .join("");
  brandFilter.value = selectedBrand;
};

const renderProductSkeletons = () => {
  const grid = document.getElementById("product-grid");
  if (!grid) {
    return;
  }

  grid.innerHTML = Array.from({ length: 6 }, () => `
    <article class="product-card rounded-3xl p-4">
      <div class="skeleton h-44 rounded-2xl"></div>
      <div class="skeleton mt-4 h-5 rounded-full"></div>
      <div class="skeleton mt-3 h-4 w-2/3 rounded-full"></div>
      <div class="skeleton mt-4 h-10 rounded-2xl"></div>
      <div class="skeleton mt-4 h-10 rounded-2xl"></div>
    </article>
  `).join("");
};

const renderProducts = (products) => {
  const grid = document.getElementById("product-grid");
  const empty = document.getElementById("empty-state");
  const count = document.getElementById("result-count");

  if (!grid) {
    return;
  }

  count && (count.textContent = `${products.length} products`);

  if (!products.length) {
    grid.innerHTML = "";
    empty?.classList.remove("hidden");
    return;
  }

  empty?.classList.add("hidden");
  grid.innerHTML = products
    .map(
      (product) => `
        <article class="product-card rounded-3xl p-4 fade-up">
          <div class="product-image flex h-48 items-center justify-center overflow-hidden rounded-2xl">
            <img
              src="${product.image_url || PLACEHOLDER_IMAGE}"
              alt="${product.product_name}"
              loading="lazy"
              onerror="this.src='${PLACEHOLDER_IMAGE}'"
              class="h-full w-full object-cover"
            />
          </div>
          <div class="mt-4">
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="text-xs font-bold uppercase tracking-[0.18em] text-orange-600">${product.brand || "Generic Brand"}</p>
                <h3 class="mt-2 text-lg font-extrabold leading-snug text-slate-900">${product.product_name}</h3>
              </div>
              <span class="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700">Price on request</span>
            </div>
            <p class="mt-3 line-clamp-2 min-h-[40px] text-sm text-slate-500">${product.description || "High-demand construction material available for quotation requests and local delivery discussion."}</p>
          </div>
          <div class="mt-5 flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
            <span class="text-sm font-semibold text-slate-600">Quantity</span>
            <div class="flex items-center gap-2">
              <button class="qty-button rounded-xl border border-slate-200 bg-white font-black text-slate-700" onclick="updateQty('${product.id}', -1)" type="button">-</button>
              <input data-qty-input="${product.id}" value="1" min="1" type="number" class="w-16 rounded-xl border border-slate-200 bg-white px-2 py-2 text-center text-sm font-semibold outline-none" />
              <button class="qty-button rounded-xl border border-slate-200 bg-white font-black text-slate-700" onclick="updateQty('${product.id}', 1)" type="button">+</button>
            </div>
          </div>
          <div class="mt-5 grid gap-3">
            <a
              href="${generateWhatsAppUrl(formatProductMessage(product.product_name, 1, "Other"))}"
              onclick="return sendProductWhatsApp(event, '${product.id}')"
              class="cta-whatsapp rounded-2xl px-4 py-3 text-center text-sm font-bold text-white">
              WhatsApp Order
            </a>
            <a href="tel:+91${window.TRADENEST_CONFIG?.phoneNumber || "999886951599"}" class="cta-call rounded-2xl px-4 py-3 text-center text-sm font-bold text-white">Call Now</a>
            <button onclick="addProductToCart('${product.id}')" class="cta-cart rounded-2xl px-4 py-3 text-sm font-bold text-white" type="button">
              Add to Enquiry Cart
            </button>
          </div>
        </article>
      `
    )
    .join("");
};

const filterProducts = () => {
  const categoryFilter = document.getElementById("category-filter");
  const activeCategory = getPageCategory() || categoryFilter?.value || "All";

  filteredProducts = allProducts.filter((product) => {
    const matchesSearch =
      !searchTerm ||
      product.product_name.toLowerCase().includes(searchTerm) ||
      product.brand?.toLowerCase().includes(searchTerm) ||
      product.category?.toLowerCase().includes(searchTerm);

    const matchesBrand = selectedBrand === "All" || product.brand === selectedBrand;
    const matchesCategory = activeCategory === "All" || product.category === activeCategory;

    return matchesSearch && matchesBrand && matchesCategory;
  });

  renderProducts(filteredProducts);
};

const renderCategoryFilter = () => {
  const filter = document.getElementById("category-filter");
  if (!filter) {
    return;
  }

  const options = ["All", ...TRADENEST_CATEGORIES.map((category) => category.slug)];
  filter.innerHTML = options
    .map((option) => `<option value="${option}">${option === "All" ? "All Categories" : option[0].toUpperCase() + option.slice(1)}</option>`)
    .join("");
  filter.value = getPageCategory() || "All";
  filter.disabled = Boolean(getPageCategory());
};

const loadProducts = async () => {
  renderProductSkeletons();
  const currentCategory = getPageCategory();
  allProducts = await window.tradenestSupabase.fetchProducts(currentCategory);

  updateBrandFilter();
  renderCategoryFilter();
  filterProducts();
};

const renderCart = () => {
  const items = window.TradenestCart.read();
  const badge = document.querySelectorAll("[data-cart-count]");
  badge.forEach((node) => (node.textContent = window.TradenestCart.count()));

  const cartList = document.getElementById("cart-items");
  const cartEmpty = document.getElementById("cart-empty");

  if (!cartList || !cartEmpty) {
    return;
  }

  if (!items.length) {
    cartEmpty.classList.remove("hidden");
    cartList.innerHTML = "";
    return;
  }

  cartEmpty.classList.add("hidden");
  cartList.innerHTML = items
    .map(
      (item) => `
        <div class="rounded-2xl border border-slate-200 p-3">
          <div class="flex gap-3">
            <img src="${item.image_url || PLACEHOLDER_IMAGE}" alt="${item.product_name}" class="h-16 w-16 rounded-2xl object-cover" loading="lazy" />
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-bold text-slate-900">${item.product_name}</p>
              <p class="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">${item.brand || "Brand"}</p>
              <div class="mt-3 flex items-center justify-between gap-3">
                <input type="number" min="1" value="${item.quantity}" onchange="updateCartQuantity('${item.id}', this.value)" class="w-20 rounded-xl border border-slate-200 px-2 py-2 text-sm font-semibold" />
                <button onclick="removeCartItem('${item.id}')" type="button" class="text-sm font-bold text-rose-600">Remove</button>
              </div>
            </div>
          </div>
        </div>
      `
    )
    .join("");
};

const setupCartDrawer = () => {
  const openButtons = document.querySelectorAll("[data-open-cart]");
  const drawer = document.getElementById("cart-drawer");
  const backdrop = document.getElementById("drawer-backdrop");
  const closeButton = document.getElementById("close-cart");
  const whatsappButton = document.getElementById("cart-whatsapp");
  const clearButton = document.getElementById("clear-cart");

  if (!drawer || !backdrop) {
    return;
  }

  const openDrawer = () => {
    backdrop.classList.remove("hidden");
    drawer.classList.remove("translate-x-full");
  };

  const closeDrawer = () => {
    drawer.classList.add("translate-x-full");
    backdrop.classList.add("hidden");
  };

  openButtons.forEach((button) => button.addEventListener("click", openDrawer));
  closeButton?.addEventListener("click", closeDrawer);
  backdrop.addEventListener("click", closeDrawer);

  whatsappButton?.addEventListener("click", () => {
    const message = window.TradenestCart.generateQuotationMessage(getDistrict());
    if (!message) {
      showToast("Your enquiry cart is empty.");
      return;
    }

    window.open(generateWhatsAppUrl(message), "_blank");
  });

  clearButton?.addEventListener("click", () => {
    window.TradenestCart.clear();
    showToast("Enquiry cart cleared.");
  });
};

window.addProductToCart = (productId) => {
  const product = allProducts.find((item) => String(item.id) === String(productId));
  if (!product) {
    return;
  }

  const quantity = getQuantityFromCard(productId);
  window.TradenestCart.add(product, quantity);
  showToast(`${product.product_name} added to enquiry cart.`, "success");
};

window.removeCartItem = (productId) => {
  window.TradenestCart.remove(productId);
  showToast("Item removed from cart.");
};

window.updateCartQuantity = (productId, quantity) => {
  window.TradenestCart.update(productId, quantity);
};

window.sendProductWhatsApp = (event, productId) => {
  event.preventDefault();

  const product = allProducts.find((item) => String(item.id) === String(productId));
  if (!product) {
    return false;
  }

  const quantity = getQuantityFromCard(productId);
  const district = getDistrict();
  const message = formatProductMessage(product.product_name, quantity, district);
  window.open(generateWhatsAppUrl(message), "_blank");
  return false;
};

const setupFilters = () => {
  const searchInput = document.getElementById("search-input");
  const brandFilter = document.getElementById("brand-filter");
  const categoryFilter = document.getElementById("category-filter");

  searchInput?.addEventListener("input", (event) => {
    searchTerm = event.target.value.trim().toLowerCase();
    filterProducts();
  });

  brandFilter?.addEventListener("change", (event) => {
    selectedBrand = event.target.value;
    filterProducts();
  });

  categoryFilter?.addEventListener("change", () => filterProducts());
};

const setupDistrictSync = () => {
  const selectors = document.querySelectorAll("[data-district-select]");
  selectors.forEach((selector) => {
    selector.addEventListener("change", (event) => {
      selectors.forEach((node) => {
        if (node !== event.target) {
          node.value = event.target.value;
        }
      });
      renderCart();
    });
  });
};

const setupBulkForm = () => {
  const form = document.getElementById("bulk-order-form");
  const status = document.getElementById("bulk-order-status");
  const whatsappButton = document.getElementById("bulk-whatsapp-button");

  if (!form) {
    return;
  }

  const getBulkPayload = () => {
    const formData = new FormData(form);
    return {
      name: formData.get("name"),
      phone: formData.get("phone"),
      product: formData.get("product"),
      quantity: formData.get("quantity"),
      district: formData.get("district"),
      enquiry_type: "bulk_order",
      created_at: new Date().toISOString(),
    };
  };

  const buildBulkWhatsAppMessage = (payload) =>
    encodeURIComponent(
      `Hello, I want bulk quotation for ${payload.product}, quantity ${payload.quantity}, district ${payload.district}. Name: ${payload.name}, Phone: ${payload.phone}`
    );

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const payload = getBulkPayload();

    status.textContent = "Submitting your bulk enquiry...";
    status.className = "mt-4 text-sm font-semibold text-slate-600";

    const { error } = await window.tradenestSupabase.createEnquiry(payload);

    if (error) {
      console.error("Bulk enquiry insert failed:", error);
      status.textContent = `Supabase save failed: ${error.message || "Unknown error"}. WhatsApp message is still opening.`;
      status.className = "mt-4 text-sm font-semibold text-amber-600";
    } else {
      status.textContent = "Bulk enquiry saved in Supabase.";
      status.className = "mt-4 text-sm font-semibold text-emerald-600";
    }
    form.reset();
  });

  whatsappButton?.addEventListener("click", () => {
    if (!form.reportValidity()) {
      return;
    }

    const payload = getBulkPayload();
    const message = buildBulkWhatsAppMessage(payload);
    window.open(generateWhatsAppUrl(message), "_blank");
  });
};

const toggleSupabaseNotice = () => {
  const notice = document.getElementById("supabase-notice");
  if (!notice) {
    return;
  }

  notice.classList.toggle("hidden", window.tradenestSupabase.hasConfig);
};

const setupMobileMenu = () => {
  const toggle = document.getElementById("mobile-menu-toggle");
  const panel = document.getElementById("mobile-menu-panel");

  if (!toggle || !panel) {
    return;
  }

  toggle.addEventListener("click", () => {
    const isHidden = panel.classList.toggle("hidden");
    toggle.setAttribute("aria-expanded", String(!isHidden));
  });
};

document.addEventListener("tradenest:cart-updated", renderCart);

document.addEventListener("DOMContentLoaded", async () => {
  createCategoryGrid();
  createHeroSlider();
  populateBrandStrip();
  setupFilters();
  setupDistrictSync();
  setupCartDrawer();
  setupBulkForm();
  setupMobileMenu();
  toggleSupabaseNotice();
  renderCart();
  await loadProducts();
});
