/* ===== SETTINGS (edit your company details here) ===== */
const CONFIG = { name: '', tax: 0.12, taxLabel: 'Tax (12%)', currency: 'USD', email: 'hello@prot.com' };

/* ===== SIMULATED CATALOG (replace with your API/database later) ===== */
const PRODUCTS = [
  { id: 's1', type: 'service', name: 'Cloud file encryption', desc: 'End-to-end encryption for your team\'s files.', specs: ['AES-256-GCM', 'Apps for Windows, Mac and Linux', 'Version recovery'], price: 29, unit: '/user per month', tag: 'Subscription' },
  { id: 's2', type: 'service', name: 'Key management (KMS)', desc: 'Create, rotate and revoke encryption keys from a single dashboard.', specs: ['Automatic rotation', 'Access logs', 'API and web dashboard'], price: 79, unit: '/month', tag: 'Subscription' },
  { id: 's3', type: 'service', name: 'Corporate email encryption', desc: 'Protect messages and attachments without changing your email client.', specs: ['Works with Outlook and Gmail', 'Attachments up to 50 MB', 'Expiring messages'], price: 19, unit: '/mailbox per month', tag: 'Subscription' },
  { id: 's4', type: 'service', name: 'Security audit', desc: 'Technical review of your encryption, with a report and improvement plan.', specs: ['Report within 10 days', 'Prioritized action plan', 'Results walkthrough session'], price: 450, unit: 'one-time payment', tag: 'Service' },
  { id: 'd1', type: 'device', name: 'Prot Key USB', desc: 'Hardware-encrypted USB key to carry your files safely.', specs: ['128 GB · USB-C and USB-A', 'Wipes after 10 failed attempts', 'Water resistant'], price: 89, unit: 'per unit', tag: 'Device' },
  { id: 'd2', type: 'device', name: 'Prot Vault SSD', desc: 'Portable drive unlocked with a physical PIN, no software needed.', specs: ['1 TB · up to 1000 MB/s', 'Built-in numeric keypad', 'Works on any computer'], price: 189, unit: 'per unit', tag: 'Device' },
  { id: 'd3', type: 'device', name: 'Prot Shield', desc: 'Router with built-in VPN that encrypts all your network traffic.', specs: ['Wi-Fi 6 · 5 antennas', 'WireGuard VPN included', 'Automatic updates'], price: 249, unit: 'per unit', tag: 'Device' },
  { id: 'd4', type: 'device', name: 'Prot HSM', desc: 'Hardware security module to store keys on your servers.', specs: ['1U rack mount', 'FIPS 140-2 certified (example)', 'Smart card access'], price: 1290, unit: 'per unit', tag: 'Device' }
];

const $ = (s, el = document) => el.querySelector(s);
const money = n => new Intl.NumberFormat('en-US', { style: 'currency', currency: CONFIG.currency }).format(n);
const artFor = p => p.img ? `<img src="${p.img}" alt="${p.name}" loading="lazy">` : (window.ART && ART[p.id]) || '';

/* ===== CART (stored in the browser; no server) ===== */
let cart = [];
try { cart = JSON.parse(localStorage.getItem('prot_cart')) || []; } catch (e) { cart = []; }
const save = () => { try { localStorage.setItem('prot_cart', JSON.stringify(cart)); } catch (e) {} };
const count = () => cart.reduce((a, i) => a + i.qty, 0);

function add(id, n = 1, quiet) {
  const it = cart.find(i => i.id === id);
  it ? it.qty += n : cart.push({ id, qty: n });
  save(); renderCart(); if (!quiet) toast('Added to cart');
}
function setQty(id, d) {
  const it = cart.find(i => i.id === id); if (!it) return;
  it.qty += d; if (it.qty <= 0) cart = cart.filter(i => i.id !== id);
  save(); renderCart();
}
function remove(id) { cart = cart.filter(i => i.id !== id); save(); renderCart(); }

