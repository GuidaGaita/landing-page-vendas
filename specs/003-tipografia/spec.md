# 003 — Tipografia

**Status:** aguardando decisão
**Toca:** styles.css (`@font-face`, tokens, toda regra com `font-family` ou `font-size`) · obrigado.css · index.html e obrigado/*.html (`preload`) · assets/fonts/ · README.md ("Fontes")

## Contexto

Três famílias hoje, todas self-hosted em subset latino:

| Papel | Fonte | Arquivo | Onde |
|---|---|---|---|
| Cartaz (títulos, preços, números) | Alfa Slab One 400 | 19 KB | h1, h2, `.turn`, `.offer__big`, `.stats__num`, selo, aspas dos depoimentos |
| "Madeira" (rótulos) | Rye 400 | 41 KB | eyebrow, `.brand__name`, `.card__tag`, ticker, "DIAS" do selo |
| Corpo | Outfit variável 400–700 | 32 KB | todo o resto |

Total: 92 KB de fonte, dois `preload`. Há 55 regras de `font-size` no
`styles.css`.

O que incomoda:

1. **Rye em tamanho pequeno vira textura.** Ela é desenhada com
   enfeites internos; em `.68rem` maiúsculo com `.18em` de espaçamento
   (eyebrow, tag das etapas, ticker) os enfeites viram ruído em tela de
   celular. É a fonte mais pesada servindo os textos mais miúdos.
2. **Alfa Slab One em tudo achata a hierarquia.** O mesmo peso fala a
   manchete, a virada emocional ("O problema nunca foi você"), o preço e
   o número do selo. Não existe voz secundária, e ela só tem um peso.
3. **Tamanhos soltos.** `.92`, `.94`, `.95`, `.96`, `.98`, `1`,
   `1.06rem`… cada bloco tem o seu. Trocar a família sem uma escala
   obriga a reajustar dezenas de regras na mão.
4. Outfit é geométrica e fria para a paleta de terra, mas é legível no
   celular e já está otimizada. Trocar o corpo é o maior custo com o
   menor ganho.

## Objetivo

Um sistema de três vozes com papéis claros — **cartaz** (grande, poucas
palavras), **rótulo** (pequeno, maiúsculo, legível) e **corpo** — numa
escala fluida de sete passos, pesando no máximo o que pesa hoje, e
escolhido olhando, não imaginando.

## Requisitos

- R1. Orçamento: ≤ 95 KB de fontes no total, ≤ 2 `preload`, tudo
  self-hosted em `assets/fonts/` (constituição, item 6).
- R2. Rótulos pequenos (< .85rem) em fonte que resista a 11 px no
  celular.
- R3. Escala tipográfica em tokens (`--t-1` a `--t-7`, com `clamp()`),
  usada por todas as regras de `font-size` do `styles.css` e do
  `obrigado.css`.
- R4. Fallback com métrica ajustada (`size-adjust`, `ascent-override`)
  para a fonte de cartaz, para o swap não empurrar o layout enquanto o
  woff2 chega.
- R5. As páginas de obrigado acompanham: mesmas fontes, mesmos tokens.
- R6. Nada de Google Fonts no site publicado. A prova de fontes (abaixo)
  pode usar o CDN porque não é publicada.

## Fora de escopo

- Reescrever textos.
- Cores (é a 006).

## Entradas e decisões pendentes

| # | Pergunta | Quem responde | Como decidir |
|---|---|---|---|
| D1 | Qual pareamento (A, B ou C abaixo), ou outro | você | pela prova de fontes, num celular de verdade, não só no monitor |
| D2 | Trocar o Outfit do corpo? | você | recomendação: não |
| D3 | Manter a Rye em algum lugar (marca, selo)? | você | recomendação: só em `.brand__name` e no "DIAS" do selo, sempre ≥ 1rem — ou aposentar de vez |

### Candidatos

Todos têm subset latino no Google Fonts; baixar pelo
google-webfonts-helper ou pelo Fontsource e hospedar aqui. Os pesos de
arquivo abaixo são estimativas; o número real sai no download.

**A — "Cartaz refinado"** (evolução, menor risco)

- Cartaz: **Alfa Slab One** (fica)
- Rótulo: **Barlow Condensed** 600 — grotesca condensada de sinalização;
  nasceu para maiúscula pequena; cheiro de placa de estação
- Corpo: Outfit (fica)
- Custo: +~14 KB (Barlow), −41 KB (Rye) → ~65 KB no total
- Ganha legibilidade sem mudar a cara. Arrisca pouco, muda pouco.

**B — "Cartaz de filme"** (recomendado)

- Cartaz: **Fraunces** 900, instância estática Black (não a variável) —
  serifa macia tipo Cooper/Windsor, cara de pôster de filme dos anos 70;
  casa com o grão e a sépia que a página já tem
- Voz secundária (a "virada", `.offer__title`, aspas): **Fraunces
  Italic** 600
- Rótulo: Barlow Condensed 600
- Corpo: Outfit (fica)
- Custo: Fraunces Black ~32 KB + Italic ~34 KB + Barlow ~14 KB + Outfit
  32 KB ≈ 112 KB — **estoura o orçamento**. Ou cai o itálico (≈ 78 KB),
  ou aceita os 112 KB de forma consciente (20 KB a mais que hoje, o peso
  de duas fotos de fundo). Decidir na prova.
- Muda a personalidade: de "circo / wood type" para "pôster de faroeste
  spaghetti". Mais premium, menos meme.

**C — "Ferrovia"**

- Cartaz: **Big Shoulders Display** 800 — condensada, industrial, pátio
  de trem; manchetes altas e estreitas que cabem no celular sem `<br>`
- Rótulo: Big Shoulders Text 600 (mesma família) ou Barlow Condensed
- Corpo: Outfit
- Custo: Big Shoulders variável latina ~40 KB + Barlow 14 + Outfit 32 ≈
  86 KB
- Mais distinto e mais moderno; perde o slab de cartaz antigo.

## Plano

### 1. Prova de fontes, antes de qualquer decisão

`specs/003-tipografia/prova.html`: uma página fora do site que carrega
os candidatos do Google Fonts (só aqui) e renderiza, com a paleta real e
para cada pareamento, o h1 do hero, um h2 de seção, a virada, um
eyebrow, uma tag, o preço `R$ 34,64`, um parágrafo de corpo e o botão.
Um seletor alterna o pareamento sem recarregar. Abrir no celular pela
rede local (`python -m http.server` e o IP da máquina).

Não entra no site. Fica em `specs/` e é descartável depois da decisão.

### 2. Escala tipográfica (antes de trocar a família)

```css
:root {
    --t-1: clamp(.72rem,  .68rem + .2vw,  .78rem);   /* rótulos, notas */
    --t-2: clamp(.88rem,  .84rem + .2vw,  .94rem);   /* listas, legendas */
    --t-3: clamp(1rem,    .96rem + .25vw, 1.09rem);  /* corpo */
    --t-4: clamp(1.15rem, 1.05rem + .5vw, 1.35rem);  /* subtítulos, títulos de cartão */
    --t-5: clamp(1.5rem,  1.2rem + 1.6vw, 2.2rem);   /* virada, títulos --sm, preço à vista */
    --t-6: clamp(2.05rem, 1.4rem + 3.4vw, 3.65rem);  /* h2 */
    --t-7: clamp(2.3rem,  1.5rem + 4.4vw, 4.15rem);  /* h1, preço grande */
}
```

As pontas são as que a página já usa (h2 em `2.05–3.65rem`, h1 em
`2.3–4.15rem`): a escala só dá nome ao que existe e aposenta os `.92`,
`.94`, `.95`, `.96`. Commit próprio, sem mudança visual. Depois disso a
troca de família é mexer em três tokens (`--f-poster`, `--f-wood`,
`--f-body`) e ajustar `line-height` e `letter-spacing`.

### 3. A troca

1. Baixar os woff2 (subset latino) para `assets/fonts/`.
2. `@font-face` no topo do `styles.css` e do `obrigado.css`, com
   `font-display: swap`. Para a fonte de cartaz, um segundo `@font-face`
   de fallback (sobre Georgia ou Impact) com `size-adjust` e
   `ascent-override` calibrados — ferramentas: Fontaine, ou o "fallback
   font generator" do Malte Ubl.
3. `preload` das duas críticas (cartaz + corpo) nas três páginas. A de
   rótulo não precisa.
4. Rever `letter-spacing` e `line-height` das regras de título: Fraunces
   pede tracking normal, não negativo; Big Shoulders pede `line-height`
   perto de `.95`.
5. Rever cada `<br>` de título: com fonte condensada eles sobram, com
   Fraunces podem faltar. Preferir `max-width` em `ch` + `text-wrap:
   balance` a `<br>` (é o item C1 da 006).
6. Apagar os woff2 que saíram. Atualizar a seção "Fontes" do README.

### Riscos

- Fraunces variável completa tem quatro eixos e passa de 100 KB. Usar
  instâncias estáticas.
- Cada fonte nova precisa cobrir `ã õ ç ê` e as aspas tipográficas
  (`.quote::before` usa `\201C`). O subset latino do Google cobre.
- `font-display: swap` com fonte de cartaz muito diferente do fallback
  = pulo de layout no hero. R4 resolve.

## Tarefas

- [ ] Montar `prova.html` com A, B e C
- [ ] Decidir D1 a D3 olhando no celular
- [ ] Escala `--t-*` no `styles.css` e no `obrigado.css`, sem trocar família (commit próprio)
- [ ] Baixar subsets; `@font-face`; fallback com métrica
- [ ] Trocar os tokens de família; revisar tracking, `line-height` e `<br>`
- [ ] `preload` nas três páginas
- [ ] Remover fontes antigas; README
- [ ] Verificação

## Verificação

- Lighthouse: CLS = 0 com cache limpo e rede lenta (o swap não pode
  empurrar o hero).
- `assets/fonts/` ≤ 95 KB, ou o valor aceito em D1.
- `grep -rn "googleapis" --include=*.html --include=*.css .` só acha
  coisa dentro de `specs/`.
- Conferir `ã õ ç ê “ ”` em todas as fontes novas, na própria página.
- Eyebrow, tags e ticker legíveis com o braço esticado num celular de
  360 px.
