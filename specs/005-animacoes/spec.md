# 005 — Mais animação, no lugar certo

**Status:** concluída (a tipografia da 003 pode pedir ajuste fino nos atrasos do hero)
**Toca:** styles.css · scripts.js (`setupReveal`) · index.html (classes e `--i` nos spans) · README.md

## Contexto

A página já tem bastante movimento: revelação ao rolar, contadores,
poeira, parallax no retrato, ticker, brasa pulsando nos botões, reflexo
no hover, fita da oferta, gaitas flutuando, selo girando, FAQ abrindo. O
que falta não é quantidade — é **coreografia**: hoje tudo entra do
mesmo jeito (fade + 13 px para cima, `.42s`, em 37 elementos `.reveal`),
então os momentos importantes (a manchete, o preço, a garantia) entram
igual a um parágrafo qualquer.

Princípio para tudo abaixo: **animação numa página de venda serve para
levar o olho até o CTA e para contar a história (trilhos, duelo,
brasa).** O que não faz uma dessas duas coisas é ruído. Nada aqui atrasa
a leitura: toda entrada dura ≤ .7 s e começa quando o elemento aparece;
as de ambiente são as que já existem.

## Objetivo

Um vocabulário de cinco entradas (em vez de uma), aplicado onde cada uma
conta a história, mais dois efeitos de ambiente ligados ao scroll. Tudo
em `opacity`, `transform` e `clip-path`; tudo desligado pelo
`prefers-reduced-motion` que já existe (`styles.css:2035-2050`).

## Requisitos

- R1. Só propriedades compostas na GPU: `opacity`, `transform`,
  `clip-path`, e `background-size` num sublinhado pequeno. Nada de
  `box-shadow`, `filter`, `top`/`left` ou `height` animados.
- R2. Tudo entra pelo mesmo `IntersectionObserver` de hoje
  (`setupReveal`, `scripts.js:12-33`): `.reveal` ganha modificadores; o
  JS não muda.
- R3. Stagger por CSS (`--i`, `--d`, `nth-child`), não por JS.
- R4. Reduced motion: estático e visível, como hoje.
- R5. Sem JS tudo continua visível (portão `.js`).
- R6. Sem tarefa longa; sem CLS — nenhuma entrada muda o tamanho do
  elemento no fluxo (`transform` só).

## Fora de escopo

- Cursor customizado, "cortina" de carregamento, parallax em texto.
  Custam conversão.
- Partículas (004).

## Decisões já tomadas

- A manchete do hero entra palavra por palavra com `--i` em `<span>`,
  **igual ao que a página de obrigado já faz**
  (`obrigado/index.html:63-67`). Consistência entre as páginas.
- O preço entra com "carimbo"; o selo da garantia também. É a metáfora
  do "acordo" e do "aperto de mão" das próprias seções.
- A corda pontilhada da trilha vira um `<svg>` com `stroke-dashoffset`
  que se desenha ao rolar: é a única animação nova que troca HTML além
  de classes.

## Plano

### Vocabulário (`styles.css`, bloco "REVELAÇÃO AO ROLAR")

| Classe | Entrada | Onde usar |
|---|---|---|
| `.reveal` | fade + 13 px (o de hoje) | padrão |
| `.reveal--words` | cada `<span style="--i:n">` sobe de `.6em` com opacidade, atraso `--i × 60ms` | h1 do hero, `.final__title` |
| `.reveal--stamp` | `scale(1.25) rotate(-4deg)` e opacidade 0 → `scale(1) rotate(0)`, ease com overshoot (`cubic-bezier(.2, 1.3, .4, 1)`), .55 s | `.offer__big`, `.offer__badge`, `.warranty__seal`, `.turn` |
| `.reveal--wipe` | `clip-path: inset(0 100% 0 0)` → `inset(0)` | `.ticker` ao entrar, `.card__tag`, `.offer__title` |
| `.reveal--side` | entra de −28 px (ímpar) ou +28 px (par) | `.quote` — os dois depoimentos entram de lados opostos |
| `.checks--stagger` | cada `li` entra com `nth-child(n) × 55ms`; a caixinha (`::before`) faz `scale(.4) → 1` 120 ms depois do texto, "vai marcando" | listas dos cartões de oferta e das etapas |

Realce da palavra dourada: `.ink-gold` e `.ink-rust` dentro de um título
`.is-in` ganham um sublinhado que cresce (`background-image` de cor
dourada, `background-size: 0% 2px → 100% 2px`, .5 s, com atraso após a
entrada do título). Barato, sem layout.

### Hero (depois da 002)

1. Eyebrow: as estrelas acendem (`star-glow` já existe; só atrasar o
   início).