/* ===== VIEWS ===== */
function cardHTML(p) {
  return `<article class="card"><div class="thumb">${artFor(p)}</div><div class="body">
    <span class="tag">${p.tag}</span><h3>${p.name}</h3><p>${p.desc}</p><ul class="specs">${p.specs.map(x => `<li>${x}</li>`).join('')}</ul>
    <div class="price"><b>${money(p.price)}</b><span>${p.unit}</span></div>
    <button class="btn btn-primary btn-sm" data-add="${p.id}">Add to cart</button></div></article>`;
}

function renderCart() {
  $('#cartN').textContent = count();
  const box = $('#items');
  if (!cart.length) {
    box.innerHTML = '<p class="empty" style="padding:48px 0">Your cart is empty.<br>Browse the store and add services or devices.</p>';
  } else {
    box.innerHTML = cart.map(i => {
      const p = PRODUCTS.find(x => x.id === i.id);
      return `<div class="item"><div class="mini">${artFor(p)}</div><div><strong>${p.name}</strong><br><small>${money(p.price)} ${p.unit}</small>
        <div class="qty"><button data-q="${p.id}:-1" aria-label="Remove one">−</button><span>${i.qty}</span><button data-q="${p.id}:1" aria-label="Add one">+</button><button class="rm" data-rm="${p.id}">Remove</button></div></div>
        <strong>${money(p.price * i.qty)}</strong></div>`;
    }).join('');
  }
  const sub = cart.reduce((a, i) => a + PRODUCTS.find(x => x.id === i.id).price * i.qty, 0);
  const tax = sub * CONFIG.tax;
  $('#totals').innerHTML = `<div class="tot"><span>Subtotal</span><span>${money(sub)}</span></div>
    <div class="tot"><span>${CONFIG.taxLabel}</span><span>${money(tax)}</span></div>
    <div class="tot big"><span>Total</span><span>${money(sub + tax)}</span></div>`;
  $('#checkout').disabled = !cart.length;
  $('#checkout').style.opacity = cart.length ? 1 : .5;
}

function layout() {
  const page = document.body.dataset.page;
  const link = (h, t, k) => `<a href="${h}" class="${page === k ? 'on' : ''}">${t}</a>`;
  $('#hdr').outerHTML = `<header class="hdr"><div class="wrap">
    <a class="brand" href="index.html"><img src="icon.svg" alt="">${CONFIG.name}</a>
    <nav class="nav" id="nav">${link('tienda.html', 'Store', 'tienda')}${link('tienda.html?f=service', 'Services', 'x')}${link('tienda.html?f=device', 'Devices', 'y')}${link('index.html#calculator', 'Calculator', 'x')}${link('index.html#how', 'How it works', 'x')}${link('index.html#faq', 'FAQ', 'x')}${link('project.html', 'Project', 'project')}</nav>
    <div class="hdr-actions"><a class="btn btn-ghost btn-sm hide-s" href="tienda.html">Shop now</a>
    <button class="btn btn-primary btn-sm cart-btn" id="openCart">Cart <span class="n" id="cartN">0</span></button>
    <button class="burger" id="burger" aria-label="Menu">☰</button></div></div></header>`;
  $('#ftr').outerHTML = `<footer class="ftr" id="contact"><div class="wrap"><div class="cols">
    <div><a class="brand" href="index.html"><img src="aicon.svg" alt="">${CONFIG.name}</a><p>Encryption that protects what matters.<br>${CONFIG.email}</p></div>
    <div><h4>Products</h4><ul><li><a href="tienda.html?f=service">Encryption services</a></li><li><a href="tienda.html?f=device">Devices</a></li></ul></div>
    <div><h4>Company</h4><ul><li><a href="project.html">Project overview</a></li><li><a href="#">About us</a></li><li><a href="#">Blog</a></li><li><a href="#">Careers</a></li></ul></div>
    <div><h4>Help</h4><ul><li><a href="#">Support</a></li><li><a href="#">Documentation</a></li><li><a href="#">Privacy</a></li></ul></div></div>
    <div class="copy"><span>© ${new Date().getFullYear()} ${CONFIG.name}. All rights reserved.</span><span>Demo site: purchases are simulated.</span></div></div></footer>
    <div class="ov" id="ov"></div>
    <aside class="drawer" id="drawer" aria-label="Shopping cart"><header><h3>Your cart</h3><button class="x" id="closeCart" aria-label="Close">×</button></header>
      <div class="items" id="items"></div><footer><div id="totals"></div><button class="btn btn-primary" id="checkout">Checkout</button></footer></aside>
    <div class="modal" id="modal"><div class="mbox" id="mbox"></div></div><div class="toast" id="toast" role="status"></div>`;
}

