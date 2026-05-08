/* ===== Scroll reveal ===== */
function setupReveal() {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const targets = document.querySelectorAll('[data-animate]');

    if (prefersReduced) {
        targets.forEach(el => el.classList.add('in'));
        return;
    }

    const io = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in');
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });

    targets.forEach(el => io.observe(el));
}

/* ===== Sticky CTA: hide when pricing section is visible ===== */
function setupStickyCTA() {
    const sticky  = document.getElementById('sticky-cta');
    const pricing = document.getElementById('pricing');
    if (!sticky || !pricing) return;

    const io = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            sticky.classList.toggle('is-hidden', entry.isIntersecting);
        });
    }, { threshold: 0.2 });

    io.observe(pricing);
}

/* ===== FAQ: ensure only one item open at a time on mobile ===== */
function setupFAQ() {
    const items = document.querySelectorAll('.faq-item');
    items.forEach(item => {
        item.addEventListener('toggle', () => {
            if (item.open) {
                items.forEach(other => {
                    if (other !== item && other.open) other.removeAttribute('open');
                });
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    setupReveal();
    setupStickyCTA();
    setupFAQ();
});
