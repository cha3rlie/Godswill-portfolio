/* ── hamburger ── */
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobileNav');

hamburger.addEventListener('click', function () {
    const isOpen = mobileNav.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
});

mobileNav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
        mobileNav.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', false);
    });
});

/* ── scroll reveal ── */
const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        scrollObserver.unobserve(entry.target);
    });
}, { threshold: 0.12, rootMargin: '0px 0px -80px 0px' });

[
    '.about__image-wrap', '.about__content',
    '.menu__header', '.menu__see-more-wrap',
    '.testimonials__header', '.contact__info', '.contact__cta'
].forEach(sel => {
    const el = document.querySelector(sel);
    if (el) scrollObserver.observe(el);
});

document.querySelectorAll('.menu__card:not(.extra), .testimonial__card').forEach((card, i) => {
    card.style.transitionDelay = `${Math.min((i % 6) * 0.08, 0.48)}s`;
    scrollObserver.observe(card);
});

/* ── counter animation ── */
function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-target'), 10);
    const start  = performance.now();
    const dur    = 1800;
    (function tick(now) {
        const p = Math.min((now - start) / dur, 1);
        el.textContent = Math.floor((1 - Math.pow(1 - p, 3)) * target);
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = target;
    })(start);
}

const statsEl = document.querySelector('.about__stats');
if (statsEl) {
    const statsObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.querySelectorAll('.about__stat-number').forEach(animateCounter);
            statsObserver.unobserve(entry.target);
        });
    }, { threshold: 0.4 });
    statsObserver.observe(statsEl);
}

/* ── see more ── */
const seeMoreBtn = document.getElementById('seeMoreBtn');
const extraCards = document.querySelectorAll('.menu__card.extra');
let expanded = false;

if (seeMoreBtn) seeMoreBtn.addEventListener('click', function () {
    expanded = !expanded;
    extraCards.forEach(function (card, i) {
        if (expanded) {
            card.classList.add('show');
            setTimeout(() => card.classList.add('visible'), i * 80);
        } else {
            card.classList.remove('visible');
            setTimeout(() => card.classList.remove('show'), 400);
        }
    });
    seeMoreBtn.textContent = expanded ? 'See Less \u2191' : 'See More Drinks \u2193';
});

/* ── filter tabs ── */
const tabs     = document.querySelectorAll('.menu__tab');
const allCards = document.querySelectorAll('.menu__card');

tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
        const filter = tab.getAttribute('data-filter');
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        allCards.forEach(function (card) {
            const match   = filter === 'all' || card.getAttribute('data-category') === filter;
            const isExtra = card.classList.contains('extra');
            if (!match) {
                card.classList.add('hidden');
            } else {
                card.classList.remove('hidden');
                if (isExtra && !expanded) card.classList.remove('show');
            }
        });
    });
});

/* ── smooth in-page anchors ── */
document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', function (e) {
        const hash = this.getAttribute('href');
        if (hash.length < 2) return;
        const target = document.querySelector(hash);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});

/* ══════════ BOOKINGS PAGE (all guarded; safe on the home page) ══════════ */
/* ── ember particles (gold + pink to match the palette) ── */
const emb = document.getElementById('embers');
if (emb) {
    for (let i = 0; i < 20; i++) {
        const e = document.createElement('div');
        e.className = 'ember';
        e.style.cssText = `
            left:${Math.random() * 100}%;
            width:${2 + Math.random() * 3}px;
            height:${2 + Math.random() * 3}px;
            background:${Math.random() > .5 ? '#c47c2a' : '#e8b4b0'};
            --dur:${4 + Math.random() * 6}s;
            --delay:${Math.random() * 8}s;
            --drift:${(Math.random() - .5) * 70}px;
        `;
        emb.appendChild(e);
    }
}

/* ── min date = today (local time) ── */
const resDate = document.getElementById('resDate');
if (resDate) {
    const d = new Date();
    const pad = n => String(n).padStart(2, '0');
    resDate.min = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/* ── state ── */
let guestCount       = 2;
let selectedTime     = '';
let selectedOccasion = 'casual';
let selectedAddons   = [];
let currentStep      = 1;

const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

function changeGuests(d) {
    guestCount = Math.max(1, Math.min(50, guestCount + d));
    document.getElementById('guestVal').textContent = guestCount;
    updateSummary();
}

function selectChip(el) {
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('sel-chip'));
    el.classList.add('sel-chip');
    selectedOccasion = el.dataset.val;
    updateSummary();
}

function selectTime(el) {
    if (el.classList.contains('unavailable')) return;
    document.querySelectorAll('.time-slot').forEach(t => t.classList.remove('selected'));
    el.classList.add('selected');
    selectedTime = el.dataset.time;
    updateSummary();
}

function toggleAddon(card) {
    card.classList.toggle('sel-addon');
    const name  = card.dataset.name;
    const price = parseInt(card.dataset.price, 10);
    if (card.classList.contains('sel-addon')) selectedAddons.push({ name, price });
    else selectedAddons = selectedAddons.filter(a => a.name !== name);
    updateSummary();
}

function addonsTotal() { return selectedAddons.reduce((s, a) => s + a.price, 0); }