2. h1 em `.reveal--words`, em três ou quatro grupos: "No duelo entre
   você", "e a gaita,", "só falta você sacar.". O grupo dourado entra
   por último, com o sublinhado.
3. VSL: `.reveal` com `--d` logo após a manchete. O pôster aparece e o
   botão de play faz `scale(.8) → 1` com overshoot .4 s depois.
4. CTA: `.reveal` e, 1,2 s depois de entrar, **um** `sheen` (keyframes
   já existem, `styles.css:517`). Puxa o olho uma vez e para. Não
   repetir.
5. Stats: contadores como hoje.

### Trilha (seção 4)

- `.trail__rope`, hoje um `background-image` tracejado
  (`styles.css:2005-2016`), vira `<svg class="trail__rope"><path/></svg>`
  com `stroke-dasharray` tracejado e `pathLength="1"`; `stroke-dashoffset:
  1 → 0` em 1,4 s quando `.trail` fica `.is-in`. Os três `.card` entram
  com `--d` de 0, 350 e 700 ms, sincronizados com a corda passando por
  eles: **estações sendo ligadas pelos trilhos**.
- O `.card__tag` ("Etapa 01") entra com `.reveal--wipe`.

### Oferta (seção 7)

- Cartões `.reveal` como hoje. Dentro: `.offer__title` em
  `.reveal--wipe`; `.offer__big` em `.reveal--stamp` (`--d` 250 ms);
  `.offer__badge` em `.reveal--stamp` (400 ms); lista em
  `.checks--stagger`; botão `.reveal` por último, com um `sheen`.
- O observer já pega qualquer `.reveal`, inclusive filhos de outro
  `.reveal`. Nada muda no JS.

### Garantia (seção 8)

- `.warranty__seal` em `.reveal--stamp`, com pouso mais forte
  (`scale(1.6) → 1`, .6 s). O selo continua girando devagar depois (já
  existe).

### Ambiente ligado ao scroll, sem JS

```css
@supports (animation-timeline: view()) {
    .section-bg {
        inset: -7% 0;
        animation: bg-drift linear both;
        animation-timeline: view();
    }
    @keyframes bg-drift {
        from { transform: translateY(-4%); }
        to   { transform: translateY(4%); }
    }
}
```

Paralaxe sutil em todos os fundos fotográficos, só onde o navegador
suporta (Chrome e Edge; Safari e Firefox recentes). Custo: zero JS; a
camada já é composta. **Exceção: a seção do FAQ**, cuja altura do fundo é
travada por JS (`scripts.js:326-358`): o `inset` negativo conflita com o
`height` inline. Excluir `.section--faq .section-bg` da regra, ou travar
o `height` em `offsetHeight × 1.14`.

Segundo efeito: `.hero__photo` desce 10 % mais devagar que o scroll, pelo
mesmo mecanismo, com `view()` no hero. Dá profundidade atrás do vídeo.

### Pontas soltas que valem resolver junto

- `.js .reveal { will-change: opacity, transform }` (`styles.css:1766`)
  cria 37 camadas compostas desde a carga. Transições de .4 s não
  precisam de `will-change`. Tirar.
- O parallax em JS do retrato do mentor (`data-parallax`,
  `scripts.js:195-234`) pode migrar para `animation-timeline`, e o
  `setupParallax` sai. Menos JS por scroll.

## Tarefas

- [x] CSS: os cinco modificadores + `.checks--stagger` + sublinhado da palavra dourada
- [x] `index.html`: classes nos pontos listados; `--i` nos spans do h1 e do título final; `<svg>` da corda
- [x] `styles.css`: corda em SVG; remover o `background-image` tracejado
- [x] Hero: coreografia (após a 002)
- [x] Oferta e garantia: carimbos e stagger
- [x] `@supports (animation-timeline)`: deriva dos fundos e do hero; tratar o FAQ
- [x] Remover `will-change` do `.reveal` (o `setupParallax` ficou: funciona e custa pouco)
- [x] README: seção "Movimento" (vocabulário, onde cada um é usado, o que não animar)
- [x] Verificação

## Verificação

- Performance (CPU 4×, mobile): rolagem inteira sem quadro > 50 ms;
  Lighthouse com CLS = 0.
- Cada entrada ocorre uma vez, no `is-in`, e nunca antes de o elemento
  estar a 14 % de entrar (o `rootMargin` de hoje).
- `prefers-reduced-motion`: tudo visível e parado; corda desenhada por
  inteiro.
- JS desligado: tudo visível.
- Safari iOS: `clip-path` e `animation-timeline`. O que não suportar cai
  no padrão sem quebrar.

