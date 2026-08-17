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

    /* ── single shared scroll observer ── */
    const scrollObserver = new IntersectionObserver((entries) => {

    entries.forEach(entry => {

        if (!entry.isIntersecting) return;

        entry.target.classList.add("visible");

        scrollObserver.unobserve(entry.target);

    });

},{
    threshold:0.12,
    rootMargin:"0px 0px -80px 0px"
});

    [
        '.about__image-wrap', '.about__content',
        '.menu__header', '.menu__see-more-wrap',
        '.testimonials__header', '.contact__info', '.contact__form'
    ].forEach(function (sel) {
        var el = document.querySelector(sel);
        if (el) scrollObserver.observe(el);
    });
document.querySelectorAll(".menu__card:not(.extra)").forEach((card,i)=>{

    card.style.transitionDelay = `${Math.min(i*0.08,0.48)}s`;

    scrollObserver.observe(card);

});

document.querySelectorAll(".testimonial__card").forEach((card,i)=>{

    card.style.transitionDelay = `${Math.min(i*0.08,0.48)}s`;

    scrollObserver.observe(card);

});

    /* ── counter animation ── */
    function animateCounter(el) {
        const target = parseInt(el.getAttribute('data-target'));
        const start  = performance.now();
        const dur    = 1800;
        (function tick(now) {
            const p = Math.min((now - start) / dur, 1);
            el.textContent = Math.floor((1 - Math.pow(1 - p, 3)) * target);
            if (p < 1) requestAnimationFrame(tick);
            else el.textContent = target;
        })(start);
    }

    new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.querySelectorAll('.about__stat-number').forEach(animateCounter);
                this.unobserve(entry.target);
            }
        }.bind(this));
    }, { threshold: 0.4 }).observe(document.querySelector('.about__stats'));

    /* ── see more ── */
    const seeMoreBtn = document.getElementById('seeMoreBtn');
    const extraCards = document.querySelectorAll('.menu__card.extra');
    let expanded = false;

    seeMoreBtn.addEventListener('click', function () {
        expanded = !expanded;
        extraCards.forEach(function (card, i) {
            if (expanded) {
                card.classList.add('show');
                setTimeout(function () { card.classList.add('visible'); }, i * 80);
            } else {
                card.classList.remove('visible');
                setTimeout(function () { card.classList.remove('show'); }, 400);
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
            tabs.forEach(function (t) { t.classList.remove('active'); });
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

    /* ── contact form feedback ── */
    function handleFormSubmit(e) {
        e.preventDefault();
        const btn = document.getElementById('submitBtn');
        btn.textContent = '✓ Message Sent!';
        btn.style.background = 'var(--green)';
        btn.style.pointerEvents = 'none';
        setTimeout(function () {
            btn.textContent = 'Send Message';
            btn.style.background = '';
            btn.style.pointerEvents = '';
            e.target.reset();
        }, 3000);
    }






    document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener("click", function(e) {

        const target = document.querySelector(this.getAttribute("href"));

        if(!target) return;

        e.preventDefault();

        target.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    });
});