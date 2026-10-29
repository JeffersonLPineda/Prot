/* Home page interactions: animated headline, real encryption demo, tabs and plan calculator */
document.addEventListener('DOMContentLoaded', () => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 1. Headline that resolves from scrambled characters into readable text */
  const h = $('#scr');
  if (h && !reduce) {
    const final = h.textContent, chars = '█▓▒░#%&@01<>/\\|';
    let f = 0;
    const t = setInterval(() => {
      h.textContent = [...final].map((c, i) => c === ' ' || i < f / 1.5 ? c : chars[Math.floor(Math.random() * chars.length)]).join('');
      if (++f > final.length * 1.5) { h.textContent = final; clearInterval(t); }
    }, 32);
  }

  /* 2. Demo: real AES-256-GCM encryption with WebCrypto */
  const out = $('#out');
  if (out) {
    const enc = new TextEncoder(), dec = new TextDecoder();
    const hex = u => [...u].map(b => b.toString(16).padStart(2, '0')).join('');
    const b64 = u => btoa(String.fromCharCode(...u));
    let K, rawKey, iv, ct, tampered = false;
    const status = (m, ok) => { const s = $('#st'); s.textContent = m; s.className = ok === undefined ? '' : ok ? 'ok' : 'bad'; };
    const show = () => {
      out.innerHTML = `<span class="d">algorithm </span><span class="w">AES-256-GCM</span>\n<span class="d">key       </span>${hex(rawKey).slice(0, 24)}…\n<span class="d">iv        </span>${hex(iv)}\n<span class="d">result    </span><span class="${tampered ? 'bad' : 'g'}">${b64(ct)}</span>`;
    };
    const newKey = async () => {
      K = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
      rawKey = new Uint8Array(await crypto.subtle.exportKey('raw', K));
    };
    const run = async () => {
      iv = crypto.getRandomValues(new Uint8Array(12));
      ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, K, enc.encode($('#msg').value || ' ')));
      tampered = false; status(''); show();
    };
    if (!(window.crypto && crypto.subtle)) {
      out.textContent = 'The demo needs https:// or localhost to use the browser\'s built-in encryption.';
    } else {
      newKey().then(run);
      $('#msg').oninput = run;
      $('#new').onclick = async () => { await newKey(); run(); status('New key generated: the previous text can no longer be opened with it.'); };
      $('#tam').onclick = () => { ct[0] ^= 1; tampered = true; show(); status('1 bit of the encrypted message was changed. Try decrypting it.'); };
      $('#dec').onclick = async () => {
        try { const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, K, ct); status('✔ Decrypted: ' + dec.decode(pt), true); }
        catch (e) { status('✘ Authentication failed: the message was tampered with and is rejected.', false); }
      };
    }
  }

  /* 3. "Where is your data at risk?" tabs */
  document.querySelectorAll('[data-pair]').forEach(el => el.innerHTML = el.dataset.pair.split(',').map(id => `<div class="pic">${ART[id]}</div>`).join(''));
  document.querySelectorAll('.tab').forEach(b => b.onclick = () => {
    document.querySelectorAll('.tab').forEach(x => { x.classList.toggle('on', x === b); x.setAttribute('aria-selected', x === b); });
    document.querySelectorAll('.tp').forEach(p => p.hidden = p.id !== b.dataset.t);
  });

  /* 4. Plan calculator */
  const calc = $('#calc');
  if (calc) {
    const price = id => PRODUCTS.find(p => p.id === id).price;
    const lines = () => {
      const u = +$('#u').value, l = [{ id: 's1', n: u }];
      if ($('#o2').checked) l.push({ id: 's2', n: 1 });
      if ($('#o3').checked) l.push({ id: 's3', n: u });
      if ($('#o5').checked) l.push({ id: 'd1', n: u });
      if ($('#o4').checked) l.push({ id: 's4', n: 1 });
      return l;
    };
    const draw = () => {
      $('#uN').textContent = $('#u').value;
      const l = lines(), mo = l.filter(x => x.id[0] === 's' && x.id !== 's4').reduce((a, x) => a + price(x.id) * x.n, 0);
      const once = l.filter(x => x.id === 's4' || x.id[0] === 'd').reduce((a, x) => a + price(x.id) * x.n, 0);
      $('#cOut').innerHTML = `<div class="big">${money(mo)}<small> /mo</small></div><div class="once">${once ? '+ ' + money(once) + ' one-time payment' : 'No one-time payments'}</div>
        <ul>${l.map(x => `<li><span>${PRODUCTS.find(p => p.id === x.id).name}</span><b>×${x.n}</b></li>`).join('')}</ul>`;
    };
    calc.addEventListener('input', draw);
    $('#cAdd').onclick = () => { lines().forEach(x => add(x.id, x.n, true)); toast('Plan added to cart'); $('#openCart').click(); };
    draw();
  }
});
