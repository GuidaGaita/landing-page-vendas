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

    const observar = rootMargin => new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-in');
            obs.unobserve(entry.target);
        });
    }, { threshold: 0, rootMargin });

    // Margem inferior positiva estende a área de observação para BAIXO da
    // tela: o elemento já começa a aparecer antes de entrar no campo de
    // visão, então quem rola encontra o conteúdo pronto em vez de esperar.
    const cedo = observar('0px 0px 14% 0px');

    // O contrário, para blocos altos (.reveal--late: os cartões das
    // etapas e suas etiquetas): só começam quando já estão 12% dentro
    // da tela. Com a margem de cima eles animavam ainda abaixo da dobra
    // e, no celular, chegavam "prontos" — ninguém via a entrada.
    const tarde = observar('0px 0px -12% 0px');

    targets.forEach(el => {
        (el.classList.contains('reveal--late') ? tarde : cedo).observe(el);
    });
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

/* ── Partículas do hero ──────────────────────────────────────
   Moraram aqui como setupDust(). Agora vivem no hero-fx.js, um
   arquivo à parte: é só decoração, tem três presets (vento, fumaça,
   brasas) e é o trecho mais provável de ser trocado de novo.
   ─────────────────────────────────────────────────────────── */

/* ── VSL: fachada → vídeo ────────────────────────────────────
   O <video> nasce com preload="none": zero bytes até o clique. O
   que o visitante vê é o pôster com o botão de play. No clique os
   dois somem, os controles nativos entram e o vídeo toca com som —
   permitido porque o clique é um gesto do usuário (no iOS também,
   graças ao playsinline do HTML). Quem mede o play e o progresso é
   o pixel.js, ouvindo o próprio <video>.
   ─────────────────────────────────────────────────────────── */
function setupVSL() {
    const box = document.querySelector('.vsl');
    const video = document.getElementById('vsl');
    const play = box?.querySelector('.vsl__play');
    if (!box || !video || !play) return;

    play.addEventListener('click', () => {
        box.classList.add('is-playing');
        video.controls = true;
        const pedido = video.play();
        // Se o navegador recusar (raro, já que houve clique), os
        // controles nativos já estão à vista para o visitante tentar.
        if (pedido && typeof pedido.catch === 'function') pedido.catch(() => {});
    });

    // Terminou: volta o pôster, para a moldura não ficar num quadro
    // preto — e o botão deixa rever do começo.
    video.addEventListener('ended', () => {
        box.classList.remove('is-playing');
        video.controls = false;
    });
}