function updateSummary() {
    const fname = document.getElementById('fname')?.value.trim() || '';
    const lname = document.getElementById('lname')?.value.trim() || '';
    const name  = `${fname} ${lname}`.trim();
    const date  = document.getElementById('resDate')?.value;
    const seating = document.getElementById('seating');
    const seatingText = seating?.options[seating.selectedIndex]?.text || '';

    const set = (id, html) => { const el = document.getElementById(id); if (el) el.innerHTML = html; };
    const dash = '<em class="empty">—</em>';

    set('sum-name',     name ? esc(name) : dash);
    set('sum-guests',   `${guestCount} guest${guestCount > 1 ? 's' : ''}`);
    set('sum-occasion', cap(selectedOccasion));
    set('sum-date',     date ? formatDate(date) : dash);
    set('sum-time',     selectedTime ? formatTime(selectedTime) : dash);
    set('sum-seating',  seating?.value ? esc(seatingText.split('—')[0].trim()) : dash);
    set('sum-addons',   selectedAddons.length ? selectedAddons.map(a => `<div>${esc(a.name)}</div>`).join('') : '<em class="empty">None</em>');
    set('sum-total',    `₦${addonsTotal().toLocaleString()}`);
}

function formatDate(d) {
    const dt = new Date(d + 'T00:00:00');
    return dt.toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

function formatTime(t) {
    const [h, m] = t.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12  = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

function goStep(n) {
    if (n > currentStep && !validateStep(currentStep)) return;
    currentStep = n;

    document.querySelectorAll('.form-panel').forEach((p, i) => p.classList.toggle('active', i === n - 1));

    for (let i = 1; i <= 4; i++) {
        const s  = document.getElementById('s' + i);
        const sn = document.getElementById('sn' + i);
        s.classList.remove('active', 'done');
        if (i < n)        { s.classList.add('done');   sn.textContent = '✓'; }
        else if (i === n) { s.classList.add('active'); sn.textContent = i;  }
        else              { sn.textContent = i; }
    }

    if (n === 4) buildReview();
    updateSummary();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function validateStep(step) {
    let ok = true;
    const show = (id, v) => document.getElementById(id)?.classList.toggle('show', v);
    const mark = (id, v) => document.getElementById(id)?.classList.toggle('has-error', v);

    if (step === 1) {
        const fname = document.getElementById('fname').value.trim();
        const lname = document.getElementById('lname').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();

        const fv = !!fname; show('e-fname', !fv); mark('fname', !fv); if (!fv) ok = false;
        const lv = !!lname; show('e-lname', !lv); mark('lname', !lv); if (!lv) ok = false;
        const ev = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
        show('e-email', !ev); mark('email', !ev); if (!ev) ok = false;
        const pv = !!phone; show('e-phone', !pv); mark('phone', !pv); if (!pv) ok = false;
    }

    if (step === 2) {
        const date    = document.getElementById('resDate').value;
        const seating = document.getElementById('seating').value;
        show('e-date',    !date);         mark('resDate', !date);         if (!date) ok = false;
        show('e-seating', !seating);      mark('seating', !seating);      if (!seating) ok = false;
        show('e-time',    !selectedTime);                                  if (!selectedTime) ok = false;
    }
    return ok;
}

function buildReview() {
    const val = id => document.getElementById(id);
    const optText = id => { const s = val(id); return s?.options[s.selectedIndex]?.text || ''; };
    const date = val('resDate')?.value;

    const rows = [
        ['Guest',    esc(`${val('fname').value.trim()} ${val('lname').value.trim()}`)],
        ['Email',    esc(val('email').value.trim())],
        ['Phone',    esc(val('phone').value.trim())],
        ['Guests',   `${guestCount} guest${guestCount > 1 ? 's' : ''}`],
        ['Occasion', cap(selectedOccasion)],
        ['Date',     date ? formatDate(date) : '—'],
        ['Time',     selectedTime ? formatTime(selectedTime) : '—'],
        ['Duration', esc(optText('duration'))],
        ['Setup',    esc(optText('seating'))],
        ['Dietary',  esc(optText('dietary'))],
        ['Add-ons',  selectedAddons.length ? selectedAddons.map(a => `${esc(a.name)} — ₦${a.price.toLocaleString()}`).join('<br>') : 'None'],
        ['Notes',    esc(val('notes').value.trim() || 'None')],
        ['Total',    `₦${addonsTotal().toLocaleString()} (add-ons only)`],
    ];

    document.getElementById('reviewTable').innerHTML = rows.map(([k, v]) => `
        <div class="summary-row">
            <span class="sum-key">${k}</span>
            <span class="sum-val">${v}</span>
        </div>`).join('');
}

function confirmReservation() {
    const btn = document.getElementById('confirmBtn');
    btn.textContent = 'Processing…';
    btn.style.pointerEvents = 'none';

    /* NOTE: front-end demo only. Replace this timeout with a real request
       (e.g. fetch to your backend / Formspree / WhatsApp link) to actually receive bookings. */
    setTimeout(() => {
        const ref = 'GW-' + Math.random().toString(36).slice(2, 8).toUpperCase();
        document.getElementById('refCode').textContent = ref;
        document.querySelectorAll('.form-panel').forEach(p => p.classList.remove('active'));
        for (let i = 1; i <= 4; i++) {
            document.getElementById('s' + i).classList.remove('active');
            document.getElementById('s' + i).classList.add('done');
            document.getElementById('sn' + i).textContent = '✓';
        }
        document.getElementById('successScreen').classList.add('show');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1800);
}

/* ── live summary ── */
['fname', 'lname', 'resDate', 'seating'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
        el.addEventListener('input',  updateSummary);
        el.addEventListener('change', updateSummary);
    }
});

if (document.getElementById('panel1')) updateSummary();