const PRODUCTS = {
  adult: { id: "adult", name: "Adult BIOPATCH", price: 500, detail: "10 plasters per pack" },
  kids: { id: "kids", name: "Children's BIOPATCH", price: 600, detail: "10 plasters + 5 markers" }
};
let cart = {};

const $ = (id) => document.getElementById(id);
const money = (amount) => "₹" + amount.toLocaleString("en-IN");
const cartQuantity = () => Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
const cartTotal = () => Object.values(cart).reduce((sum, item) => sum + item.price * item.quantity, 0);

function addToCart(id) {
  const product = PRODUCTS[id];
  if (!product) return;
  if (!cart[id]) cart[id] = { ...product, quantity: 0 };
  cart[id].quantity += 1;
  renderCart();
  openCart();
}
function changeQuantity(id, amount) {
  if (!cart[id]) return;
  cart[id].quantity += amount;
  if (cart[id].quantity <= 0) delete cart[id];
  renderCart();
}
function removeItem(id) { delete cart[id]; renderCart(); }

function renderCart() {
  $("cartCount").textContent = cartQuantity();
  $("drawerCount").textContent = `(${cartQuantity()})`;
  $("cartSubtotal").textContent = money(cartTotal());
  $("goCheckout").disabled = cartQuantity() === 0;
  const entries = Object.values(cart);
  $("cartItems").innerHTML = entries.length ? entries.map(item => `
    <div class="cart-row">
      <div><h3>${item.name}</h3><p>${item.detail}</p>
        <div class="cart-controls">
          <button aria-label="Decrease quantity" data-action="minus" data-id="${item.id}">−</button>
          <span>${item.quantity}</span>
          <button aria-label="Increase quantity" data-action="plus" data-id="${item.id}">+</button>
          <button class="remove-item" data-action="remove" data-id="${item.id}">Remove</button>
        </div>
      </div><strong class="cart-row-price">${money(item.price * item.quantity)}</strong>
    </div>`).join("") : `<div class="empty-cart">Your bag is looking a little empty.<br><a href="#products" id="continueShopping">Explore the collection →</a></div>`;
  $("cartItems").querySelectorAll("[data-action]").forEach(button => {
    button.addEventListener("click", () => {
      const { action, id } = button.dataset;
      if (action === "minus") changeQuantity(id, -1);
      if (action === "plus") changeQuantity(id, 1);
      if (action === "remove") removeItem(id);
    });
  });
  const continueLink = $("continueShopping");
  if (continueLink) continueLink.addEventListener("click", closeCart);
}

function openCart() { document.body.classList.add("cart-open"); $("cartDrawer").setAttribute("aria-hidden", "false"); }
function closeCart() { document.body.classList.remove("cart-open"); $("cartDrawer").setAttribute("aria-hidden", "true"); }
function fillCheckout() {
  $("checkoutItems").innerHTML = Object.values(cart).map(item =>
    `<div class="summary-row"><span>${item.name} × ${item.quantity}</span><strong>${money(item.price * item.quantity)}</strong></div>`
  ).join("");
  $("checkoutTotal").textContent = money(cartTotal());
  $("paymentTotal").textContent = money(cartTotal());
}

document.querySelectorAll(".add-button").forEach(button => button.addEventListener("click", () => addToCart(button.dataset.product)));
$("openCart").addEventListener("click", openCart);
$("closeCart").addEventListener("click", closeCart);
$("drawerBackdrop").addEventListener("click", closeCart);
$("goCheckout").addEventListener("click", () => {
  if (!cartQuantity()) return;
  closeCart();
  fillCheckout();
  $("checkoutOverlay").classList.add("show");
  $("checkoutOverlay").setAttribute("aria-hidden", "false");
});
$("closeCheckout").addEventListener("click", () => {
  $("checkoutOverlay").classList.remove("show");
  $("checkoutOverlay").setAttribute("aria-hidden", "true");
});
$("checkoutForm").addEventListener("submit", (event) => {
  event.preventDefault();
  if (!event.currentTarget.reportValidity()) return;
  $("checkoutOverlay").classList.remove("show");
  $("paymentOverlay").classList.add("show");
  $("paymentOverlay").setAttribute("aria-hidden", "false");
  $("successMessage").classList.remove("show");
});
$("closePayment").addEventListener("click", () => {
  $("paymentOverlay").classList.remove("show");
  $("paymentOverlay").setAttribute("aria-hidden", "true");
});
$("demoPay").addEventListener("click", () => {
  $("successMessage").classList.add("show");
});
$("menuToggle").addEventListener("click", () => $("mainNav").classList.toggle("open"));
document.querySelectorAll("#mainNav a").forEach(link => link.addEventListener("click", () => $("mainNav").classList.remove("open")));
renderCart();
