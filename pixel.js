/* ═══════════════════════════════════════════════════════════
   GuidaGaita — Meta Pixel

   Único arquivo de medição do site, compartilhado pelas três
   páginas: a home, /obrigado e /obrigado-gaita. Cada uma o
   carrega no <head> e ele descobre sozinho onde está.

   Está num arquivo só, e não colado no <head> de cada página,
   porque o ID e os eventos precisam de uma fonte de verdade
   única — snippet copiado em três lugares é o tipo de coisa que
   alguém atualiza em dois e esquece no terceiro, e aí as
   páginas passam a medir coisas diferentes sem ninguém notar.

   ATENÇÃO: o ID abaixo também aparece no <noscript> das três
   páginas. São quatro lugares no total. Trocou o pixel, troque
   nos quatro.
   ═══════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var PIXEL_ID = '1397849958862391';

    /* As duas ofertas. O `slug` é o trecho que identifica cada
       uma no link do Greenn — é por ele que descobrimos qual
       plano o visitante clicou, sem precisar marcar o HTML. */
    var OFERTAS = {
        combo: {
            slug:  'r3k5wcq',
            valor: 347,
            nome:  'Método GuidaGaita + gaita Easttop T104S'
        },
        curso: {
            slug:  '6z65zng',
            valor: 297,
            nome:  'Método GuidaGaita completo'
        }
    };
    /* Preços de 26/10/2026. O slug é o primeiro trecho do link
       (payfast.greenn.com.br/<slug>/offer/<id>): quando o Greenn
       gera um link novo para a mesma oferta, muda o <id> e o slug
       fica — foi o que aconteceu nessa troca. Se um dia o slug
       mudar, o pixel para de reconhecer o plano: mude aqui também. */

    /* ── Código base da Meta ─────────────────────────────────
       Copiado literal da documentação. O que ele faz de
       importante é definir o fbq() como uma fila: eventos
       disparados antes de o fbevents.js terminar de baixar
       ficam guardados em vez de se perderem. */
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');

    fbq('init', PIXEL_ID);
    fbq('track', 'PageView');

    /* ── Atalhos ─────────────────────────────────────────────
       `track` é para os eventos que a Meta já conhece e usa para
       otimizar campanha; `custom` é para os nossos, que só
       aparecem em relatório. */
    function track(evento, params, opts) {
        if (opts) fbq('track', evento, params, opts);
        else fbq('track', evento, params);
    }

    function custom(evento, params) {
        fbq('trackCustom', evento, params);
    }

    function ofertaDoLink(href) {
        for (var chave in OFERTAS) {
            if (href.indexOf(OFERTAS[chave].slug) !== -1) return OFERTAS[chave];
        }
        return null;
    }

    /* ══════════ HOME ══════════ */

    /* ── Chegou na oferta ────────────────────────────────────
       ViewContent quando a seção de preços entra na tela. É a
       diferença entre "abriu a página" e "chegou até o preço".

       Sem IntersectionObserver o evento simplesmente não sai:
       disparar na carga responderia outra pergunta e mentiria
       a estatística. */
    function wireViewContent() {
        var alvo = document.getElementById('oferta');
        if (!alvo || !('IntersectionObserver' in window)) return;

        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                io.disconnect();
                track('ViewContent', {
                    content_name: 'Seção de oferta',
                    content_type: 'product_group',
                    currency: 'BRL'
                });
            });
        }, { threshold: 0.25 });

        io.observe(alvo);
    }

    /* ── Foi para o checkout ─────────────────────────────────
       Os dois botões do Greenn abrem em aba nova, então não há
       corrida entre o fbq() e a navegação: a aba atual não sai
       do lugar e o evento tem todo o tempo do mundo. */
    function wireCheckout() {
        var links = document.querySelectorAll('a[href*="payfast.greenn.com.br"]');

        Array.prototype.forEach.call(links, function (link) {
            link.addEventListener('click', function () {
                var oferta = ofertaDoLink(link.href);
                if (!oferta) return;

                track('InitiateCheckout', {
                    content_name: oferta.nome,
                    content_ids: [oferta.slug],
                    content_type: 'product',
                    value: oferta.valor,
                    currency: 'BRL',
                    num_items: 1
                });
            });
        });
    }

    /* ── Qual botão leva ao preço ────────────────────────────
       São cinco CTAs apontando para #oferta, espalhados pela
       página. Saber qual deles é clicado diz onde o argumento
       de venda fecha — e onde não fecha. */
    function origemDoCta(el) {
        if (el.closest('#site-header')) return 'header';
        if (el.closest('#dock')) return 'dock';
        if (el.closest('.hero')) return 'hero';
        if (el.closest('.section--final')) return 'final';

        var secao = el.closest('section[id]');
        return secao ? secao.id : 'outro';
    }

    function wireCtas() {
        var ctas = document.querySelectorAll('a[href="#oferta"]');

        Array.prototype.forEach.call(ctas, function (cta) {
            cta.addEventListener('click', function () {
                custom('CTAOferta', {
                    origem: origemDoCta(cta),
                    texto: cta.textContent.trim()
                });
            });
        });
    }

    /* ── Até onde rolou ──────────────────────────────────────
       Mesmo compasso do parallax do scripts.js: a rolagem só
       agenda, quem lê é o requestAnimationFrame. Medir a cada
       evento de scroll custaria um recálculo de layout por
       quadro, na mão do visitante. */
    function wireScroll() {
        var marcos = [25, 50, 75, 90];
        var proximo = 0;
        var ticking = false;

        var ler = function () {
            ticking = false;

            var alcance = document.documentElement.scrollHeight - window.innerHeight;
            if (alcance <= 0) return;

            var pct = (window.scrollY / alcance) * 100;

            /* Laço, não `if`: quem pula direto para o rodapé
               atravessou os quatro marcos, e todos contam. */
            while (proximo < marcos.length && pct >= marcos[proximo]) {
                custom('ScrollDepth', { percent: marcos[proximo] });
                proximo++;
            }

            if (proximo === marcos.length) window.removeEventListener('scroll', agendar);
        };

        var agendar = function () {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(ler);
        };

        window.addEventListener('scroll', agendar, { passive: true });
    }

    /* ── Que dúvida trava a compra ───────────────────────────
       Só a abertura interessa. Fechar de novo não é sinal de
       nada, e contaria a mesma pergunta duas vezes. */
    function wireFAQ() {
        var itens = document.querySelectorAll('details.faq__item');

        Array.prototype.forEach.call(itens, function (item) {
            item.addEventListener('toggle', function () {
                if (!item.open) return;

                var titulo = item.querySelector('summary');
                custom('FAQAberta', {
                    pergunta: titulo ? titulo.textContent.trim() : '(sem título)'
                });
            });
        });
    }

    /* ── A VSL ───────────────────────────────────────────────
       VSLPlay no primeiro play (uma vez por carga) e VSLProgresso
       nos quartos do vídeo. O <video> é nativo, então o tempo vem
       de graça no timeupdate; o 100 sai do `ended`, porque o último
       timeupdate costuma parar em 99,8%. O laço, e não um `if`,
       conta os marcos pulados por quem arrasta a barra. */
    function wireVSL() {
        var video = document.getElementById('vsl');
        if (!video) return;

        var deuPlay = false;
        var marcos = [25, 50, 75, 100];
        var proximo = 0;

        var marcar = function (pct) {
            while (proximo < marcos.length && pct >= marcos[proximo]) {
                custom('VSLProgresso', { pct: marcos[proximo] });
                proximo++;
            }
        };

        video.addEventListener('play', function () {
            if (deuPlay) return;
            deuPlay = true;
            custom('VSLPlay', { origem: 'hero' });
        });

        video.addEventListener('timeupdate', function () {
            if (!video.duration) return;
            marcar((video.currentTime / video.duration) * 100);
        });

        video.addEventListener('ended', function () { marcar(100); });
    }

    /* ══════════ PÁGINAS DE OBRIGADO ══════════ */

    /* O ideal é o eventID ser o número da transação: aí a Meta
       descarta duplicata até entre sessões e aparelhos
       diferentes. O Greenn pode anexar isso à URL de retorno,
       mas não há garantia — então varremos os nomes mais
       prováveis e, se nenhum vier, geramos um id de sessão. */
    function idDaCompra(oferta) {
        var busca = new URLSearchParams(location.search);
        var nomes = ['transaction_id', 'transaction', 'sale_id', 'order_id', 'id'];

        for (var i = 0; i < nomes.length; i++) {
            var valor = busca.get(nomes[i]);
            if (valor) return 'gg-' + oferta.slug + '-' + valor;
        }

        return 'gg-' + oferta.slug + '-' + Date.now() +
               '-' + Math.random().toString(36).slice(2, 8);
    }

    /* ── A venda ─────────────────────────────────────────────
       Uma por sessão e por oferta. Sem esta trava, cada F5 na
       página de obrigado vira uma venda nova no relatório — e o
       anúncio aprende com número inflado, que é pior do que não
       aprender. */
    function wirePurchase(oferta) {
        var chave = 'gg_purchase_' + oferta.slug;

        try {
            if (sessionStorage.getItem(chave)) return;
            sessionStorage.setItem(chave, '1');
        } catch (e) {
            /* Navegação anônima ou armazenamento bloqueado: segue
               em frente. O eventID ainda pega a duplicata do lado
               da Meta, desde que o Greenn mande o id da venda. */
        }

        track('Purchase', {
            content_name: oferta.nome,
            content_ids: [oferta.slug],
            content_type: 'product',
            value: oferta.valor,
            currency: 'BRL',
            num_items: 1
        }, { eventID: idDaCompra(oferta) });
    }

    /* ── Pediu a cor da gaita ────────────────────────────────
       Só existe em /obrigado-gaita: é o passo que falta para a
       encomenda sair. Quem comprou e não clicou aqui é gente
       para cobrar depois. */
    function wireWhatsApp() {
        var cta = document.querySelector('.wa-cta');
        if (!cta) return;

        cta.addEventListener('click', function () {
            track('Contact', { content_name: 'WhatsApp — cor da gaita' });
        });
    }

    /* ── Partida ─────────────────────────────────────────────
       A rota diz qual página é esta. O index.html some antes da
       comparação para o arquivo funcionar igual servido pela
       Hostinger e pelo servidor local. */
    function boot() {
        var rota = location.pathname.replace(/index\.html$/, '');

        if (document.getElementById('oferta')) {
            wireViewContent();
            wireCheckout();
            wireCtas();
            wireScroll();
            wireFAQ();
            wireVSL();
        }

        if (/\/obrigado-gaita\/?$/.test(rota)) {
            wirePurchase(OFERTAS.combo);
            wireWhatsApp();
        } else if (/\/obrigado\/?$/.test(rota)) {
            wirePurchase(OFERTAS.curso);
        }
    }

    /* Mesma guarda do scripts.js. Aqui ela é obrigatória: o
       <script> é async, então o DOMContentLoaded pode já ter
       passado quando este arquivo executa. */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
