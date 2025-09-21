/* script.js — shared behavior across pages
   - Provides product data (demo)
   - Renders products on product pages and featured on home
   - Manages cart stored in localStorage
   - Updates cart counter and cart page UI
   - Handles responsive nav toggle
*/

/* -----------------------
   Demo product data
   ----------------------- */
const PRODUCTS = [
  {
    id: "p1",
    name: "Luna Ceramic Mug",
    price: 14.99,
    category: "home",
    image: "https://picsum.photos/seed/p1/600/400",
    description: "Hand-glazed ceramic mug, 350ml. Comfortable handle."
  },
  {
    id: "p2",
    name: "Aurora Throw Pillow",
    price: 29.0,
    category: "home",
    image: "https://picsum.photos/seed/p2/600/400",
    description: "Soft textured pillow with modern design."
  },
  {
    id: "p3",
    name: "Stellar Desk Lamp",
    price: 49.5,
    category: "lighting",
    image: "https://picsum.photos/seed/p3/600/400",
    description: "Compact LED desk lamp with dimmer."
  },
  {
    id: "p4",
    name: "Voyage Backpack",
    price: 69.0,
    category: "accessories",
    image: "https://picsum.photos/seed/p4/600/400",
    description: "Weatherproof backpack for daily commute."
  },
  {
    id: "p5",
    name: "Nimbus Tumbler",
    price: 19.99,
    category: "kitchen",
    image: "https://picsum.photos/seed/p5/600/400",
    description: "Insulated tumbler keeps drinks hot or cold."
  },
  {
    id: "p6",
    name: "Horizon Wall Art",
    price: 39.0,
    category: "decor",
    image: "https://picsum.photos/seed/p6/600/400",
    description: "Minimalist canvas print (30 x 40 cm)."
  }
];

/* -----------------------
   Utilities & cart logic
   ----------------------- */
const CART_KEY = "aurora_cart_v1";

function getCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.error("Failed to parse cart:", e);
    return {};
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
}

function addToCart(productId, qty = 1) {
  const cart = getCart();
  cart[productId] = (cart[productId] || 0) + qty;
  saveCart(cart);
  showToast("Added to cart", "success");
}

function removeFromCart(productId) {
  const cart = getCart();
  if (cart[productId]) {
    delete cart[productId];
    saveCart(cart);
  }
}

function setQty(productId, qty) {
  const cart = getCart();
  if (qty <= 0) {
    delete cart[productId];
  } else {
    cart[productId] = qty;
  }
  saveCart(cart);
}

/* -----------------------
   Rendering functions
   ----------------------- */

function formatPrice(n) {
  return `$${n.toFixed(2)}`;
}

function findProduct(id) {
  return PRODUCTS.find(p => p.id === id);
}

