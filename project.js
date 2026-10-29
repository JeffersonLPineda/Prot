/* ===== VIDEO: paste your YouTube link here (watch, youtu.be or embed links all work) ===== */
const VIDEO_URL = 'https://youtu.be/SjKiH33o5Dc';

document.addEventListener('DOMContentLoaded', () => {
  /* 1. YouTube player (loads only when clicked) */
  const box = $('#video');
  const vid = (VIDEO_URL.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})(?![\w-])/) || [])[1];
  box.innerHTML = `<button class="poster ${vid ? 'thumb-bg' : ''}" ${vid ? `style="background-image:url(https://i.ytimg.com/vi/${vid}/hqdefault.jpg)"` : ''} aria-label="Play video">
    <div><span class="play"></span><strong>Watch the project presentation</strong>${vid ? '' : '<small>Placeholder · set your YouTube link in js/project.js</small>'}</div></button>`;
  box.firstElementChild.onclick = () => {
    if (!vid) return toast('Replace VIDEO_URL in js/project.js with your YouTube link');
    box.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${vid}?autoplay=1&rel=0" title="Project presentation video" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
  };

  /* 2. Rings that fill and count up when scrolled into view */
  const rings = document.querySelectorAll('.ring');
  const fill = r => {
    const v = +r.dataset.v, fg = $('.fg', r), n = $('b', r);
    fg.style.strokeDashoffset = 326.7 * (1 - v / 100);
    let t0; const step = t => { t0 = t0 || t; const k = Math.min((t - t0) / 1400, 1); n.textContent = Math.round(v * (1 - Math.pow(1 - k, 3))) + '%'; if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  };
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { fill(e.target); io.unobserve(e.target); } }), { threshold: .4 });
    rings.forEach(r => io.observe(r));
  } else rings.forEach(fill);

  /* 3. Target market segments */
  const SEG = [
    { n: 'Accounting and legal offices', h: 'Financial records and confidential client files.', p: ['s1', 'd1'] },
    { n: 'Private clinics', h: 'Sensitive patient and employee information.', p: ['d2', 's3'] },
    { n: 'E-commerce businesses', h: 'Customer, order and payment-related data.', p: ['s2', 's4'] },
    { n: 'Logistics companies', h: 'Operational data shared across teams, sites and vehicles.', p: ['d3', 'd1'] },
    { n: 'IT service providers', h: 'Their clients\' systems, credentials and encryption keys.', p: ['s2', 'd4'] }
  ];
  const chips = $('#segChips'), panel = $('#segPanel');
  const showSeg = i => {
    const s = SEG[i];
    chips.querySelectorAll('.chip').forEach((c, j) => c.classList.toggle('on', j === i));
    panel.innerHTML = `<h3>${s.n}</h3><dl><div><dt>What they handle</dt><dd>${s.h}</dd></div><div><dt>Suggested from the store</dt><dd>Try these in the cart:</dd></div></dl>
      <div class="mini-prods">${s.p.map(id => { const p = PRODUCTS.find(x => x.id === id); return `<div class="mp"><div class="pic">${artFor(p)}</div><div class="b"><strong>${p.name}</strong><span>${money(p.price)} <small>${p.unit}</small></span><button class="btn btn-primary btn-sm" data-add="${p.id}">Add to cart</button></div></div>`; }).join('')}</div>`;
  };
  chips.innerHTML = SEG.map((s, i) => `<button class="chip" style="text-align:left;border-radius:12px;padding:14px 18px" data-i="${i}">${s.n}</button>`).join('');
  chips.onclick = e => { const c = e.target.closest('[data-i]'); if (c) showSeg(+c.dataset.i); };
  showSeg(0);

  /* 4. Competitor matrix: columns = software, hardware, key management, broad security services */
  const COLS = ['Encryption software', 'Secure hardware', 'Key management', 'Broad security services'];
  const COMP = [
    { n: 'SISAP', w: 'Local · Guatemala', c: [0, 0, 0, 1], d: 'Offers a broad range of cybersecurity services in Guatemala, including managed security, cloud security, Zero Trust and data-loss prevention. Its portfolio is wider than encryption alone, so it competes mainly for cybersecurity budgets.', u: 'https://es.sisap.com/guatemala/' },
    { n: 'Entrust', w: 'International', c: [0, 1, 1, 0], d: 'Offers hardware security modules (HSMs) that protect cryptographic keys.', u: 'https://www.entrust.com/products/hsm' },
    { n: 'Fortanix', w: 'International', c: [1, 0, 1, 0], d: 'Provides data encryption and key-management products through its Data Security Manager platform.', u: 'https://www.fortanix.com/platform/data-security-manager' },
    { n: 'Kingston IronKey', w: 'International', c: [0, 1, 0, 0], d: 'Sells hardware-encrypted storage devices, including encrypted USB flash drives.', u: 'https://www.kingston.com/en/usb-flash-drives/encrypted' },
    { n: 'prot', w: 'Our offer', c: [1, 1, 1, 0], d: 'Encryption software, secure storage hardware, key management and setup/support services, with accessible options and local guidance in Spanish for SMEs.', u: 'tienda.html' }
  ];
  const mx = $('#matrix');
  mx.innerHTML = `<div class="mrow head"><span>Company</span>${COLS.map(c => `<span class="c">${c}</span>`).join('')}</div>` +
    COMP.map((x, i) => `<button class="mrow" data-c="${i}"><span><strong>${x.n}</strong><small>${x.w}</small></span>${x.c.map(v => `<span class="c"><i class="dot ${v ? '' : 'no'}" aria-label="${v ? 'Yes' : 'No'}"></i></span>`).join('')}</button>`).join('');
  const showC = i => {
    const x = COMP[i];
    mx.querySelectorAll('.mrow:not(.head)').forEach((r, j) => r.classList.toggle('on', j === i));
    $('#cdetail').innerHTML = `<div><span class="tagl">${x.w}</span><h3>${x.n}</h3><p>${x.d}</p></div><a class="btn btn-light btn-sm" href="${x.u}" ${x.u.startsWith('http') ? 'target="_blank" rel="noopener"' : ''}>${x.u.startsWith('http') ? 'Visit source' : 'See our products'}</a>`;
  };
  mx.onclick = e => { const r = e.target.closest('[data-c]'); if (r) showC(+r.dataset.c); };
  showC(0);
});
