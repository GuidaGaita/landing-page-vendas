/* ═══════════════════════════════════════════════════════════
   GuidaGaita — comportamento e movimento
   ═══════════════════════════════════════════════════════════ */

/* Marca que o JS está vivo. Sem isso, o CSS mantém tudo visível,
   então a página nunca fica em branco se o script falhar. */
document.documentElement.classList.add('js');

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── Revelação ao rolar ──────────────────────────────────── */
function setupReveal() {
    const targets = document.querySelectorAll('.reveal');
    if (!targets.length) return;

    if (REDUCED || !('IntersectionObserver' in window)) {
        targets.forEach(el => el.classList.add('is-in'));
        return;
    }

    // Margem inferior positiva estende a área de observação para BAIXO da
    // tela: o elemento já começa a aparecer antes de entrar no campo de
    // visão, então quem rola encontra o conteúdo pronto em vez de esperar.
    const io = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-in');
            obs.unobserve(entry.target);
        });
    }, { threshold: 0, rootMargin: '0px 0px 14% 0px' });

    targets.forEach(el => io.observe(el));
}

/* ── Contadores dos números de prova ─────────────────────── */
function setupCounters() {
    const nums = document.querySelectorAll('[data-count]');
    if (!nums.length) return;

    const paint = (el, value) => {
        el.textContent = value + (el.dataset.suffix || '');
    };

    if (REDUCED || !('IntersectionObserver' in window)) {
        nums.forEach(el => paint(el, Number(el.dataset.count)));
        return;
    }

    const run = el => {
        const target = Number(el.dataset.count);
        const duration = 1500;
        const start = performance.now();

        const step = now => {
            const p = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 4);   // desacelera no fim
            paint(el, Math.round(target * eased));
            if (p < 1) requestAnimationFrame(step);
        };

        requestAnimationFrame(step);
    };

    const io = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            run(entry.target);
            obs.unobserve(entry.target);
        });
    }, { threshold: 0.6 });

    nums.forEach(el => io.observe(el));
}

/* ── Poeira em suspensão no hero ─────────────────────────── */
function setupDust() {
    const canvas = document.getElementById('dust');
    if (!canvas || REDUCED) return;

    const hero = canvas.closest('.hero');
    const ctx = canvas.getContext('2d');
    let motes = [];
    let raf = null;
    let awake = true;

    /* Halo desenhado uma única vez num canvas à parte. Reaproveitar este
       sprite dá brilho macio a cada partícula sem recriar um gradiente a
       cada quadro, que é o que tornaria a densidade alta cara demais. */
    const GS = 64;
    const glow = document.createElement('canvas');
    glow.width = glow.height = GS;
    const gctx = glow.getContext('2d');
    const grad = gctx.createRadialGradient(GS / 2, GS / 2, 0, GS / 2, GS / 2, GS / 2);
    grad.addColorStop(0,    'rgba(255, 228, 178, 1)');
    grad.addColorStop(0.26, 'rgba(246, 186, 112, .6)');
    grad.addColorStop(0.58, 'rgba(228, 124, 56, .17)');
    grad.addColorStop(1,    'rgba(226, 98, 44, 0)');
    gctx.fillStyle = grad;
    gctx.fillRect(0, 0, GS, GS);

    const seed = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const w = hero.offsetWidth;
        const h = hero.offsetHeight;

        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        // Densidade proporcional à área, com teto menor no celular
        const count = Math.min(Math.round((w * h) / 6500), w < 700 ? 70 : 75);

        motes = Array.from({ length: count }, () => {
            // Cerca de um terço é brasa: maior, mais forte e mais lenta
            const brasa = Math.random() < 0.3;
            return {
                x: Math.random() * w,
                y: Math.random() * h,
                r: brasa ? Math.random() * 2.6 + 2.4 : Math.random() * 1.6 + 0.6,
                vx: (Math.random() - 0.5) * (brasa ? 0.14 : 0.26),
                vy: -(Math.random() * (brasa ? 0.16 : 0.3) + 0.04),
                a: brasa ? Math.random() * 0.35 + 0.62 : Math.random() * 0.42 + 0.32,
                pulse: Math.random() * Math.PI * 2,
                ritmo: Math.random() * 0.014 + 0.008,
                balanco: Math.random() * 0.5 + 0.25
            };
        });
    };

    const draw = () => {
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;
        ctx.clearRect(0, 0, w, h);
        // Partículas sobrepostas somam luz em vez de se taparem
        ctx.globalCompositeOperation = 'lighter';

        motes.forEach(m => {
            m.pulse += m.ritmo;
            // Sobe balançando de lado, como poeira pega na luz
            m.x += m.vx + Math.sin(m.pulse) * m.balanco * 0.12;
            m.y += m.vy;

            // Reentra pelo lado oposto
            if (m.y < -14) { m.y = h + 14; m.x = Math.random() * w; }
            if (m.x < -14) m.x = w + 14;
            if (m.x > w + 14) m.x = -14;

            const d = m.r * 7.5;
            // Piso alto na pulsação: nenhuma partícula chega a sumir
            ctx.globalAlpha = Math.max(m.a * (0.7 + 0.3 * Math.sin(m.pulse)), 0);
            ctx.drawImage(glow, m.x - d / 2, m.y - d / 2, d, d);
        });

        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
        raf = requestAnimationFrame(draw);
    };

    const start = () => { if (!raf) { awake = true; raf = requestAnimationFrame(draw); } };
    const stop  = () => { if (raf) { cancelAnimationFrame(raf); raf = null; awake = false; } };

    seed();
    start();

    // Só anima enquanto o hero estiver na tela
    if ('IntersectionObserver' in window) {
        new IntersectionObserver(entries => {
            entries[0].isIntersecting ? start() : stop();
        }, { threshold: 0 }).observe(hero);
    }

    document.addEventListener('visibilitychange', () => {
        document.hidden ? stop() : start();
    });

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => { seed(); if (awake) start(); }, 200);
    }, { passive: true });
}