function renderProductsGrid(containerId, items) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";
  items.forEach(p => {
    const card = document.createElement("article");
    card.className = "product-card";
    card.innerHTML = `
      <div class="product-media">
        <img src="${p.image}" alt="${p.name}">
      </div>
      <div>
        <h3 class="product-title">${p.name}</h3>
        <p class="meta">${p.description}</p>
      </div>
      <div class="product-meta">
        <div class="price">${formatPrice(p.price)}</div>
        <div>
          <button class="btn btn-ghost" data-id="${p.id}" aria-label="View details">View</button>
          <button class="btn btn-primary" data-add="${p.id}" aria-label="Add to cart">Add</button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });

  // attach add handlers
  container.querySelectorAll("[data-add]").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const id = e.currentTarget.getAttribute("data-add");
      addToCart(id, 1);
    });
  });

  // view buttons could be extended to open product pages / modals
}

function renderFeatured() {
  // choose first 3 products as featured
  renderProductsGrid("featuredGrid", PRODUCTS.slice(0, 3));
}

function populateCategoryFilter() {
  const sel = document.getElementById("categoryFilter");
  if (!sel) return;
  const cats = ["all", ...new Set(PRODUCTS.map(p => p.category))];
  sel.innerHTML = cats.map(c => `<option value="${c}">${c[0].toUpperCase()+c.slice(1)}</option>`).join("");
}

function applyProductFilters() {
  const grid = document.getElementById("productsGrid");
  if (!grid) return;

  const cat = document.getElementById("categoryFilter")?.value || "all";
  const sort = document.getElementById("sortSelect")?.value || "featured";
  const q = document.getElementById("searchInput")?.value?.toLowerCase() || "";

  let items = PRODUCTS.filter(p => (cat === "all" ? true : p.category === cat));
  if (q) {
    items = items.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
  }

  if (sort === "price-asc") items.sort((a,b) => a.price - b.price);
  if (sort === "price-desc") items.sort((a,b) => b.price - a.price);
  if (sort === "alpha") items.sort((a,b) => a.name.localeCompare(b.name));

  renderProductsGrid("productsGrid", items);
}

/* -----------------------
   Cart page rendering
   ----------------------- */
function renderCartPage() {
  const cart = getCart();
  const keys = Object.keys(cart);
  const cartContainer = document.getElementById("cartContainer");
  const cartBody = document.getElementById("cartBody");
  const cartEmpty = document.getElementById("cartEmpty");

  if (!cartBody || !cartContainer || !cartEmpty) return;

  if (keys.length === 0) {
    cartContainer.style.display = "none";
    cartEmpty.style.display = "block";
    return;
  }

  cartContainer.style.display = "block";
  cartEmpty.style.display = "none";
  cartBody.innerHTML = "";

  let subtotal = 0;

  keys.forEach(id => {
    const qty = cart[id];
    const prod = findProduct(id);
    const row = document.createElement("tr");
    const subtotalItem = prod.price * qty;
    subtotal += subtotalItem;

    row.innerHTML = `
      <td>
        <div style="display:flex;gap:.75rem;align-items:center">
          <img src="${prod.image}" alt="${prod.name}" style="width:80px;height:56px;object-fit:cover;border-radius:6px"/>
          <div>
            <div style="font-weight:600">${prod.name}</div>
            <div style="font-size:.85rem;color:var(--muted)">${prod.description}</div>
          </div>
        </div>
      </td>
      <td>${formatPrice(prod.price)}</td>
      <td>
        <input type="number" min="1" value="${qty}" data-qty="${id}" style="width:72px;padding:.35rem;border-radius:6px;border:1px solid #e9eef7" />
      </td>
      <td>${formatPrice(subtotalItem)}</td>
      <td><button class="btn btn-ghost" data-remove="${id}">Remove</button></td>
    `;
    cartBody.appendChild(row);
  });

  document.getElementById("cartSubtotal").textContent = formatPrice(subtotal);
  const shipping = 5.00;
  document.getElementById("cartShipping").textContent = formatPrice(shipping);
  document.getElementById("cartTotal").textContent = formatPrice(subtotal + shipping);

  // attach event handlers
  cartBody.querySelectorAll("[data-remove]").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const id = e.currentTarget.getAttribute("data-remove");
      removeFromCart(id);
      renderCartPage();
    });
  });

  cartBody.querySelectorAll("input[data-qty]").forEach(input => {
    input.addEventListener("change", (e) => {
      const id = e.currentTarget.getAttribute("data-qty");
      let v = parseInt(e.currentTarget.value, 10);
      if (isNaN(v) || v < 1) v = 1;
      setQty(id, v);
      renderCartPage();
    });
  });

  // Clear / Checkout buttons
  document.getElementById("clearCartBtn")?.addEventListener("click", () => {
    saveCart({});
    renderCartPage();
  });

  document.getElementById("checkoutBtn")?.addEventListener("click", () => {
    // Simulate checkout
    saveCart({});
    renderCartPage();
    showToast("Checkout complete! (demo)", "success");
  });
}

/* -----------------------
   Cart counter
   ----------------------- */
function updateCartCount() {
  const cart = getCart();
  const totalItems = Object.values(cart).reduce((s,v)=>s+v,0);
  document.querySelectorAll("#cartCount").forEach(el => {
    el.textContent = totalItems;
  });
}

/* -----------------------
   Toast (small feedback)
   ----------------------- */
function showToast(message, type="info") {
  const t = document.createElement("div");
  t.className = "toast";
  t.style.position = "fixed";
  t.style.right = "1rem";
  t.style.bottom = "1rem";
  t.style.padding = ".6rem 1rem";
  t.style.borderRadius = "8px";
  t.style.background = type === "success" ? "linear-gradient(90deg,#20c997,#28b487)" : "#333";
  t.style.color = "#fff";
  t.style.boxShadow = "0 8px 30px rgba(2,6,23,0.12)";
  t.style.zIndex = 9999;
  t.textContent = message;
  document.body.appendChild(t);
  setTimeout(()=> t.style.opacity = "0.95", 10);
  setTimeout(()=> t.style.opacity = "0", 2200);
  setTimeout(()=> t.remove(), 2600);
}

/* -----------------------
   Responsive nav toggle
   ----------------------- */
function setupNavToggle() {
  const btn = document.getElementById("navToggle");
  const nav = document.getElementById("mainNav");
  if (!btn || !nav) return;

  btn.addEventListener("click", () => {
    nav.classList.toggle("open");
  });
}

/* -----------------------
   Page init
   ----------------------- */
document.addEventListener("DOMContentLoaded", () => {
  setupNavToggle();
  updateCartCount();

  // render featured on home
  if (document.getElementById("featuredGrid")) {
    renderFeatured();
  }

  // products page setup
  if (document.getElementById("productsGrid")) {
    populateCategoryFilter();
    applyProductFilters();
    document.getElementById("categoryFilter")?.addEventListener("change", applyProductFilters);
    document.getElementById("sortSelect")?.addEventListener("change", applyProductFilters);
    document.getElementById("searchInput")?.addEventListener("input", applyProductFilters);
  }

  // cart page
  if (document.getElementById("cartBody")) {
    renderCartPage();
  }
});