/* ── Parallax suave nas fotos emolduradas ────────────────── */
function setupParallax() {
    const layers = document.querySelectorAll('[data-parallax]');
    if (!layers.length || REDUCED || window.innerWidth < 940) return;

    let ticking = false;

    /* Primeiro mede tudo, só então escreve. Medir e escrever alternadamente
       no mesmo laço faz cada escrita sujar o layout e a leitura seguinte
       forçar um recálculo síncrono — de graça, no meio da rolagem. */
    const apply = () => {
        const vh = window.innerHeight;
        const mid = vh / 2;

        const writes = [];
        layers.forEach(el => {
            const box = el.getBoundingClientRect();
            // Só calcula o que está por perto da viewport
            if (box.bottom < -200 || box.top > vh + 200) return;

            const offset = (box.top + box.height / 2 - mid) * Number(el.dataset.parallax);
            writes.push([el, offset]);
        });

        // Propriedade `translate` em vez de `transform`: não conflita
        // com a leve rotação que o CSS já aplica na moldura.
        writes.forEach(([el, offset]) => {
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

/* ── Cabeçalho que surge depois do hero ──────────────────────
   Aparece quando o hero sai da tela, não numa altura fixa: com a
   VSL o hero ficou mais alto, e "75% da viewport" cairia no meio do
   vídeo. O IntersectionObserver diz exatamente quando ele saiu; a
   margem negativa antecipa um pouco, para o cabeçalho já estar lá
   quando a faixa rolante aparece. Sem observer, o compasso antigo.
   ─────────────────────────────────────────────────────────── */
function setupHeader() {
    const header = document.getElementById('site-header');
    const hero = document.querySelector('.hero');
    if (!header) return;

    if (hero && 'IntersectionObserver' in window) {
        new IntersectionObserver(entries => {
            header.classList.toggle('is-visible', !entries[0].isIntersecting);
        }, { threshold: 0, rootMargin: '-80px 0px 0px 0px' }).observe(hero);
        return;
    }

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

/* ── Barra fixa pisca ao chegar em duas seções ───────────────
   O botão "Ver planos e valores" fica sempre à vista no celular e
   por isso não pulsa o tempo todo (seria ruído). Em dois momentos
   ele pisca uma vez — o reflexo e a brasa do botão do hero — para
   lembrar que existe: quando a trilha entra e quando os depoimentos
   entram. A margem negativa espera o topo da seção chegar aos 65%
   da tela, ou seja, o título já legível, não o primeiro pixel.
   ─────────────────────────────────────────────────────────── */
function setupDockFlash() {
    const btn = document.querySelector('.btn--dock');
    if (!btn || REDUCED || !('IntersectionObserver' in window)) return;

    const alvos = ['#trilha', '#depoimentos']
        .map(sel => document.querySelector(sel))
        .filter(Boolean);
    if (!alvos.length) return;

    // A classe sai no fim da animação mais longa (a do próprio botão),
    // para a próxima seção poder piscar de novo. As animações dos
    // pseudo-elementos também avisam aqui, por isso o filtro pelo nome.
    btn.addEventListener('animationend', e => {
        if (e.animationName === 'dock-pop') btn.classList.remove('is-flashing');
    });

    const io = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            obs.unobserve(entry.target);
            btn.classList.add('is-flashing');
        });
    }, { threshold: 0, rootMargin: '0px 0px -35% 0px' });

    alvos.forEach(el => io.observe(el));
}

/* ── Faixa rolante: duplica até fechar o ciclo ───────────── */
function setupTicker() {
    const track = document.getElementById('ticker-track');
    if (!track) return;

    const group = track.querySelector('.ticker__group');
    if (!group) return;

    /* Mede UMA vez e calcula quantas cópias faltam.

       Antes isto era um laço que lia `track.scrollWidth`, inseria uma
       cópia e lia de novo. Cada inserção suja o layout, então a leitura
       seguinte obrigava o navegador a recalcular tudo na hora — até 12
       recálculos síncronos em sequência, durante o carregamento. É o
       "reflow forçado" que o relatório aponta. */
    const larguraGrupo = group.getBoundingClientRect().width;

    // Quantos grupos cobrem 1,5x a tela (o original já está no DOM).
    // Teto de 12 para não explodir se a medida vier zerada.
    const porVolta = larguraGrupo > 0
        ? Math.min(Math.max(Math.ceil((window.innerWidth * 1.5) / larguraGrupo), 1), 12)
        : 1;

    // Completa a volta — um fragmento entra no DOM de uma vez só
    const volta = document.createDocumentFragment();
    for (let i = 1; i < porVolta; i++) volta.appendChild(group.cloneNode(true));
    track.appendChild(volta);

    // Espelha a volta inteira: a animação de -50% fecha sem emenda
    const espelho = document.createDocumentFragment();
    [...track.children].forEach(el => espelho.appendChild(el.cloneNode(true)));
    track.appendChild(espelho);
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
        // No celular o fundo é uma faixa de altura fixa (ver "Fundos no
        // celular" no styles.css) e não reage ao acordeão; a trava só
        // atrapalharia, então sai do caminho — inclusive se a janela
        // acabou de encolher e deixou um valor antigo para trás.
        if (window.innerWidth < 940) { bg.style.height = ''; return; }
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

/* ── Parâmetros de campanha até o checkout ───────────────────
   O pixel mede o funil aqui dentro, mas a venda acontece no
   payfast.greenn.com.br — outro domínio. Sem repassar a origem
   no próprio link, quem chega por anúncio cai num checkout que
   não sabe de onde veio, e o relatório do Greenn não diz qual
   campanha vendeu.

   Passa só o que é rastreamento. Repassar a query inteira
   deixaria qualquer um forjar uma URL da landing e injetar
   parâmetro na página de pagamento — cupom, prefill, o que o
   Greenn aceitasse.
   ─────────────────────────────────────────────────────────── */

/* O prefixo `utm_` cobre source, medium, campaign, content, term
   e qualquer variante nova sem precisar mexer aqui. O resto são
   os identificadores de clique de cada plataforma de anúncio,
   mais os campos livres que o Greenn lê. Plataforma nova? Some
   o click id dela nesta lista. */
const RASTREIO = [
    'fbclid',                     // Meta — Facebook e Instagram
    'gclid', 'gbraid', 'wbraid',  // Google Ads (os dois últimos, iOS)
    'ttclid',                     // TikTok
    'msclkid',                    // Microsoft / Bing
    'igshid',                     // Instagram
    'src', 'sck', 'ref'           // campos livres do Greenn
];

const ehRastreio = chave => {
    const k = chave.toLowerCase();
    return k.startsWith('utm_') || RASTREIO.includes(k);
};

function setupCheckoutParams() {
    const entrada = new URLSearchParams(location.search);
    if (!entrada.toString()) return;

    // Reescreve o href na carga, e não no clique: assim abrir em
    // nova aba, copiar o endereço e o clique do meio levam os
    // parâmetros também — um handler de clique só pegaria o
    // clique comum.
    document.querySelectorAll('a[href*="payfast.greenn.com.br"]').forEach(link => {
        const destino = new URL(link.href);

        entrada.forEach((valor, chave) => {
            if (!ehRastreio(chave)) return;
            // O que já está no link é configuração da oferta
            // (ch_id, b_id_1) e manda. Parâmetro de URL não
            // sobrescreve oferta.
            if (destino.searchParams.has(chave)) return;
            destino.searchParams.set(chave, valor);
        });

        link.href = destino.toString();
    });
}

/* ── Partida ─────────────────────────────────────────────── */
function boot() {
    setupReveal();
    setupCounters();
    setupVSL();
    setupParallax();
    setupHeader();
    setupDock();
    setupDockFlash();
    setupTicker();
    setupFAQ();
    setupCheckoutParams();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
} else {
    boot();
}