/* ── Parallax suave nas fotos emolduradas ────────────────── */
function setupParallax() {
    const layers = document.querySelectorAll('[data-parallax]');
    if (!layers.length || REDUCED || window.innerWidth < 940) return;

    let ticking = false;

    const apply = () => {
        const mid = window.innerHeight / 2;

        layers.forEach(el => {
            const box = el.getBoundingClientRect();
            // Só calcula o que está por perto da viewport
            if (box.bottom < -200 || box.top > window.innerHeight + 200) return;

            const offset = (box.top + box.height / 2 - mid) * Number(el.dataset.parallax);
            // Propriedade `translate` em vez de `transform`: não conflita
            // com a leve rotação que o CSS já aplica na moldura.
            el.style.translate = `0 ${offset.toFixed(1)}px`;
        });

        ticking = false;
    };

    window.addEventListener('scroll', () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(apply);
    }, { passive: true });

    apply();
}

/* ── Cabeçalho que surge depois do hero ──────────────────── */
function setupHeader() {
    const header = document.getElementById('site-header');
    if (!header) return;

    let ticking = false;

    const update = () => {
        header.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.75);
        ticking = false;
    };

    window.addEventListener('scroll', () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(update);
    }, { passive: true });

    update();
}

/* ── Barra fixa ──────────────────────────────────────────────
   Some em dois momentos: no hero, onde duplicaria o botão que já
   está na tela, e na seção de oferta, onde taparia o botão real.
   ─────────────────────────────────────────────────────────── */
function setupDock() {
    const dock = document.getElementById('dock');
    const hero = document.querySelector('.hero');
    const oferta = document.getElementById('oferta');
    if (!dock || !('IntersectionObserver' in window)) return;

    const blocking = new Set();

    const io = new IntersectionObserver(entries => {
        entries.forEach(e => {
            e.isIntersecting ? blocking.add(e.target) : blocking.delete(e.target);
        });
        dock.classList.toggle('is-hidden', blocking.size > 0);
    }, { threshold: 0.15 });

    if (hero) io.observe(hero);
    if (oferta) io.observe(oferta);
}

/* ── Faixa rolante: duplica até fechar o ciclo ───────────── */
function setupTicker() {
    const track = document.getElementById('ticker-track');
    if (!track) return;

    const group = track.querySelector('.ticker__group');
    if (!group) return;

    // Preenche a largura da tela antes de espelhar
    let guard = 0;
    while (track.scrollWidth < window.innerWidth * 1.5 && guard < 12) {
        track.appendChild(group.cloneNode(true));
        guard++;
    }

    // Espelha o conjunto: a animação de -50% fecha sem emenda
    track.innerHTML = track.innerHTML + track.innerHTML;
}

/* ── FAQ: um aberto de cada vez + foto de fundo travada ──────
   A foto da seção é `position:absolute; inset:0` dentro da seção,
   então seu recorte (`background-size:cover`) é recalculado toda
   vez que a seção muda de altura. Como abrir uma resposta estica
   a seção, a foto "pulava" de recorte a cada clique.

   A correção: travar a altura da camada da foto no valor medido
   com o acordeão fechado, via `style.height` inline (isso vence o
   `inset:0` da folha de estilos, mas mantém o topo ancorado). A
   seção continua crescendo normalmente por trás — só a foto para
   de reagir a essa mudança.
   ─────────────────────────────────────────────────────────── */
