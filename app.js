/* ================= Darul Arqam · Mini App ================= */
(() => {
  'use strict';

  const tg = window.Telegram && window.Telegram.WebApp;
  const inTG = !!(tg && tg.initData);
  const CFG = window.APP_CONFIG || { courses: [] };
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const haptic = (t) => { try { tg && tg.HapticFeedback && tg.HapticFeedback.impactOccurred(t || 'light'); } catch (e) {} };
  const PHOTO = 'img/photo.jpg';

  /* ---------- Telegram ---------- */
  if (tg) {
    try {
      tg.ready();
      tg.expand();
      if (tg.setHeaderColor) tg.setHeaderColor('#F6EFE6');
      if (tg.setBackgroundColor) tg.setBackgroundColor('#F6EFE6');
      if (tg.setBottomBarColor) tg.setBottomBarColor('#FBF7F1');
      if (tg.disableVerticalSwipes) tg.disableVerticalSwipes();
      tg.BackButton.onClick(back);
    } catch (e) {}
  }
  const user = (inTG && tg.initDataUnsafe && tg.initDataUnsafe.user) || null;

  /* ---------- хранилище (облако Telegram или браузер) ---------- */
  const cloudOK = inTG && tg.CloudStorage && tg.isVersionAtLeast && tg.isVersionAtLeast('6.9');
  const store = {
    get(key) {
      return new Promise((res) => {
        if (cloudOK) tg.CloudStorage.getItem(key, (err, val) => res(err ? null : val));
        else { try { res(localStorage.getItem(key)); } catch (e) { res(null); } }
      });
    },
    set(key, val) {
      return new Promise((res) => {
        if (cloudOK) tg.CloudStorage.setItem(key, val, () => res());
        else { try { localStorage.setItem(key, val); } catch (e) {} res(); }
      });
    },
    async getJSON(key, def) { try { const v = await this.get(key); return v ? JSON.parse(v) : def; } catch (e) { return def; } },
    setJSON(key, val) { return this.set(key, JSON.stringify(val)); }
  };

  /* ---------- иконки ---------- */
  const P = (d, w) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w || 1.6}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const ICON = {
    arrow: P('<path d="M5 12h14M13 6l6 6-6 6"/>', 1.8),
    back: P('<path d="M15 5l-7 7 7 7"/>', 1.8),
    chev: P('<path d="M9 5l7 7-7 7"/>', 1.8),
    home: P('<path d="M4 11l8-7 8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z"/>'),
    book: P('<path d="M5 4h10a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h10"/>'),
    pen: P('<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>'),
    user: P('<circle cx="12" cy="8" r="4"/><path d="M4 20c1.5-4 4.5-6 8-6s6.5 2 8 6"/>'),
    search: P('<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/>'),
    phone: P('<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z"/>'),
    send: P('<path d="M21 3L10 14M21 3l-7 18-4-7-7-4z"/>'),
    mega: P('<path d="M4 10v4h3l6 4V6L7 10z"/><path d="M16.5 9a4 4 0 0 1 0 6M19 6.5a8 8 0 0 1 0 11"/>'),
    plus: P('<path d="M12 5v14M5 12h14"/>', 2),
    close: P('<path d="M6 6l12 12M18 6L6 18"/>', 2),
    check: '<svg viewBox="0 0 28 20" aria-hidden="true"><path d="M2 10 L10 17 L26 3" stroke="#6E5A8E" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  };

  /* ---------- стикеры ---------- */
  const STAR = 'M0 -12 C0 -4 4 0 12 0 C4 0 0 4 0 12 C0 4 -4 0 -12 0 C-4 0 0 -4 0 -12Z';
  const SH = 'style="filter:drop-shadow(0 3px 4px rgba(59,42,32,.18))"';
  const petals = (cy, rx, ry, cx) => [0, 72, 144, 216, 288].map((r) => `<ellipse cx="${cx || 60}" cy="${cy}" rx="${rx}" ry="${ry}" transform="rotate(${r} 60 60)"/>`).join('');
  let stampN = 0;
  function sticker(kind, color) {
    switch (kind) {
      case 'bismillah': return `<svg viewBox="0 0 170 70" ${SH} role="img" aria-label="Бисмиллях"><rect x="3" y="3" width="164" height="64" rx="32" fill="#fff"/><rect x="8" y="8" width="154" height="54" rx="27" fill="#D9CCEB"/><rect x="13" y="13" width="144" height="44" rx="22" fill="none" stroke="#6E5A8E" stroke-dasharray="3 4"/><text x="85" y="44" text-anchor="middle" font-family="Amiri, serif" font-size="24" font-weight="700" fill="#4E3F69">بِسْمِ اللَّهِ</text></svg>`;
      case 'plumeria': return `<svg viewBox="0 0 120 120" ${SH} aria-hidden="true"><g fill="#fff" stroke="#fff" stroke-width="10" stroke-linejoin="round">${petals(33, 18, 27)}</g><g fill="#F2BBC9">${petals(33, 18, 27)}</g><g fill="#F8DCE3">${petals(30, 8, 17, 57)}</g><circle cx="60" cy="60" r="11" fill="#F5D27A"/><circle cx="60" cy="60" r="5" fill="#E8B04F"/></svg>`;
      case 'sparkle': return `<svg viewBox="0 0 120 120" ${SH} aria-hidden="true"><path transform="translate(54 64) scale(3.6)" d="${STAR}" fill="#fff" stroke="#fff" stroke-width="2.2" stroke-linejoin="round"/><path transform="translate(54 64) scale(3.6)" d="${STAR}" fill="#C9A46A"/><path transform="translate(54 64) scale(1.6)" d="${STAR}" fill="#E6CB93"/><path transform="translate(100 22) scale(1.3)" d="${STAR}" fill="#B9A5D9" stroke="#fff" stroke-width="3" paint-order="stroke"/></svg>`;
      case 'heart': return `<svg viewBox="0 0 120 110" ${SH} role="img" aria-label="Сердце"><path d="M60 100 C20 74 6 52 10 34 C14 16 34 8 48 16 C54 20 58 26 60 30 C62 26 66 20 72 16 C86 8 106 16 110 34 C114 52 100 74 60 100Z" fill="#fff" stroke="#fff" stroke-width="10" stroke-linejoin="round"/><path d="M60 100 C20 74 6 52 10 34 C14 16 34 8 48 16 C54 20 58 26 60 30 C62 26 66 20 72 16 C86 8 106 16 110 34 C114 52 100 74 60 100Z" fill="#B9A5D9"/><path d="M28 30 C30 24 36 20 42 21" stroke="#E6DDF2" stroke-width="4" fill="none" stroke-linecap="round"/><text x="60" y="64" text-anchor="middle" font-family="Amiri, serif" font-size="28" font-weight="700" fill="#fff">حُبٌّ</text></svg>`;
      case 'lantern': return `<svg viewBox="0 0 100 140" ${SH} aria-hidden="true"><g fill="#fff" stroke="#fff" stroke-width="9" stroke-linejoin="round"><circle cx="50" cy="12" r="7"/><path d="M28 40 L50 18 L72 40Z"/><rect x="28" y="40" width="44" height="64" rx="6"/><rect x="24" y="104" width="52" height="12" rx="4"/></g><circle cx="50" cy="12" r="6" fill="none" stroke="#8A6A44" stroke-width="2.5"/><path d="M28 40 L50 18 L72 40Z" fill="#8A6A44"/><rect x="28" y="40" width="44" height="64" rx="6" fill="#B8955E"/><rect x="35" y="47" width="30" height="50" rx="15" fill="#F6D58E"/><ellipse cx="50" cy="80" rx="5" ry="10" fill="#F2A65A"/><ellipse cx="50" cy="83" rx="2.5" ry="5" fill="#FFF3D6"/><path d="M50 47 V97 M35 72 H65" stroke="#B8955E" stroke-width="1.5"/><rect x="24" y="104" width="52" height="12" rx="4" fill="#8A6A44"/></svg>`;
      case 'bow': return `<svg viewBox="0 0 140 104" ${SH} aria-hidden="true"><g fill="#fff" stroke="#fff" stroke-width="10" stroke-linejoin="round"><path d="M70 46 C40 14 10 22 14 46 C18 70 44 70 70 52Z"/><path d="M70 46 C100 14 130 22 126 46 C122 70 96 70 70 52Z"/><path d="M64 54 L46 96 L58 90 L66 98 L70 56Z"/><path d="M76 54 L94 96 L82 90 L74 98 L70 56Z"/></g><path d="M64 54 L46 96 L58 90 L66 98 L70 56Z" fill="#D99AAB"/><path d="M76 54 L94 96 L82 90 L74 98 L70 56Z" fill="#D99AAB"/><path d="M70 46 C40 14 10 22 14 46 C18 70 44 70 70 52Z" fill="#EBB9C4"/><path d="M70 46 C100 14 130 22 126 46 C122 70 96 70 70 52Z" fill="#EBB9C4"/><path d="M62 46 C46 32 30 30 26 42" stroke="#D99AAB" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M78 46 C94 32 110 30 114 42" stroke="#D99AAB" stroke-width="2.5" fill="none" stroke-linecap="round"/><ellipse cx="70" cy="50" rx="10" ry="11" fill="#D99AAB"/></svg>`;
      case 'tag': return `<svg viewBox="0 0 180 84" style="filter:drop-shadow(0 3px 4px rgba(59,42,32,.16))" role="img" aria-label="Мой арабский дневник"><path d="M26 42 C14 30 6 20 2 8" stroke="#A87C55" stroke-width="1.5" fill="none"/><path d="M32 12 H170 a6 6 0 0 1 6 6 V66 a6 6 0 0 1 -6 6 H32 L10 42Z" fill="#F1E7DA" stroke="#C9AE8F" stroke-width="1.2"/><circle cx="28" cy="42" r="4.5" fill="#fff" stroke="#C9AE8F"/><text x="104" y="39" text-anchor="middle" font-family="Caveat, cursive" font-size="23" font-weight="700" fill="#6B4A33">мой арабский</text><text x="104" y="62" text-anchor="middle" font-family="Caveat, cursive" font-size="23" font-weight="700" fill="#6E5A8E">дневник</text></svg>`;
      case 'stamp': { const id = 'ring' + (++stampN); return `<div style="position:relative;width:100%;height:100%;transform:rotate(-8deg)"><svg viewBox="0 0 120 120" ${SH} style="position:absolute;inset:0;filter:drop-shadow(0 3px 4px rgba(59,42,32,.18))" aria-hidden="true"><defs><path id="${id}" d="M60 60 m-41 0 a41 41 0 1 1 82 0 a41 41 0 1 1 -82 0"/></defs><circle cx="60" cy="60" r="58" fill="#fff"/><circle cx="60" cy="60" r="54" fill="#F6EFE6" stroke="#6B4A33" stroke-width="1.5"/><circle cx="60" cy="60" r="31" fill="none" stroke="#C9AE8F" stroke-dasharray="2 3"/><text font-family="Manrope, sans-serif" font-size="8.6" font-weight="700" letter-spacing="2.2" fill="#6B4A33"><textPath href="#${id}">DARUL ARQAM · ONLINE ARABIC SCHOOL ·</textPath></text></svg><img src="img/mark.png" alt="" style="position:absolute;left:39%;top:33%;width:22%"></div>`; }
      case 'mashallah': return `<svg viewBox="0 0 160 100" ${SH} role="img" aria-label="Ма шаа Аллаh"><path d="M20 10 H140 a14 14 0 0 1 14 14 V62 a14 14 0 0 1 -14 14 H62 L40 94 L45 76 H20 a14 14 0 0 1 -14 -14 V24 a14 14 0 0 1 14 -14Z" fill="#fff" stroke="#fff" stroke-width="9" stroke-linejoin="round"/><path d="M20 10 H140 a14 14 0 0 1 14 14 V62 a14 14 0 0 1 -14 14 H62 L40 94 L45 76 H20 a14 14 0 0 1 -14 -14 V24 a14 14 0 0 1 14 -14Z" fill="#3B2A20"/><text x="80" y="53" text-anchor="middle" font-family="Amiri, serif" font-size="25" font-weight="700" fill="#F6EFE6">مَا شَاءَ اللَّهُ</text><path transform="translate(140 16) scale(.55)" d="${STAR}" fill="#C9A46A"/></svg>`;
      case 'moon': return `<svg viewBox="0 0 120 120" ${SH} aria-hidden="true"><path d="M76 14 A46 46 0 1 0 106 84 A38 38 0 1 1 76 14Z" fill="#fff" stroke="#fff" stroke-width="10" stroke-linejoin="round"/><path d="M76 14 A46 46 0 1 0 106 84 A38 38 0 1 1 76 14Z" fill="#C9A46A"/><path d="M60 26 A36 36 0 0 0 40 90" stroke="#E6CB93" stroke-width="4" fill="none" stroke-linecap="round"/><path transform="translate(88 46) scale(1.1)" d="${STAR}" fill="#B9A5D9" stroke="#fff" stroke-width="3" paint-order="stroke"/></svg>`;
      case 'tape': return `<svg viewBox="0 0 140 40" preserveAspectRatio="none" style="opacity:.88" aria-hidden="true"><path d="M4 4 L136 4 L132 12 L136 20 L132 28 L136 36 L4 36 L8 28 L4 20 L8 12Z" fill="${color || '#CDBFE3'}"/><g fill="#fff" opacity=".55"><circle cx="20" cy="14" r="2"/><circle cx="36" cy="26" r="2"/><circle cx="52" cy="14" r="2"/><circle cx="68" cy="26" r="2"/><circle cx="84" cy="14" r="2"/><circle cx="100" cy="26" r="2"/><circle cx="116" cy="14" r="2"/></g></svg>`;
      case 'done': return `<svg viewBox="0 0 120 120" ${SH} role="img" aria-label="Готово"><circle cx="60" cy="60" r="54" fill="#fff"/><circle cx="60" cy="60" r="48" fill="#6E5A8E"/><circle cx="60" cy="60" r="41" fill="none" stroke="#B9A5D9" stroke-width="1.2" stroke-dasharray="3 4"/><path d="M40 54 L54 68 L82 40" stroke="#fff" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/><text x="60" y="94" text-anchor="middle" font-family="Caveat, cursive" font-size="20" font-weight="700" fill="#fff">готово</text></svg>`;
      default: return '';
    }
  }

  /* ---------- оживление разметки ---------- */
  function hydrate(root) {
    root = root || document;
    $$('[data-sticker]', root).forEach((el) => { if (!el.dataset.done) { el.innerHTML = sticker(el.dataset.sticker, el.dataset.color); el.dataset.done = '1'; } });
    $$('.ph[data-crop]', root).forEach((el) => { if (!el.querySelector('img')) el.insertAdjacentHTML('afterbegin', `<img src="${PHOTO}" alt="" loading="lazy">`); });
    $$('i[data-icon]', root).forEach((el) => { if (!el.innerHTML) el.innerHTML = ICON[el.dataset.icon] || ''; });
  }

  // коллажи с точными координатами масштабируются под ширину экрана
  function fit() {
    $$('.screen.active .fit').forEach((f) => {
      const w = +f.dataset.w, h = +f.dataset.h, board = f.firstElementChild;
      const avail = f.hasAttribute('data-full') ? Math.min(window.innerWidth, 480) :
        f.parentElement.clientWidth -
        (parseFloat(getComputedStyle(f.parentElement).paddingLeft) || 0) -
        (parseFloat(getComputedStyle(f.parentElement).paddingRight) || 0);
      const s = Math.min(1.12, Math.max(0.6, avail / w));
      board.style.width = w + 'px';
      board.style.height = h + 'px';
      board.style.transform = `scale(${s})`;
      board.style.transformOrigin = 'top left';
      f.style.width = (w * s) + 'px';
      f.style.height = (h * s) + 'px';
    });
  }
  window.addEventListener('resize', fit);

  /* ---------- навигация ---------- */
  const TABS = ['home', 'courses', 'diary', 'profile'];
  let stack = [];
  function show(id, push) {
    $$('.screen').forEach((s) => s.classList.toggle('active', s.id === id));
    if (push !== false) { if (TABS.includes(id) || id === 'success') stack = [id]; else stack.push(id); }
    $('#tabbar').hidden = !TABS.includes(id);
    $$('#tabbar a').forEach((a) => a.classList.toggle('on', a.dataset.go === id));
    window.scrollTo(0, 0);
    fit();
    if (tg && tg.BackButton) { stack.length > 1 ? tg.BackButton.show() : tg.BackButton.hide(); }
    if (id === 'profile') renderRequests();
  }
  function back() {
    if (stack.length > 1) { stack.pop(); show(stack[stack.length - 1], false); }
    else show('home');
  }

  function openLink(url) {
    if (!url) return;
    if (tg && /^https:\/\/t\.me\//.test(url) && tg.openTelegramLink) tg.openTelegramLink(url);
    else if (tg && tg.openLink) tg.openLink(url);
    else window.open(url, '_blank');
  }

  let toastT;
  function toast(text) {
    const t = $('#toast');
    t.textContent = text;
    t.classList.add('show');
    clearTimeout(toastT);
    toastT = setTimeout(() => t.classList.remove('show'), 2400);
  }

  document.addEventListener('click', (e) => {
    const go = e.target.closest('[data-go]');
    if (go) { e.preventDefault(); haptic(); if (go.dataset.go === 'home') rememberSplash(); show(go.dataset.go); return; }
    const bk = e.target.closest('[data-back]');
    if (bk) { e.preventDefault(); haptic(); back(); return; }
    const cr = e.target.closest('[data-course]');
    if (cr) { e.preventDefault(); haptic(); openCourse(cr.dataset.course); return; }
    const ln = e.target.closest('[data-link]');
    if (ln) { e.preventDefault(); haptic(); openLink(CFG[ln.dataset.link]); }
  });

  /* ---------- курсы ---------- */
  const byId = (id) => CFG.courses.find((c) => c.id === id);
  const titleHTML = (c) => {
    const a = c.accent || '';
    if (a && c.title.endsWith(a)) return esc(c.title.slice(0, -a.length)) + '<em>' + esc(a) + '</em>';
    return esc(c.title);
  };
  const metaText = (c) => c.note || `Старт ${c.start} · ${c.schedule}`;

  let tab = 'new', query = '';
  function renderCourses() {
    const q = query.trim().toLowerCase();
    const list = CFG.courses.filter((c) => (q ? true : c.group === tab) && (!q || c.title.toLowerCase().includes(q)));
    $('#course-list').innerHTML = list.map((c) => `
      <a href="#" class="course-card" data-course="${esc(c.id)}">
        <div class="thumb arch ph" data-crop="${esc(c.photo || 'notebook')}"></div>
        <div class="cc-body">
          <span class="cc-title">${esc(c.title)}</span>
          <span class="cc-meta">${esc(metaText(c))}</span>
          <span class="chip lav">${esc(c.level)}</span>
        </div>
        <span class="go-circle"><i data-icon="arrow"></i></span>
        ${c.isNew ? '<span class="new-tag">новинка</span>' : ''}
      </a>`).join('') || '<p class="empty">Ничего не нашлось</p>';
    hydrate($('#course-list'));
  }
  $$('.tab').forEach((b) => b.addEventListener('click', () => {
    haptic('soft');
    tab = b.dataset.tab;
    $$('.tab').forEach((x) => { x.classList.toggle('on', x === b); x.setAttribute('aria-selected', x === b ? 'true' : 'false'); });
    renderCourses();
  }));
  $('#search').addEventListener('input', (e) => { query = e.target.value; renderCourses(); });

  let current = null;
  function openCourse(id) {
    const c = byId(id);
    if (!c) return;
    current = c;
    $('#course-body').innerHTML = `
      <div class="cd-hero">
        <div class="cd-photo"><div class="ph" data-crop="${esc(c.photo || 'notebook')}"></div></div>
        <span class="abs tape-l" data-sticker="tape"></span>
        <span class="abs tape-r" data-sticker="tape"></span>
        <span class="abs cd-lantern" data-sticker="lantern"></span>
        <span class="abs cd-bism" data-sticker="bismillah"></span>
      </div>
      <div class="cd-head">
        <span class="chip lav2">${c.group === 'new' ? 'Новый набор' : 'Активная группа'}</span>
        <h1 class="h-page">${titleHTML(c)}</h1>
        <p class="cd-desc">${esc(c.description)}</p>
      </div>
      <div class="info-grid" style="margin-top:16px">
        <div class="info paper"><span>Старт</span><b>${esc(c.start)}</b></div>
        <div class="info lav"><span>Длительность</span><b>${esc(c.duration)}</b></div>
        <div class="info lav"><span>Расписание</span><b>${esc(c.schedule)}</b></div>
        <div class="info paper"><span>Формат</span><b>онлайн</b></div>
      </div>
      <div class="lined checklist" style="margin-top:16px">
        <h2>Что вы изучите</h2>
        ${(c.learn || []).map((t) => `<div class="check">${ICON.check}${esc(t)}</div>`).join('')}
        <span class="abs" data-sticker="sparkle"></span>
      </div>`;
    $('#cd-seats').textContent = c.seats || '';
    hydrate($('#course-body'));
    show('course');
  }
  $('#to-enroll').addEventListener('click', (e) => { e.preventDefault(); haptic(); openEnroll(); });

  /* ---------- запись ---------- */
  let contactShared = false;
  function openEnroll() {
    if (!current) return;
    $('#enroll-course').innerHTML = `
      <div class="thumb arch ph" data-crop="${esc(current.photo || 'notebook')}" style="width:52px;height:60px"></div>
      <div class="mc-body"><b>${esc(current.title)}</b><span>Старт ${esc(current.start)} · Онлайн</span></div>
      <span class="abs mc-flower" data-sticker="plumeria"></span>`;
    $('#confirm-q').textContent = `Подтверждаете запись на курс «${current.title}»?`;
    if (user && !$('#f-name').value) $('#f-name').value = [user.first_name, user.last_name].filter(Boolean).join(' ');
    clearErrors();
    hydrate($('#enroll-course'));
    show('enroll');
  }
  function setError(field, msg) {
    const input = $('#f-' + field);
    input.closest('.field').classList.add('error');
    $('#err-' + field).textContent = msg;
    input.focus();
    try { tg && tg.HapticFeedback && tg.HapticFeedback.notificationOccurred('error'); } catch (e) {}
  }
  function clearErrors() {
    $$('.field').forEach((f) => f.classList.remove('error'));
    $$('.err-msg').forEach((m) => { m.textContent = ''; });
  }
  $$('#f-name, #f-phone').forEach((i) => i.addEventListener('input', clearErrors));

  $('#share-phone').addEventListener('click', () => {
    if (!inTG || !tg.requestContact) { toast('Эта кнопка работает внутри Telegram'); return; }
    tg.requestContact((ok, res) => {
      if (!ok) return;
      contactShared = true;
      const p = res && res.responseUnsafe && res.responseUnsafe.contact && res.responseUnsafe.contact.phone_number;
      $('#f-phone').value = p ? '+' + String(p).replace(/^\+/, '') : 'номер из Telegram';
      clearErrors();
      toast('Номер получен');
    });
  });

  $('#confirm').addEventListener('click', async () => {
    clearErrors();
    const name = $('#f-name').value.trim();
    const phoneRaw = $('#f-phone').value.trim();
    const digits = phoneRaw.replace(/\D/g, '');
    if (name.length < 2) return setError('name', 'Напишите, пожалуйста, ваше имя');
    if (!contactShared && digits.length < 7) return setError('phone', 'Введите номер телефона или нажмите «Взять из Telegram»');

    const payload = {
      course_id: current.id,
      course: current.title,
      name: name.slice(0, 80),
      phone: digits.length >= 7 ? phoneRaw.slice(0, 30) : '',
      contact_shared: contactShared
    };
    haptic('medium');

    const mine = await store.getJSON('my_requests', []);
    mine.unshift({ id: current.id, title: current.title, start: current.start, photo: current.photo, at: Date.now() });
    await store.setJSON('my_requests', mine.slice(0, 6));

    if (inTG && tg.sendData && !(tg.initDataUnsafe && tg.initDataUnsafe.query_id)) {
      try { tg.sendData(JSON.stringify(payload)); return; } catch (e) {}
    }
    if (inTG) { toast('Откройте приложение кнопкой «Открыть Darul Arqam» внизу чата'); return; }
    show('success'); // предпросмотр вне Telegram
  });

  /* ---------- главная ---------- */
  function renderHome() {
    if (user && user.first_name) $('#home-name').textContent = user.first_name;
    if (user && user.photo_url) setAvatar('#home-avatar', user.photo_url);
    const w = CFG.wordOfDay || {};
    $('#word-ru').textContent = w.ru || '';
    $('#word-ar').textContent = w.ar || '';
    const c = CFG.courses.find((x) => x.featured) || CFG.courses.find((x) => x.group === 'new') || CFG.courses[0];
    if (!c) { $('#hero-card').hidden = true; return; }
    $('#hero-card').innerHTML = `
      <div class="hero-photo"><div class="ph" data-crop="hero"></div></div>
      <span class="abs hero-flower" data-sticker="plumeria"></span>
      <div class="hero-body">
        <span class="chip lav2">${c.group === 'new' ? 'Новый набор' : 'Идёт набор'}</span>
        <h2 class="hero-title">${titleHTML(c).replace(' <em>', '<br><em>')}</h2>
        <span class="hero-meta">старт ${esc(c.start)} · ${esc(c.duration)}</span>
        <a href="#" class="btn light" data-course="${esc(c.id)}">Записаться <i data-icon="arrow"></i></a>
      </div>`;
    hydrate($('#hero-card'));
  }
  function setAvatar(sel, url) {
    const el = $(sel);
    el.classList.add('custom');
    el.innerHTML = `<img src="${esc(url)}" alt="">`;
  }

  /* ---------- дневник ---------- */
  let notes = [];
  async function loadNotes() { notes = await store.getJSON('notes', []); renderNotes(); }
  function renderNotes() {
    $('#my-notes-head').hidden = !notes.length;
    $('#my-notes').innerHTML = notes.map((n, i) => `
      <div class="note rel ${n.c === 'lav' ? 'lav' : ''}">
        ${esc(n.t)}
        <button class="del" data-del="${i}" aria-label="Удалить заметку"><i data-icon="close"></i></button>
      </div>`).join('');
    hydrate($('#my-notes'));
  }
  $('#my-notes').addEventListener('click', async (e) => {
    const d = e.target.closest('[data-del]');
    if (!d) return;
    haptic();
    notes.splice(+d.dataset.del, 1);
    renderNotes();
    await store.setJSON('notes', notes);
  });
  let noteColor = 'paper';
  $('#add-note').addEventListener('click', () => {
    haptic();
    $('#note-text').value = '';
    $('#note-overlay').hidden = false;
    setTimeout(() => $('#note-text').focus(), 150);
  });
  $$('.swatch').forEach((s) => s.addEventListener('click', () => {
    noteColor = s.dataset.color;
    $$('.swatch').forEach((x) => { x.classList.toggle('on', x === s); x.setAttribute('aria-checked', x === s ? 'true' : 'false'); });
  }));
  const closeNote = () => { $('#note-overlay').hidden = true; };
  $('#cancel-note').addEventListener('click', closeNote);
  $('#note-overlay').addEventListener('click', (e) => { if (e.target.id === 'note-overlay') closeNote(); });
  $('#save-note').addEventListener('click', async () => {
    const t = $('#note-text').value.trim();
    if (!t) { $('#note-text').focus(); return; }
    haptic('medium');
    notes.unshift({ t: t.slice(0, 160), c: noteColor });
    notes = notes.slice(0, 18); // облако Telegram хранит до 4 КБ на запись
    renderNotes();
    closeNote();
    await store.setJSON('notes', notes);
    toast('Заметка сохранена');
  });

  /* ---------- профиль ---------- */
  function renderProfile() {
    if (user) {
      $('#prof-name').textContent = [user.first_name, user.last_name].filter(Boolean).join(' ') || 'Ученица';
      $('#prof-user').textContent = user.username ? '@' + user.username : '';
      if (user.photo_url) setAvatar('#prof-avatar', user.photo_url);
    }
  }
  async function renderRequests() {
    const mine = await store.getJSON('my_requests', []);
    $('#my-requests').innerHTML = mine.length ? mine.map((r) => `
      <div class="req-card">
        <div class="thumb arch ph" data-crop="${esc(r.photo || 'notebook')}" style="width:46px;height:54px"></div>
        <div class="grow"><b>${esc(r.title)}</b><small>Старт ${esc(r.start)}</small></div>
        <span class="chip lav">отправлена</span>
      </div>`).join('') : '<p class="req-empty">пока нет заявок — выберите курс ✿</p>';
    hydrate($('#my-requests'));
  }

  /* ---------- старт ---------- */
  function rememberSplash() { try { localStorage.setItem('da_seen', '1'); } catch (e) {} }
  hydrate(document);
  renderHome();
  renderCourses();
  renderProfile();
  loadNotes();
  let seen = false;
  try { seen = localStorage.getItem('da_seen') === '1'; } catch (e) {}
  show(seen ? 'home' : 'splash');
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
})();
