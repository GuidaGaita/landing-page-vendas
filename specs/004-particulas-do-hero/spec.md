# 004 — Partículas do hero

**Status:** concluída — preset padrão `vento`; D1 e D2 ficam para você confirmar vendo os três rodando
**Toca:** scripts.js (`setupDust`, linhas 75–192) · styles.css (`.hero__dust`) · index.html (`<canvas id="dust">`) · README.md · (novo) hero-fx.js

## Contexto

O hero tem um canvas com ~70 pontos de luz subindo devagar: dois terços
"poeira", um terço "brasa", halo em sprite pré-desenhado, composição
`lighter`. É bonito, mas é genérico — "partícula brilhante subindo" é o
efeito padrão de qualquer template — e não conta a história da foto,
que é um duelo de faroeste ao lado de um trem.

Dois problemas técnicos no código atual, que a troca resolve de carona:

- **A velocidade depende da taxa de quadros** (`m.x += m.vx` a cada
  frame, `scripts.js:148-152`). Em tela de 120 Hz (iPhone Pro, Android
  de topo) a poeira anda duas vezes mais rápido. Integrar por tempo.
- **O efeito é um só e está hard-coded.** Comparar alternativas exige
  reescrever a função.

## Objetivo

Trocar o efeito por um que pertença à cena, sem perder o que já está
certo (pausa fora da tela e com aba oculta, teto de DPR, sprite
reaproveitado, `prefers-reduced-motion` desliga tudo) — e deixar o motor
com presets, para trocar de ideia custar uma palavra no HTML.

## Requisitos

- R1. Movimento por tempo, não por quadro: mesma velocidade a 60 e a
  120 Hz.
- R2. Preset escolhido por atributo: `<canvas id="dust" data-fx="vento">`.
  Presets são objetos de configuração, não `if`s no loop.
- R3. Orçamento: ≤ 80 partículas no celular, ≤ 140 no desktop; nenhum
  `createRadialGradient` dentro do loop; só `clearRect` + `drawImage`.
- R4. Continua pausando fora da tela, com aba oculta e no
  `prefers-reduced-motion` (canvas some via CSS, como hoje).
- R5. Não desenha por cima do vídeo da VSL (spec 002): o canvas fica em
  z-index 2 e o conteúdo em 3, como já é.
- R6. Sem tarefa longa > 50 ms e sem cair abaixo de 55 fps num Android
  intermediário rolando pelo hero.

## Fora de escopo

- Partículas em outras seções. A página de obrigado tem as brasas dela
  em `obrigado.js` e fica como está.
- WebGL ou shaders. Canvas 2D dá conta e não traz dependência.

## Entradas e decisões pendentes

| # | Pergunta | Quem responde | Recomendação |
|---|---|---|---|
| D1 | Qual preset vira o padrão: `vento` · `fumaca` · `brasas` (o atual, mantido como preset)? | você | `vento`: é o que o duelo pede. Decidir vendo os três rodando — R2 torna isso trivial (troca o atributo e recarrega) |
| D2 | Intensidade: discreta (quase não nota) ou presente (chama o olho)? | você | discreta. A partícula é ambiente; quem chama o olho é o CTA e, agora, o vídeo |

### Presets

**`vento` (recomendado) — poeira de duelo**
Poeira fina de estrada atravessando o quadro na horizontal, concentrada
na metade de baixo, com rajadas. As partículas são **riscos curtos** (o
sprite esticado no eixo do movimento), cor de areia iluminada por trás,
alpha baixo (.1 a .45), três profundidades (tamanho + velocidade +
alpha) para dar paralaxe. Vento = `base + sen(t × 0,25) × k + rajada`,
em que a rajada é um envelope de 1 a 2 s a cada 6 a 12 s. Sentido: da
esquerda para a direita. Sem `lighter`: poeira não emite luz;
`source-over` com cor quente.

**`fumaca` — vapor do trem**
De 8 a 14 nuvens grandes (raio de 40 a 140 px), muito lentas, nascendo
na metade de baixo e subindo com deriva lateral, crescendo e sumindo
(alpha de .08 a 0 em 10 a 18 s). Sprite: halo cinza-quente, grande.
Mais cinematográfica, mais cara por pixel (áreas grandes) — medir no
celular.

**`brasas` — o atual**
O código de hoje, só migrado para o motor novo (tempo + preset). Serve
de controle na comparação e de rede de segurança.

## Plano

### Motor (substitui `setupDust`)

```
setupHeroFX()
  ├─ lê data-fx → PRESETS[nome] (fallback: 'vento')
  ├─ sprites do preset, desenhados uma vez em canvas auxiliar
  ├─ seed(w, h): cria N partículas pelo preset; N escala com a área, com teto por largura
  ├─ loop(now): dt = min(now − anterior, 50 ms); preset.step(p, dt, t, w, h); preset.draw(ctx, p)
  ├─ pausa: IntersectionObserver no .hero + visibilitychange (como hoje)
  └─ resize com debounce de 200 ms → seed() (como hoje)
```

Um preset é `{ count, sprite, spawn(w, h), step(p, dt, t, w, h),
composite }`. O loop não sabe o que está desenhando. Tudo que já está
certo no `setupDust` (DPR ≤ 2, `cw`/`ch` guardados em vez de medidos por
quadro, sprite) permanece.

O teto de 50 ms no `dt` evita que, ao voltar de uma aba oculta, o
primeiro quadro "salte".

### Arquivo próprio

`scripts.js` tem 433 linhas; o motor com três presets soma ~150. Vale um
`hero-fx.js` carregado com `defer` logo depois do `scripts.js`, só na
home. Mantém o `scripts.js` como "comportamento da página" e isola o que
é puramente decorativo — e o que mais provavelmente será trocado de
novo. Sem build, é só uma tag `<script>` a mais.

### CSS

`.hero__dust` continua igual (`position: absolute; inset: 0; z-index: 2;
pointer-events: none`). A `opacity: .95` pode variar por preset:
`.hero__dust[data-fx="fumaca"] { opacity: .8 }`.

## Tarefas

- [x] `hero-fx.js`: motor + preset `brasas` (migração 1:1, por tempo)
- [x] Preset `vento`
- [x] Preset `fumaca`
- [x] `data-fx` no canvas; `<script src="hero-fx.js" defer>`; `setupDust` removido do `scripts.js`
- [ ] Decidir D1 e D2 **vendo os três rodando** — a decisão vem no meio da implementação, não antes
- [x] README: seção "Partículas do hero" (presets, como trocar, orçamento)
- [x] Verificação parcial: sem erro de console; os três presets rodam. Teste em 120 Hz e Performance com CPU lenta ficam com você

## Verificação

- DevTools → Performance, CPU 4× mais lenta, rolando pelo hero: sem
  quadro > 50 ms.
- Trocar o `data-fx` entre os três e recarregar: cada um roda, nenhum
  vaza partícula pelas bordas.
- Tela de 120 Hz contra 60 Hz: mesma velocidade aparente.
- `prefers-reduced-motion`: o canvas não aparece e o loop não inicia
  (nenhum `requestAnimationFrame` no Performance).
- Aba em segundo plano por 30 s e volta: sem salto.

## Registro de implementação (26/10/2026)

Motor em `hero-fx.js`, três presets, integração por tempo. O padrão é
`vento` por recomendação da spec; para comparar, troque o `data-fx` do
`<canvas>` no `index.html` para `fumaca` ou `brasas` e recarregue.
