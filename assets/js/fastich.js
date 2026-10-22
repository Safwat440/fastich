/* Fastich site interactions. One file, no dependencies.
   Every enhancement is progressive: without JS the content stays visible and
   links still work. Motion is skipped when prefers-reduced-motion is set. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = matchMedia('(min-width: 901px)');
  const motionOK = () => !reduceMotion.matches;

  root.classList.remove('no-js');
  root.classList.add('js');
  root.classList.toggle('js-motion', motionOK());
  root.classList.toggle('no-motion', !motionOK());

  /* ---------- Header: scrolled state + height var ---------- */
  const header = $('.header');
  const setHeaderH = () => header && root.style.setProperty('--header-h', header.getBoundingClientRect().height + 'px');
  setHeaderH();
  addEventListener('resize', setHeaderH, { passive: true });

  const toTop = $('.to-top');
  let ticking = false;
  const onScroll = () => {
    const y = scrollY;
    header?.classList.toggle('is-scrolled', y > 8);
    toTop?.classList.toggle('show', y > 900);
    ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();
  toTop?.addEventListener('click', () => { scrollTo({ top: 0, behavior: motionOK() ? 'smooth' : 'auto' }); $('#main')?.focus({ preventScroll: true }); });

  /* ---------- Desktop mega menus ---------- */
  const triggers = $$('[data-mega]');
  let closeTimer;
  const closeMegas = (except) => triggers.forEach(t => {
    if (t === except) return;
    t.setAttribute('aria-expanded', 'false');
    $('#mega-' + t.dataset.mega)?.classList.remove('open');
  });
  const openMega = (t) => {
    clearTimeout(closeTimer);
    closeMegas(t);
    t.setAttribute('aria-expanded', 'true');
    $('#mega-' + t.dataset.mega)?.classList.add('open');
  };
  const scheduleClose = () => { clearTimeout(closeTimer); closeTimer = setTimeout(() => closeMegas(), 160); };
  triggers.forEach(t => {
    const panel = $('#mega-' + t.dataset.mega);
    $$('.megaitem', panel).forEach((el, i) => { el.classList.add('mega-item'); el.style.setProperty('--i', i); });
    t.addEventListener('click', () => t.getAttribute('aria-expanded') === 'true' ? closeMegas() : openMega(t));
    t.addEventListener('mouseenter', () => desktop.matches && openMega(t));
    t.addEventListener('mouseleave', () => desktop.matches && scheduleClose());
    panel?.addEventListener('mouseenter', () => clearTimeout(closeTimer));
    panel?.addEventListener('mouseleave', () => desktop.matches && scheduleClose());
    t.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown') { e.preventDefault(); openMega(t); $('a', panel)?.focus(); }
    });
    panel?.addEventListener('focusout', e => { if (!panel.contains(e.relatedTarget) && e.relatedTarget !== t) closeMegas(); });
  });
  document.addEventListener('click', e => { if (!e.target.closest('.header')) closeMegas(); });

  /* ---------- Mobile drawer ---------- */
  const hamb = $('#hamb'), mobile = $('#mobilepanel');
  const setMobile = (open) => {
    if (!hamb || !mobile) return;
    setHeaderH();
    mobile.classList.toggle('open', open);
    hamb.setAttribute('aria-expanded', String(open));
    hamb.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.classList.toggle('menu-open', open);
    mobile.inert = !open;
    if (open) $('a,button', mobile)?.focus({ preventScroll: true });
  };
  if (mobile) {
    [...mobile.children].forEach((el, i) => el.style.setProperty('--i', i));
    mobile.inert = true;
  }
  hamb?.addEventListener('click', () => setMobile(hamb.getAttribute('aria-expanded') !== 'true'));
  desktop.addEventListener?.('change', e => e.matches && setMobile(false));
  $$('.mobile-subtoggle').forEach(btn => btn.addEventListener('click', () => {
    const group = btn.closest('.mobile-group');
    const open = group.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
    const name = $('.mobile-parent a', group)?.textContent || '';
    btn.setAttribute('aria-label', (open ? 'Collapse ' : 'Expand ') + name + ' submenu');
  }));

  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    const openTrigger = triggers.find(t => t.getAttribute('aria-expanded') === 'true');
    if (openTrigger) { closeMegas(); openTrigger.focus(); }
    if (hamb?.getAttribute('aria-expanded') === 'true') { setMobile(false); hamb.focus(); }
  });

  /* ---------- Scroll reveal ---------- */
  // Containers with [data-stagger] give their direct children an index for delay.
  $$('[data-stagger]').forEach(c => [...c.children].forEach((el, i) => {
    if (!el.hasAttribute('data-reveal')) el.setAttribute('data-reveal', c.dataset.stagger || 'up');
    el.style.setProperty('--i', i % 6);
  }));
  const observed = $$('[data-reveal], [data-observe]');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-visible');
      io.unobserve(e.target);
    }), { threshold: 0.14, rootMargin: '0px 0px -6% 0px' });
    observed.forEach(el => io.observe(el));
    // A fast scroll or anchor jump can carry an element past the viewport without
    // it ever intersecting; reveal anything that is already above the fold line.
    let pending = observed, raf;
    const sweep = () => {
      pending = pending.filter(el => {
        if (el.classList.contains('is-visible')) return false;
        if (el.getBoundingClientRect().top < innerHeight) { el.classList.add('is-visible'); io.unobserve(el); return false; }
        return true;
      });
      if (!pending.length) removeEventListener('scroll', onSweep);
    };
    const onSweep = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(sweep); };
    addEventListener('scroll', onSweep, { passive: true });
    addEventListener('load', sweep);
  } else {
    observed.forEach(el => el.classList.add('is-visible'));
  }

  /* Pause a looping feature while it is off-screen or the tab is hidden. */
  const whenVisible = (el, onShow, onHide) => {
    let inView = false;
    const sync = () => (inView && !document.hidden ? onShow() : onHide());
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => { inView = e.isIntersecting; sync(); }, { threshold: 0.25 }).observe(el);
    } else { inView = true; sync(); }
    document.addEventListener('visibilitychange', sync);
  };

  /* ---------- Hero: live order queue demo ---------- */
  const queue = $('[data-queue]');
  if (queue && motionOK()) {
    const flow = ['new', 'prep', 'ready'];
    const labels = { new: 'NEW', prep: 'PREPARING', ready: 'READY' };
    let n = 1046, timer;
    const step = () => {
      const rows = $$('.q-row', queue);
      const ready = rows.find(r => $('.q-status', r).dataset.s === 'ready');
      if (ready) { // ready orders leave, a new one arrives
        ready.remove();
        const row = rows[0].cloneNode(true);
        $('b', row).textContent = '#' + (n++);
        $('span', row).textContent = ['Pickup', 'Table 04', 'Delivery', 'Table 11'][n % 4];
        const s = $('.q-status', row); s.dataset.s = 'new'; s.textContent = labels.new;
        queue.append(row);
        row.animate?.([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 400, easing: 'ease-out' });
        return;
      }
      const row = rows.find(r => $('.q-status', r).dataset.s !== 'ready');
      const s = $('.q-status', row);
      s.dataset.s = flow[flow.indexOf(s.dataset.s) + 1];
      s.textContent = labels[s.dataset.s];
      row.classList.add('flash');
      setTimeout(() => row.classList.remove('flash'), 600);
    };
    whenVisible(queue, () => { clearInterval(timer); timer = setInterval(step, 2400); }, () => clearInterval(timer));
  }

  /* ---------- Hero: gentle pointer depth ---------- */
  const stage = $('[data-stage]');
  if (stage && motionOK() && matchMedia('(pointer:fine)').matches) {
    const layers = $$('[data-depth]', stage);
    let raf;
    stage.closest('.hero').addEventListener('pointermove', e => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = stage.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        layers.forEach(l => {
          const d = parseFloat(l.dataset.depth);
          l.style.transform = `translate3d(${x * d}px, ${y * d}px, 0)`;
        });
      });
    });
    stage.closest('.hero').addEventListener('pointerleave', () => layers.forEach(l => (l.style.transform = '')));
  }

  /* ---------- Tabs (product showcase) ---------- */
  $$('[data-tabs]').forEach(wrap => {
    const tabs = $$('[role="tab"]', wrap);
    const dur = 7000;
    let current = tabs.findIndex(t => t.getAttribute('aria-selected') === 'true');
    let timer, userTook = false;
    wrap.style.setProperty('--tab-dur', dur + 'ms');
    const select = (i, focus) => {
      current = (i + tabs.length) % tabs.length;
      tabs.forEach((t, n) => {
        const on = n === current;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        const panel = $('#' + t.getAttribute('aria-controls'));
        panel.hidden = !on;
        if (on) {
          panel.classList.remove('is-entering'); void panel.offsetWidth; panel.classList.add('is-entering');
          $$('.tp-copy > *', panel).forEach((el, k) => el.style.setProperty('--i', k));
        }
      });
      // restart the progress bar animation
      const bar = $('.tab-progress i', tabs[current]);
      if (bar) { bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = ''; }
      if (focus) tabs[current].focus();
      if (matchMedia('(max-width:1024px)').matches) tabs[current].scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: motionOK() ? 'smooth' : 'auto' });
    };
    const stop = () => { clearInterval(timer); wrap.classList.remove('autoplay'); };
    const play = () => {
      if (userTook || !motionOK()) return;
      stop();
      wrap.classList.add('autoplay');
      select(current);
      timer = setInterval(() => select(current + 1), dur);
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => { userTook = true; stop(); select(i); });
      t.addEventListener('keydown', e => {
        const k = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
        if (k) { e.preventDefault(); userTook = true; stop(); select(current + k, true); }
        if (e.key === 'Home') { e.preventDefault(); select(0, true); }
        if (e.key === 'End') { e.preventDefault(); select(tabs.length - 1, true); }
      });
    });
    wrap.addEventListener('pointerenter', stop);
    wrap.addEventListener('pointerleave', play);
    wrap.addEventListener('focusin', stop);
    select(current < 0 ? 0 : current);
    wrap.classList.add('tabs-ready');
    whenVisible(wrap, play, stop);
  });

  /* ---------- Order journey: progress line + active step ---------- */
  const journey = $('[data-journey]');
  if (journey) {
    const steps = $$('.jstep', journey);
    const views = $$('.jv', journey);
    const list = $('.journey-steps', journey);
    const activate = (i) => {
      steps.forEach((s, n) => s.classList.toggle('is-active', n <= i));
      views.forEach((v, n) => v.classList.toggle('is-active', n === i));
    };
    activate(0);
    if (motionOK()) {
      let raf;
      const update = () => {
        const r = list.getBoundingClientRect();
        const mid = innerHeight * 0.55;
        const p = Math.min(1, Math.max(0, (mid - r.top) / r.height));
        list.style.setProperty('--progress', p.toFixed(3));
        let idx = 0;
        steps.forEach((s, n) => { if (s.getBoundingClientRect().top < mid) idx = n; });
        activate(idx);
      };
      addEventListener('scroll', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); }, { passive: true });
      update();
    } else {
      list.style.setProperty('--progress', 1);
      steps.forEach(s => s.classList.add('is-active'));
    }
  }

  /* ---------- Testimonial slider ---------- */
  const talk = $('[data-talk-slider]');
  if (talk) {
    const cards = $$('.talk-card', talk), dots = $$('[data-talk-dot]', talk);
    let active = 0, timer, hovering = false, visible = false;
    const show = (i) => {
      const prev = active;
      active = (i + cards.length) % cards.length;
      cards.forEach((c, n) => {
        c.classList.toggle('is-active', n === active);
        c.classList.toggle('is-leaving', n === prev && prev !== active);
        c.setAttribute('aria-hidden', String(n !== active));
      });
      dots.forEach((d, n) => { d.classList.toggle('active', n === active); d.setAttribute('aria-current', n === active ? 'true' : 'false'); });
    };
    const restart = () => {
      clearInterval(timer);
      if (motionOK() && visible && !hovering) timer = setInterval(() => show(active + 1), 7000);
    };
    $('[data-talk-prev]', talk)?.addEventListener('click', () => { show(active - 1); restart(); });
    $('[data-talk-next]', talk)?.addEventListener('click', () => { show(active + 1); restart(); });
    dots.forEach(d => d.addEventListener('click', () => { show(+d.dataset.talkDot); restart(); }));
    talk.addEventListener('pointerenter', () => { hovering = true; restart(); });
    talk.addEventListener('pointerleave', () => { hovering = false; restart(); });
    talk.addEventListener('focusin', () => { hovering = true; restart(); });
    talk.addEventListener('focusout', () => { hovering = false; restart(); });
    show(0);
    whenVisible(talk, () => { visible = true; restart(); }, () => { visible = false; restart(); });
  }

  /* ---------- Language selector (presentation only) ----------
     Updates its own label and nothing else: no translation, no dir/lang change,
     no navigation or URL change. All instances (nav + mobile drawer) stay in sync. */
  const langMenus = $$('[data-lang-menu]');
  const setLang = (value) => langMenus.forEach(m => {
    $$('[role="option"]', m).forEach(o => o.setAttribute('aria-selected', String(o.dataset.value === value)));
    const label = $(`[data-value="${value}"]`, m).dataset.label;
    $('.lang-current', m).textContent = label;
    $('.lang-btn', m).setAttribute('aria-label', `Language: ${label}. Preview only, translations not available yet`);
  });
  langMenus.forEach(m => {
    const btn = $('.lang-btn', m), opts = $$('[role="option"]', m);
    const close = (focusBtn) => {
      m.classList.remove('open'); btn.setAttribute('aria-expanded', 'false');
      if (focusBtn) btn.focus();
    };
    m._close = close;
    const open = (focusIdx) => {
      langMenus.forEach(o => o !== m && o._close?.());
      closeMegas();
      m.classList.add('open'); btn.setAttribute('aria-expanded', 'true');
      const sel = opts.findIndex(o => o.getAttribute('aria-selected') === 'true');
      opts[focusIdx ?? (sel < 0 ? 0 : sel)].focus(); // may scroll the mobile drawer to reveal the list
    };
    const choose = (o) => { setLang(o.dataset.value); close(true); };
    btn.addEventListener('click', () => (m.classList.contains('open') ? close() : open()));
    btn.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); open(e.key === 'ArrowUp' ? opts.length - 1 : undefined); }
    });
    opts.forEach((o, i) => {
      o.addEventListener('click', () => choose(o));
      o.addEventListener('keydown', e => {
        const move = { ArrowDown: 1, ArrowUp: -1 }[e.key];
        if (move) { e.preventDefault(); opts[(i + move + opts.length) % opts.length].focus(); }
        else if (e.key === 'Home' || e.key === 'End') { e.preventDefault(); opts[e.key === 'Home' ? 0 : opts.length - 1].focus(); }
        else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(o); }
        else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(true); }
        else if (e.key === 'Tab') close();
      });
    });
    document.addEventListener('click', e => { if (!m.contains(e.target)) close(); });
  });

  /* ---------- Clients logo carousel ---------- */
  // Native scroll-snap track: touch/trackpad/keyboard scroll work without JS.
  // JS adds prev/next and a gentle autoplay that pauses on hover, focus and off-screen.
  $$('[data-clients]').forEach(shell => {
    const track = $('.logo-track', shell);
    const step = () => (track.firstElementChild?.getBoundingClientRect().width || 0) + parseFloat(getComputedStyle(track).columnGap || 0);
    const atEnd = () => track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
    const go = (dir) => {
      const behavior = motionOK() ? 'smooth' : 'auto';
      if (dir > 0 && atEnd()) track.scrollTo({ left: 0, behavior });
      else if (dir < 0 && track.scrollLeft <= 4) track.scrollTo({ left: track.scrollWidth, behavior });
      else track.scrollBy({ left: dir * step(), behavior });
    };
    let timer, hold = false, visible = false;
    const sync = () => {
      clearInterval(timer);
      if (motionOK() && visible && !hold && track.scrollWidth > track.clientWidth) timer = setInterval(() => go(1), 3200);
    };
    $('[data-clients-prev]', shell)?.addEventListener('click', () => go(-1));
    $('[data-clients-next]', shell)?.addEventListener('click', () => go(1));
    shell.addEventListener('pointerenter', () => { hold = true; sync(); });
    shell.addEventListener('pointerleave', () => { hold = false; sync(); });
    shell.addEventListener('focusin', () => { hold = true; sync(); });
    shell.addEventListener('focusout', e => { if (!shell.contains(e.relatedTarget)) { hold = false; sync(); } });
    track.addEventListener('touchstart', () => { hold = true; sync(); }, { passive: true });
    track.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); go(e.key === 'ArrowRight' ? 1 : -1); }
    });
    whenVisible(shell, () => { visible = true; sync(); }, () => { visible = false; sync(); });
  });

  /* ---------- FAQ accordion ---------- */
  $$('.faqbtn').forEach((b, i) => {
    const item = b.closest('.faqitem');
    const panel = $('.faqanswer', item);
    if (panel) {
      panel.id ||= 'faq-panel-' + i;
      b.id ||= 'faq-btn-' + i;
      b.setAttribute('aria-controls', panel.id);
      panel.setAttribute('role', 'region');
      panel.setAttribute('aria-labelledby', b.id);
    }
    b.setAttribute('aria-expanded', String(item.classList.contains('open')));
    b.addEventListener('click', () => {
      const open = item.classList.toggle('open');
      b.setAttribute('aria-expanded', String(open));
    });
  });

  /* ---------- Search + category filters ---------- */
  const grid = $('#filterGrid');
  if (grid) {
    const cards = $$('.filtercard', grid);
    const search = $('#searchCards');
    const chipsWrap = $('#filterChips');
    const countEl = $('#resultCount');
    const empty = $('#emptyState');
    const noun = grid.dataset.noun || 'items';
    const params = new URLSearchParams(location.search);
    let category = params.get('category') || 'all';
    const cats = [...new Set(cards.map(c => c.dataset.category))];
    if (!cats.includes(category)) category = 'all';
    if (search && params.get('q')) search.value = params.get('q');

    if (chipsWrap) {
      const mk = (value, label, count) => {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'chip'; b.dataset.value = value;
        b.innerHTML = `${label}<span class="count">${count}</span>`;
        b.setAttribute('aria-pressed', String(value === category));
        b.addEventListener('click', () => { category = value; apply(true); });
        chipsWrap.append(b);
      };
      mk('all', 'All', cards.length);
      cats.forEach(c => mk(c, c, cards.filter(x => x.dataset.category === c).length));
    }

    const apply = (pushState) => {
      const q = (search?.value || '').trim().toLowerCase();
      let shown = 0;
      cards.forEach(c => {
        const hay = (c.dataset.name || c.textContent).toLowerCase();
        const ok = (!q || hay.includes(q)) && (category === 'all' || c.dataset.category === category);
        c.hidden = !ok;
        if (ok) shown++;
      });
      $$('.chip', chipsWrap || document).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.value === category)));
      if (countEl) countEl.textContent = `Showing ${shown} of ${cards.length} ${noun}` + (category !== 'all' ? ` in ${category}` : '') + (q ? ` matching “${search.value.trim()}”` : '');
      if (empty) empty.hidden = shown > 0;
      if (pushState) {
        const p = new URLSearchParams();
        if (category !== 'all') p.set('category', category);
        if (q) p.set('q', search.value.trim());
        history.replaceState(null, '', location.pathname + (p.toString() ? '?' + p : '') + location.hash);
      }
    };
    search?.addEventListener('input', () => apply(true));
    $('#resetFilters')?.addEventListener('click', () => { category = 'all'; if (search) search.value = ''; apply(true); search?.focus(); });
    apply(false);
  }

  /* ---------- Pricing toggle ---------- */
  const fmt = (n) => '$' + (Math.round(n * 100) / 100).toFixed(n % 1 ? 2 : 0);
  $$('[data-period]').forEach(b => b.addEventListener('click', () => {
    $$('[data-period]').forEach(x => { x.classList.toggle('active', x === b); x.setAttribute('aria-pressed', String(x === b)); });
    $$('.price[data-month]').forEach(p => {
      const m = parseFloat(p.dataset.month.replace(/[^0-9.]/g, ''));
      if (isNaN(m)) return; // "Let's talk"
      const yearly = b.dataset.period === 'yearly';
      const v = yearly ? m * (1 - (parseFloat(p.dataset.discount) || 0.15)) : m;
      p.innerHTML = fmt(v) + '<small> / month' + (yearly ? ', billed yearly' : '') + '</small>';
      p.classList.remove('swap'); void p.offsetWidth; p.classList.add('swap');
    });
  }));

  /* ---------- Demo form: honest local validation ---------- */
  const form = $('#demoForm');
  if (form) {
    form.noValidate = true;
    const messages = {
      valueMissing: (f) => `Please ${f.tagName === 'SELECT' ? 'choose' : 'enter'} ${f.dataset.label || 'this field'}.`,
      typeMismatch: () => 'Please enter a valid email address, like name@restaurant.com.',
    };
    const check = (f) => {
      const wrap = f.closest('.field');
      if (!wrap) return true;
      let err = $('.field-error', wrap);
      if (!err) {
        err = document.createElement('p');
        err.className = 'field-error';
        err.id = f.id + '-error';
        wrap.append(err);
      }
      const v = f.validity;
      const msg = v.valid ? '' : (v.valueMissing ? messages.valueMissing(f) : v.typeMismatch ? messages.typeMismatch(f) : f.validationMessage);
      err.innerHTML = msg ? '<i class="fa-solid fa-circle-exclamation" aria-hidden="true"></i>' + msg : '';
      wrap.classList.toggle('has-error', !!msg);
      f.setAttribute('aria-invalid', String(!!msg));
      if (msg) f.setAttribute('aria-describedby', err.id); else f.removeAttribute('aria-describedby');
      return !msg;
    };
    const fields = $$('input,select,textarea', form);
    fields.forEach(f => {
      f.addEventListener('blur', () => f.value && check(f));
      f.addEventListener('input', () => f.closest('.field')?.classList.contains('has-error') && check(f));
    });
    form.addEventListener('submit', e => {
      e.preventDefault();
      const bad = fields.filter(f => !check(f));
      const notice = $('#formNotice');
      if (bad.length) { bad[0].focus(); notice?.classList.remove('show'); return; }
      // No backend is connected: say so plainly and keep what the visitor typed.
      notice?.classList.add('show');
      notice?.focus();
    });
  }

  /* ---------- Article: reading progress, TOC, share ---------- */
  const article = $('[data-article]');
  if (article) {
    const bar = $('.read-progress');
    const tocLinks = $$('.article-aside a[href^="#"]');
    const heads = tocLinks.map(a => $(a.getAttribute('href'))).filter(Boolean);
    let raf;
    const update = () => {
      const r = article.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, -r.top / (r.height - innerHeight * 0.6)));
      if (bar) bar.style.transform = `scaleX(${p})`;
      let cur = 0;
      heads.forEach((h, i) => { if (h.getBoundingClientRect().top < 160) cur = i; });
      tocLinks.forEach((a, i) => a.classList.toggle('is-current', i === cur));
    };
    addEventListener('scroll', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); }, { passive: true });
    update();
  }
  const toast = (msg) => {
    let t = $('.toast');
    if (!t) { t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); document.body.append(t); }
    t.textContent = msg; t.classList.add('show');
    clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 2200);
  };
  $$('[data-copy-link]').forEach(b => b.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(location.href); toast('Link copied'); }
    catch { toast('Copy failed — use your browser’s address bar'); }
  }));
  $$('[data-native-share]').forEach(b => {
    if (!navigator.share) { b.hidden = true; return; }
    b.addEventListener('click', () => navigator.share({ title: document.title, url: location.href }).catch(() => {}));
  });

  /* ---------- Footer year ---------- */
  $$('[data-year]').forEach(el => (el.textContent = new Date().getFullYear()));
})();