function setupFAQ() {
    const items = document.querySelectorAll('.faq__item');
    const section = document.querySelector('.section--faq');
    const bg = section?.querySelector('.section-bg');

    const algumAberto = () => section && !!section.querySelector('.faq__item[open]');

    const travarAltura = () => {
        if (!bg || algumAberto()) return;
        bg.style.height = `${section.offsetHeight}px`;
    };

    travarAltura();

    items.forEach(item => {
        item.addEventListener('toggle', () => {
            if (item.open) {
                items.forEach(other => {
                    if (other !== item) other.open = false;
                });
            }
            // Ao fechar tudo, a seção volta à altura natural — reaproveita
            // o momento para conferir se o valor travado ainda bate.
            if (!algumAberto()) travarAltura();
        });
    });

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(travarAltura, 200);
    }, { passive: true });
}

/* ── Player da prévia ────────────────────────────────────────
   A seção nasce escondida. Só aparece se o arquivo de áudio
   existir de verdade — assim a página nunca mostra um player
   quebrado enquanto o MP3 não for adicionado.
   ─────────────────────────────────────────────────────────── */
const AUDIO_SRC = 'assets/previa.mp3';

function setupPlayer() {
    const section = document.querySelector('[data-audio-section]');
    const wrap    = document.getElementById('player');
    const btn     = document.getElementById('player-btn');
    const wave    = document.getElementById('player-wave');
    const time    = document.getElementById('player-time');
    if (!section || !wrap || !btn || !wave || !time) return;

    const clock = s => {
        if (!isFinite(s) || s < 0) return '0:00';
        const m = Math.floor(s / 60);
        const r = Math.floor(s % 60);
        return `${m}:${String(r).padStart(2, '0')}`;
    };

    // Menos barras em tela estreita: 56 não caberiam num celular pequeno
    const barCount = window.innerWidth < 560 ? 32 : 56;

    const audio = new Audio();
    audio.preload = 'metadata';
    audio.src = AUDIO_SRC;

    // Enquanto não houver metadados válidos, tudo segue escondido
    audio.addEventListener('loadedmetadata', () => {
        if (!isFinite(audio.duration) || audio.duration === 0) return;
        section.hidden = false;
        document.querySelectorAll('[data-audio-link]').forEach(el => { el.hidden = false; });
        time.textContent = clock(audio.duration);
    });

    audio.addEventListener('error', () => { section.hidden = true; });

    // Desenha as barras da forma de onda
    const bars = [];
    for (let i = 0; i < barCount; i++) {
        const bar = document.createElement('span');
        bar.className = 'player__bar';
        // Envelope orgânico: mais cheio no meio, com variação
        const curve = Math.sin((i / barCount) * Math.PI);
        const jitter = 0.42 + Math.random() * 0.58;
        bar.style.height = `${Math.max(12, curve * jitter * 100)}%`;
        wave.appendChild(bar);
        bars.push(bar);
    }

    const paintProgress = () => {
        const ratio = audio.duration ? audio.currentTime / audio.duration : 0;
        const head = Math.floor(ratio * barCount);

        bars.forEach((bar, i) => {
            bar.classList.toggle('is-past', i < head);
            bar.classList.toggle('is-live', i === head);
        });

        time.textContent = clock(audio.duration - audio.currentTime);
    };

    btn.addEventListener('click', () => {
        if (audio.paused) {
            audio.play().catch(() => { /* navegador bloqueou: ignora em silêncio */ });
        } else {
            audio.pause();
        }
    });

    audio.addEventListener('play',  () => { wrap.classList.add('is-playing'); btn.setAttribute('aria-label', 'Pausar prévia'); });
    audio.addEventListener('pause', () => { wrap.classList.remove('is-playing'); btn.setAttribute('aria-label', 'Tocar prévia'); });
    audio.addEventListener('timeupdate', paintProgress);

    audio.addEventListener('ended', () => {
        audio.currentTime = 0;
        paintProgress();
    });

    // Clique na onda avança para o ponto escolhido
    wave.addEventListener('click', e => {
        if (!audio.duration) return;
        const box = wave.getBoundingClientRect();
        const ratio = Math.min(Math.max((e.clientX - box.left) / box.width, 0), 1);
        audio.currentTime = ratio * audio.duration;
        paintProgress();
    });
}

/* ── Partida ─────────────────────────────────────────────── */
function boot() {
    setupReveal();
    setupCounters();
    setupDust();
    setupParallax();
    setupHeader();
    setupDock();
    setupTicker();
    setupFAQ();
    setupPlayer();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
} else {
    boot();
}