let tt; function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('on'), 1800); }
const drawer = on => { $('#drawer').classList.toggle('on', on); $('#ov').classList.toggle('on', on); };

function checkoutForm() {
  drawer(false);
  $('#mbox').innerHTML = `<h3>Order details</h3>
    <form id="form"><label>Full name<input class="field" name="n" required></label>
    <label>Email address<input class="field" name="e" type="email" required></label>
    <label>Company (optional)<input class="field" name="c"></label>
    <p class="sim">Simulation: no payment is processed and no information is stored.</p>
    <button class="btn btn-primary" type="submit">Confirm order</button>
    <button class="btn btn-ghost" type="button" id="cancel">Cancel</button></form>`;
  $('#modal').classList.add('on');
  $('#cancel').onclick = () => $('#modal').classList.remove('on');
  $('#form').onsubmit = e => {
    e.preventDefault();
    const order = 'PROT-' + Math.random().toString(36).slice(2, 8).toUpperCase();
    cart = []; save(); renderCart();
    $('#mbox').innerHTML = `<div class="ok"><div class="ico"><svg viewBox="0 0 24 24"><path d="M5 12l5 5 9-10"/></svg></div>
      <h3>Order received!</h3><p style="color:var(--muted);margin:8px 0 22px">Order number <strong>${order}</strong>.<br>We\'ll email you the details (simulated).</p>
      <button class="btn btn-primary" id="done">Keep shopping</button></div>`;
    $('#done').onclick = () => $('#modal').classList.remove('on');
  };
}

function shop() {
  const grid = $('#grid'); if (!grid) return;
  let f = new URLSearchParams(location.search).get('f') || 'all', q = '', s = 'rel';
  const draw = () => {
    let list = PRODUCTS.filter(p => (f === 'all' || p.type === f) && (p.name + p.desc).toLowerCase().includes(q));
    if (s === 'asc') list.sort((a, b) => a.price - b.price); if (s === 'desc') list.sort((a, b) => b.price - a.price);
    grid.innerHTML = list.length ? list.map(cardHTML).join('') : '<p class="empty">No results found. Try a different search.</p>';
    document.querySelectorAll('.chip').forEach(c => c.classList.toggle('on', c.dataset.f === f));
  };
  document.querySelectorAll('.chip').forEach(c => c.onclick = () => { f = c.dataset.f; draw(); });
  $('#q').oninput = e => { q = e.target.value.toLowerCase(); draw(); };
  $('#sort').onchange = e => { s = e.target.value; draw(); };
  draw();
}

document.addEventListener('DOMContentLoaded', () => {
  layout();
  const feat = $('#featured'); if (feat) feat.innerHTML = [PRODUCTS[0], PRODUCTS[1], PRODUCTS[4], PRODUCTS[5]].map(cardHTML).join('');
  shop(); renderCart();
  $('#openCart').onclick = () => drawer(true);
  $('#closeCart').onclick = $('#ov').onclick = () => drawer(false);
  $('#checkout').onclick = checkoutForm;
  $('#burger').onclick = () => $('#nav').classList.toggle('on');
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { drawer(false); $('#modal').classList.remove('on'); } });
  document.body.addEventListener('click', e => {
    const a = e.target.closest('[data-add]'), q = e.target.closest('[data-q]'), r = e.target.closest('[data-rm]');
    if (a) add(a.dataset.add);
    if (q) { const [id, d] = q.dataset.q.split(':'); setQty(id, +d); }
    if (r) remove(r.dataset.rm);
  });
});