## Registro de implementação (26/10/2026)

Tudo do plano entrou, com uma mudança de abordagem: as entradas usam as
propriedades individuais `translate`, `scale` e `rotate` em vez de
`transform`. Motivo: a regra antiga `.reveal.is-in { transform: none }`
vencia o `:hover` dos cartões (`.card:hover { transform: ... }`) e o
levantar no hover nunca funcionava depois da entrada — agora funciona.
A corda da trilha continuou um `<span>` com fundo tracejado (não virou
SVG): a cortina `.reveal--wipe` desenha igual, sem trocar HTML.
Verificado com rolagem lenta e animações ligadas: 52 `.reveal`, nenhum
preso invisível.

### Ajuste depois do primeiro teste no celular (26/10/2026)

- Os cartões das etapas chegavam "prontos" e demorando: o escalonamento
  de 0/350/700 ms, pensado para os três lado a lado, valia também
  empilhados, e a margem de +14 % os disparava ainda abaixo da dobra.
  Agora são `.reveal--late` (observer próprio, só com o bloco 12 % dentro
  da tela), sobem 28 px em vez de 13 px, e o `--d` da sequência vive no
  CSS a partir de 620 px.
- A barra fixa "Ver planos e valores" pisca uma vez ao chegar na trilha e
  outra nos depoimentos (`setupDockFlash`, classe `is-flashing`): o
  reflexo do botão do hero duas vezes, mais a brasa e um leve inchar.

### Película sobre as fotos (26/10/2026)

Pedido depois do primeiro teste: "um filtro rústico bem de leve em cima da
foto durante o scroll". Entrou como duas camadas dentro de cada foto de
fundo e da foto do hero (bloco "PELÍCULA" do `styles.css`): riscos e
poeira de filme velho em `mix-blend-mode: screen`, e um vazamento de luz
quente que atravessa a foto por linha do tempo de rolagem, apagando nas
pontas. Só `transform` e `opacity`; sem suporte a `animation-timeline`,
fica parado em intensidade baixa; com movimento reduzido, parado também.
Intensidade pela variável `--leak` (0,42; 0,65 no hero) e pela `opacity`
dos riscos (0,12). Os riscos só deslizam no desktop, para não somar uma
camada composta por foto no celular.

### Foto que revela, no lugar da película (26/10/2026)

Entre as alternativas, a escolha foi "a foto que revela": cada foto de
fundo e a do hero entram em sépia monocromático e ganham cor conforme
sobem pela tela, voltando ao sépia ao sair por cima. Duas camadas dentro
do elemento com um tom sépia em `mix-blend-mode: color`, animando só
`opacity` nos intervalos `entry` e `exit` da linha do tempo de rolagem
(bloco "FOTO QUE REVELA" do `styles.css`). Os riscos e o vazamento de luz
da película saíram. Sem suporte a `animation-timeline`, sépia leve e
fixo; com movimento reduzido, idem. Ajuste por `--sepia` e `--sepia-cor`.

**Correção que veio junto:** as linhas do tempo de rolagem não reagiam.
O `overflow: hidden` das seções cria um contêiner de rolagem, e o
`view()` passava a medir a foto dentro da seção, que nunca rola — o
efeito congelava no meio do curso (a deriva dos fundos no desktop e a
película anterior estavam paradas, e a medição anterior pegou um valor
fixo). Agora `.has-bg`, `.hero` e `.section--final` usam
`overflow: clip`, que recorta sem criar contêiner, com `hidden` de
fallback. Medido de novo: entrando ≈ 1, dentro 0, saindo sobe a 1.

Ajuste de visibilidade: o blend passou de `color` para `multiply`
(`--sepia-cor: #B8946A`). Só tirar a cor por baixo do véu escuro passava
batido; escurecer junto faz a foto "revelar" de verdade.

### Botões de checkout sem atraso (27/10/2026)

No desktop os dois botões de checkout demoravam a aparecer: além do
fade de 420 ms, cada um esperava `--d: 520ms`, e ficavam invisíveis por
300 a 600 ms depois de entrar na tela, com a nota "Compra segura" já à
vista logo abaixo. Agora são `.reveal--pronto`: sempre visíveis, junto
com o cartão; o observer só marca a chegada para o reflexo (que vem
0,5 s depois, não 1 s). Medido: opacidade 1 no primeiro quadro, contra
0 a 0,09 nos primeiros 150 ms antes.

De carona, o `.js .reveal` trocava a transição inteira dos botões com
entrada por `opacity + translate`, e o hover (subir 3 px, sombra) pulava
sem suavidade. `.js .btn--solid.reveal` agora soma as duas.
