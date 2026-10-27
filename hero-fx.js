/* ═══════════════════════════════════════════════════════════
   GuidaGaita — partículas do hero

   Só decoração: um canvas atrás do conteúdo da primeira tela. A
   página funciona sem isto, e com "prefers-reduced-motion" o
   arquivo não faz nada (o CSS já esconde o canvas).

   O efeito é escolhido pelo atributo data-fx do <canvas>:

       vento   poeira de estrada atravessando o quadro, com
               rajadas — a cena do duelo (padrão)
       fumaca  vapor do trem subindo devagar
       brasas  os pontos de luz que o hero tinha antes

   Cada preset é só um objeto de configuração; o motor (loop,
   pausa, DPR, redimensionamento) é um para os três. Para
   comparar, troque o atributo no index.html e recarregue.

   O movimento é integrado por tempo (dt em segundos), não por
   quadro: numa tela de 120 Hz a partícula anda na mesma
   velocidade que numa de 60. A versão anterior somava um
   deslocamento fixo por quadro e corria o dobro nos celulares
   de tela rápida.
   ═══════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var canvas = document.getElementById('dust');
    if (!canvas) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var hero = canvas.closest('.hero');
    var ctx = canvas.getContext('2d');
    if (!hero || !ctx) return;

    var rnd = function (a, b) { return a + Math.random() * (b - a); };

    /* ── Sprites ─────────────────────────────────────────────
       Cada partícula é um drawImage de um canvas pequeno pintado
       uma única vez. Criar um gradiente por partícula por quadro
       é o que tornaria qualquer densidade cara. */
    function halo(tamanho, paradas) {
        var c = document.createElement('canvas');
        c.width = c.height = tamanho;
        var g = c.getContext('2d');
        var grad = g.createRadialGradient(tamanho / 2, tamanho / 2, 0, tamanho / 2, tamanho / 2, tamanho / 2);
        paradas.forEach(function (p) { grad.addColorStop(p[0], p[1]); });
        g.fillStyle = grad;
        g.fillRect(0, 0, tamanho, tamanho);
        return c;
    }

    /* Risco: o mesmo halo, esticado na horizontal. É a poeira vista
       de lado, arrastada pelo vento. */
    function risco(largura, altura, paradas) {
        var c = document.createElement('canvas');
        c.width = largura;
        c.height = altura;
        var g = c.getContext('2d');
        g.scale(largura / altura, 1);
        var grad = g.createRadialGradient(altura / 2, altura / 2, 0, altura / 2, altura / 2, altura / 2);
        paradas.forEach(function (p) { grad.addColorStop(p[0], p[1]); });
        g.fillStyle = grad;
        g.fillRect(0, 0, altura, altura);
        return c;
    }

    /* ── Presets ─────────────────────────────────────────────
       Contrato: count(w, h) → quantas; sprites() → canvases;
       spawn(p, w, h, inicio) → preenche uma partícula (inicio =
       true na semeadura, para espalhar pelo palco em vez de todas
       nascerem na borda); antes(t) → uma vez por quadro, opcional;
       step(p, dt, t, w, h) → move e calcula p.alpha; draw(ctx, p,
       sprites) → pinta. Velocidades em px/s. */
    var PRESETS = {

        /* Vento: poeira de duelo. Riscos curtos cruzando o quadro da
           esquerda para a direita, mais densos perto do chão, em três
           profundidades (tamanho, velocidade e alpha crescem juntos),
           com rajadas a cada 5-11 s. Sem "lighter": poeira não emite
           luz, só fica iluminada por trás. */
        vento: {
            composite: 'source-over',
            count: function (w, h) { return Math.min(Math.round(w * h / 9000), w < 700 ? 70 : 130); },
            sprites: function () {
                return [
                    risco(64, 10, [[0, 'rgba(244, 235, 221, .95)'], [.45, 'rgba(232, 200, 160, .4)'], [1, 'rgba(226, 98, 44, 0)']]),
                    halo(16, [[0, 'rgba(247, 204, 114, .95)'], [.4, 'rgba(232, 200, 160, .35)'], [1, 'rgba(232, 200, 160, 0)']])
                ];
            },
            rajada: { inicio: -9, dur: 1.5, proxima: 2.5 },
            v: 1,
            antes: function (t) {
                var r = this.rajada;
                if (t >= r.proxima) {
                    r.inicio = t;
                    r.dur = rnd(1.2, 2.2);
                    r.proxima = t + r.dur + rnd(5, 11);
                }
                var f = (t - r.inicio) / r.dur;
                var sopro = (f >= 0 && f <= 1) ? Math.sin(f * Math.PI) * 1.3 : 0;
                this.v = 1 + .3 * Math.sin(t * .25) + sopro;
            },
            spawn: function (p, w, h, inicio) {
                var z = Math.random();                    // 0 longe, 1 perto
                p.z = z;
                p.sprite = Math.random() < .8 ? 0 : 1;    // risco ou grão
                p.len = p.sprite === 0 ? 18 + z * 46 : 3 + z * 5;
                p.alt = p.sprite === 0 ? 2 + z * 4 : p.len;
                p.vx = 50 + z * 150;
                p.vy = rnd(-10, 10);
                p.a = .08 + z * .32;
                p.fase = rnd(0, Math.PI * 2);
                // Viés para baixo: mais poeira perto do chão
                p.y = h * (1 - Math.pow(Math.random(), 1.6) * .85);
                p.x = inicio ? Math.random() * w : -p.len - Math.random() * w * .2;
            },
            step: function (p, dt, t, w, h) {
                p.x += p.vx * this.v * dt;
                p.y += (p.vy + Math.sin(p.fase + t * 1.7) * 8) * dt;
                if (p.x > w + p.len) this.spawn(p, w, h, false);
                if (p.y < -20) p.y = h + 10;
                if (p.y > h + 20) p.y = -10;
                p.alpha = p.a * (.7 + .3 * Math.sin(p.fase + t * 2.3)) * Math.min(1, .55 + this.v * .3);
            },
            draw: function (ctx, p, sprites) {
                ctx.globalAlpha = p.alpha;
                ctx.drawImage(sprites[p.sprite], p.x - p.len / 2, p.y - p.alt / 2, p.len, p.alt);
            }
        },

        /* Fumaça: vapor do trem. Poucas nuvens grandes e lentas, que
           nascem embaixo, sobem com deriva, crescem e somem. Cara por
           pixel (áreas grandes), por isso tão poucas. */
        fumaca: {
            composite: 'source-over',
            count: function (w) { return w < 700 ? 9 : 14; },
            sprites: function () {
                return [halo(256, [
                    [0, 'rgba(214, 196, 178, .6)'], [.35, 'rgba(190, 170, 150, .25)'],
                    [.7, 'rgba(160, 140, 120, .07)'], [1, 'rgba(140, 120, 100, 0)']
                ])];
            },
            spawn: function (p, w, h, inicio) {
                p.r = rnd(50, 150);
                p.vida = rnd(10, 18);
                p.idade = inicio ? Math.random() * p.vida : 0;
                p.x = rnd(-.1, 1.1) * w;
                p.y = h + p.r * .3 - (inicio ? Math.random() * h * .6 : 0);
                p.vx = rnd(-10, 14);
                p.vy = -rnd(14, 28);
                p.cresce = rnd(5, 11);
                p.a = rnd(.05, .12);
            },
            step: function (p, dt, t, w, h) {
                p.idade += dt;
                if (p.idade >= p.vida) { this.spawn(p, w, h, false); return; }
                p.x += p.vx * dt;
                p.y += p.vy * dt;
                p.r += p.cresce * dt;
                p.alpha = p.a * Math.sin(Math.PI * p.idade / p.vida);
            },
            draw: function (ctx, p, sprites) {
                ctx.globalAlpha = p.alpha;
                ctx.drawImage(sprites[0], p.x - p.r, p.y - p.r, p.r * 2, p.r * 2);
            }
        },

        /* Brasas: o efeito anterior, só migrado para tempo. As
           velocidades antigas eram por quadro (a 60 Hz): ×60 vira px/s. */
        brasas: {
            composite: 'lighter',
            count: function (w, h) { return Math.min(Math.round(w * h / 6500), w < 700 ? 70 : 75); },
            sprites: function () {
                return [halo(64, [
                    [0, 'rgba(255, 228, 178, 1)'], [.26, 'rgba(246, 186, 112, .6)'],
                    [.58, 'rgba(228, 124, 56, .17)'], [1, 'rgba(226, 98, 44, 0)']
                ])];
            },
            spawn: function (p, w, h, inicio) {
                var brasa = Math.random() < .3;
                p.x = Math.random() * w;
                p.y = inicio ? Math.random() * h : h + 14;
                p.r = brasa ? rnd(2.4, 5) : rnd(.6, 2.2);
                p.vx = (Math.random() - .5) * (brasa ? .14 : .26) * 60;
                p.vy = -(Math.random() * (brasa ? .16 : .3) + .04) * 60;
                p.a = brasa ? rnd(.62, .97) : rnd(.32, .74);
                p.pulso = rnd(0, Math.PI * 2);
                p.ritmo = rnd(.008, .022) * 60;
                p.balanco = rnd(.25, .75);
            },
            step: function (p, dt, t, w, h) {
                p.pulso += p.ritmo * dt;
                p.x += (p.vx + Math.sin(p.pulso) * p.balanco * 7.2) * dt;
                p.y += p.vy * dt;
                if (p.y < -14) { p.y = h + 14; p.x = Math.random() * w; }
                if (p.x < -14) p.x = w + 14;
                if (p.x > w + 14) p.x = -14;
                p.alpha = Math.max(p.a * (.7 + .3 * Math.sin(p.pulso)), 0);
            },
            draw: function (ctx, p, sprites) {
                var d = p.r * 7.5;
                ctx.globalAlpha = p.alpha;
                ctx.drawImage(sprites[0], p.x - d / 2, p.y - d / 2, d, d);
            }
        }
    };

    /* ── Motor ─────────────────────────────────────────────── */
    var preset = PRESETS[canvas.dataset.fx] || PRESETS.vento;
    var sprites = preset.sprites();
    var parts = [];
    var cw = 0;   // medidas do palco, lidas só no seed(): medir a cada
    var ch = 0;   // quadro obrigaria o navegador a refazer o layout
    var raf = null;
    var ultimo = 0;
    var t = 0;

    function seed() {
        var dpr = Math.min(window.devicePixelRatio || 1, 2);
        var w = hero.offsetWidth;
        var h = hero.offsetHeight;
        cw = w;
        ch = h;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        var n = preset.count(w, h);
        parts = [];
        for (var i = 0; i < n; i++) {
            var p = {};
            preset.spawn(p, w, h, true);
            parts.push(p);
        }
    }

    function quadro(agora) {
        // Teto de 50 ms: ao voltar de uma aba oculta, o primeiro quadro
        // não "salta" as partículas para fora do palco.
        var dt = Math.min((agora - ultimo) / 1000, .05);
        ultimo = agora;
        t += dt;

        ctx.clearRect(0, 0, cw, ch);
        ctx.globalCompositeOperation = preset.composite;
        if (preset.antes) preset.antes(t);
        for (var i = 0; i < parts.length; i++) {
            preset.step(parts[i], dt, t, cw, ch);
            preset.draw(ctx, parts[i], sprites);
        }
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
        raf = requestAnimationFrame(quadro);
    }

    function start() {
        if (raf) return;
        ultimo = performance.now();
        raf = requestAnimationFrame(quadro);
    }

    function stop() {
        if (!raf) return;
        cancelAnimationFrame(raf);
        raf = null;
    }

    seed();
    start();

    // Só anima enquanto o hero estiver na tela...
    var visivel = true;
    if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
            visivel = entries[0].isIntersecting;
            if (visivel && !document.hidden) start(); else stop();
        }, { threshold: 0 }).observe(hero);
    }

    // ...e enquanto a aba estiver em primeiro plano
    document.addEventListener('visibilitychange', function () {
        if (document.hidden || !visivel) stop(); else start();
    });

    var resizeTimer;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
            seed();
            if (visivel && !document.hidden) start();
        }, 200);
    }, { passive: true });
})();
