/* ═══════════════════════════════════════════════════════════
   GuidaGaita — brasas das páginas de obrigado
   Único script das rotas /obrigado e /obrigado-gaita.

   Só decoração: a manchete, o cartão e os próximos passos são
   HTML e CSS puros, então a página inteira funciona sem isto.
   Por isso também sai de cena quando o visitante pede menos
   movimento — pontinhos subindo sem parar são exatamente o tipo
   de animação que a preferência existe para evitar.
   ═══════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var box = document.getElementById('embers');
    if (!box) return;

    /* Menos brasas no celular: são 16 camadas animadas o tempo
       todo, e lá elas dividem a GPU com o giro do sol e o grão. */
    var count = window.innerWidth < 700 ? 10 : 16;

    /* Tudo montado fora do documento e inserido de uma vez, para
       não provocar um recálculo de layout por partícula. */
    var frag = document.createDocumentFragment();

    for (var i = 0; i < count; i++) {
        var ember = document.createElement('span');
        var size = 3 + Math.random() * 7;

        ember.style.width = size + 'px';
        ember.style.height = size + 'px';
        ember.style.left = (Math.random() * 100) + 'vw';
        ember.style.animationDuration = (11 + Math.random() * 13) + 's';
        /* Atraso negativo: em vez de a tela começar vazia e ir
           enchendo, cada brasa entra já no meio do próprio
           percurso — a fogueira parece estar acesa desde antes. */
        ember.style.animationDelay = '-' + (Math.random() * 14) + 's';

        frag.appendChild(ember);
    }

    box.appendChild(frag);
})();
