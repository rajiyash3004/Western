/* ===== Western Avenue — cart.js =====
   Cart is stored in localStorage under 'wa_cart' as an array of:
   { id, name, price (number, INR), qty }
   NOTE: localStorage is per-browser only. There is no shared server-side
   cart/database here — see README for what's needed for a real backend.
*/

const WA_CART_KEY = 'wa_cart';

function waGetCart(){
  try{
    const raw = localStorage.getItem(WA_CART_KEY);
    return raw ? JSON.parse(raw) : [];
  }catch(e){ return []; }
}

function waSaveCart(cart){
  localStorage.setItem(WA_CART_KEY, JSON.stringify(cart));
  waUpdateCartCount();
}

function waCartCount(){
  return waGetCart().reduce(function(sum, item){ return sum + item.qty; }, 0);
}

function waCartTotal(){
  return waGetCart().reduce(function(sum, item){ return sum + item.price * item.qty; }, 0);
}

function waFormatRs(n){
  return 'Rs. ' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function waAddItem(id, name, price, qty){
  qty = qty || 1;
  const cart = waGetCart();
  const existing = cart.find(function(i){ return i.id === id; });
  if(existing){ existing.qty += qty; }
  else { cart.push({ id: id, name: name, price: price, qty: qty }); }
  waSaveCart(cart);
}

function waRemoveItem(id){
  const cart = waGetCart().filter(function(i){ return i.id !== id; });
  waSaveCart(cart);
}

function waSetQty(id, qty){
  const cart = waGetCart();
  const item = cart.find(function(i){ return i.id === id; });
  if(item){
    item.qty = qty;
    if(item.qty <= 0){ return waRemoveItem(id); }
  }
  waSaveCart(cart);
}

function waUpdateCartCount(){
  const els = document.querySelectorAll('.cart-count');
  const count = waCartCount();
  els.forEach(function(el){ el.textContent = count; });
}

/* ---------- Jump-to-cart animation ---------- */
function waFlyToCart(startEl){
  const cartBtn = document.querySelector('[data-cart-icon]');
  if(!startEl || !cartBtn) return;
  const startRect = startEl.getBoundingClientRect();
  const endRect = cartBtn.getBoundingClientRect();
  const flyer = document.createElement('span');
  flyer.className = 'fly-dot';
  document.body.appendChild(flyer);

  const startX = startRect.left + startRect.width / 2;
  const startY = startRect.top + startRect.height / 2;
  const endX = endRect.left + endRect.width / 2;
  const endY = endRect.top + endRect.height / 2;

  flyer.style.left = startX + 'px';
  flyer.style.top = startY + 'px';

  requestAnimationFrame(function(){
    flyer.style.transform = 'translate(' + (endX - startX) + 'px, ' + (endY - startY) + 'px) scale(0.2)';
    flyer.style.opacity = '0';
  });
  setTimeout(function(){ flyer.remove(); }, 700);

  setTimeout(function(){
    cartBtn.classList.add('cart-bounce');
    waSpawnJumpBadge(cartBtn);
    setTimeout(function(){ cartBtn.classList.remove('cart-bounce'); }, 420);
  }, 560);
}

function waSpawnJumpBadge(cartBtn){
  const rect = cartBtn.getBoundingClientRect();
  const badge = document.createElement('span');
  badge.className = 'jump-badge';
  badge.textContent = '+1';
  badge.style.left = (rect.left + rect.width / 2) + 'px';
  badge.style.top = (rect.top - 6) + 'px';
  document.body.appendChild(badge);
  setTimeout(function(){ badge.remove(); }, 1050);
}

/* ---------- Toast ---------- */
let waToastTimer;
function waShowToast(msg){
  let toastEl = document.getElementById('waToast');
  if(!toastEl){
    toastEl = document.createElement('div');
    toastEl.id = 'waToast';
    toastEl.className = 'toast';
    toastEl.setAttribute('role','status');
    toastEl.setAttribute('aria-live','polite');
    document.body.appendChild(toastEl);
  }
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(waToastTimer);
  waToastTimer = setTimeout(function(){ toastEl.classList.remove('show'); }, 2600);
}

/* ---------- Public add-to-cart / buy-now handlers used by product buttons ---------- */
function addToCart(id, name, price, btnEl){
  waAddItem(id, name, price, 1);
  if(btnEl){ waFlyToCart(btnEl); }
  waShowToast(name + ' added to cart — ' + waFormatRs(price));
  if(btnEl){
    const original = btnEl.textContent;
    btnEl.textContent = 'Added ✓';
    btnEl.classList.add('added');
    setTimeout(function(){ btnEl.textContent = original; btnEl.classList.remove('added'); }, 1600);
  }
}

function buyNow(id, name, price){
  waAddItem(id, name, price, 1);
  window.location.href = 'checkout.html';
}

document.addEventListener('DOMContentLoaded', waUpdateCartCount);
