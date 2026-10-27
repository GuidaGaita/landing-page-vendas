# 006 — Auditoria de estilos

**Status:** em andamento — grupo A feito (menos A6); B2, B4, C2, C3 e C6 feitos; o resto segue abaixo
**Toca:** styles.css · index.html · tools/gerar-imagens.js · README.md

## Contexto

Leitura completa do `styles.css` (2.050 linhas) e do `index.html` com a
pergunta "o que atrapalha a venda, a leitura ou o desempenho?". O
resultado é uma lista priorizada, não a spec de um recurso: cada item é
pequeno e independente. O grupo A pode ir no mesmo commit da spec 001.

Contrastes medidos (WCAG, fórmula padrão) sobre os tokens atuais:

| Texto | sobre `--void` | sobre `--leather` (cartões) |
|---|---|---|
| `--bone` | 14,4 | 9,9 |
| `--sand` | 7,2 | 5,0 |
| `--ash` | **4,0** | **2,8** |
| `--gold` | 8,0 | 5,5 |
| `--ember` | 4,9 | 3,4 |
| `--rust` | **2,9** | 2,0 |

Mínimo: 4,5 em texto pequeno, 3,0 em título grande.

## Achados

Esforço: **P** (minutos) · **M** (uma hora) · **G** (meio dia, com teste).

### A. Quick wins — fazer já

| # | Achado | Onde | Correção | Esforço |
|---|---|---|---|---|
| A1 | **Texto não selecionável na página inteira** (`user-select: none; cursor: default` no `body`). Quem quer copiar o preço, o nome da gaita ou uma pergunta do FAQ não consegue; leitor de tela e tradutor automático também sofrem. A justificativa do comentário (evitar o cursor "I") não paga esse custo. | `styles.css:118-125` | Remover do `body`. Manter `user-select: none` só no decorativo: `.ticker`, `.eyebrow__star`, `.pain__num` (o `summary` já tem). | P |
| A2 | **`--ash` abaixo do mínimo.** 4,0 sobre o fundo e 2,8 dentro dos cartões, em texto pequeno: `.offer__note`, `.offer__small`, `.offer__or`, `.stats__label`, `.final__mini`, rodapé, idade nos depoimentos, `.warranty__fine`. | `styles.css:80` | `--ash: #A39080` (5,6 sobre `--void`, 3,8 sobre couro). O que fica **dentro de cartão** (`.offer__small`, `.offer__or`, `.offer__note`, `.quote__who small`) passa para `--sand` (5,0 sobre couro). | P |
| A3 | **`--rust` como cor de texto** em `.ink-rust` ("na gaveta", h2 do problema): 2,9 sobre `--void`, e menos ainda sobre a foto. | `styles.css:387` | `--rust` continua para bordas e gradientes; `.ink-rust` usa `var(--ember)` (4,9) ou um `#C4573A`. | P |
| A4 | **Texto do cartão combo com erro**: "+Comunidade e Alunos" (sem espaço, "e" em vez de "de"). O cartão do curso diz "+ Comunidade de alunos". | `index.html:480` | Igualar ao do curso. | P |
| A5 | **Subtítulo do hero sem pontuação** entre "dom musical" e "só o caminho certo". | `index.html:186` | `“dom musical”: só o caminho certo…`, ou travessão. | P |
| A6 | **Links legais apontam para `#`.** Página que recebe pagamento sem Política de Privacidade e Termos (pendência 2 do README). Greenn e Meta (verificação de domínio) cobram. | `index.html:707-708` | Duas páginas estáticas (`/privacidade`, `/termos`) sobre a `obrigado.css`. Vira spec própria se o texto jurídico demorar. | M |
| A7 | **CSS e arquivos mortos**: `.btn__play` (resto da prévia em áudio — reaproveitar na 002), `.offer__anchor` (sem uso — reaproveitar na 001), variantes `bg-trilhos-*` (376 KB no repositório; o README já aponta). | `styles.css:573-583`, `:1486-1501`; `assets/` | Apagar o que as specs 001 e 002 não absorverem; `git rm` das variantes trilhos (o master fica). | P |

### B. Desempenho — medir, depois fazer

| # | Achado | Onde | Correção | Esforço |
|---|---|---|---|---|
| B1 | **Filtro de cor em tempo de execução em nove camadas de foto.** Cada `.section-bg` leva `filter: sepia(.22) saturate(1.12) contrast(1.12) brightness(.78)`; `.tintype img` e `.hero__photo img` também. Filtro em camada grande é rasterização cara no celular, repetida a cada repintura. | `styles.css:218`, `:702`, `:785` | **Assar a gradação nas variantes**: o `tools/gerar-imagens.js` aplica `.modulate({ saturation, brightness })` e `.tint()` equivalentes antes de exportar; some o `filter` das regras. O hover do `.tintype`, que hoje transita o `filter`, vira uma camada `::before` com `opacity`. Medir antes e depois (raster no Performance). | G |
| B2 | **`will-change` em 37 elementos** desde a carga (todos os `.reveal`). | `styles.css:1766` | Remover (ver 005). | P |
| B3 | **Grão em tela cheia** (`.fx-grain`, `steps(4)` infinito, `inset: -8%`) + vinheta fixa: duas camadas compostas permanentes. Barato no desktop; em Android fraco é do que mais custa. | `styles.css:158-183` | Medir. Se custar: `@media (max-width: 619px) { .fx-grain { animation: none } }`. Grão parado ainda dá a textura. | P |
| B4 | **LCP sem `preload`.** O `<img>` do hero tem `fetchpriority="high"`, mas está dentro de `<picture>` com `srcset`; o scanner costuma achar, mas `<link rel="preload" as="image" imagesrcset imagesizes>` garante. Vale ainda mais quando o pôster da VSL virar o LCP (002). | `index.html:149-165` | Preload com `imagesrcset` e `imagesizes` iguais ao `<source>` AVIF. | P |
| B5 | `font-display: swap` na Rye (decorativa, rótulos): se ela atrasar, o texto troca de fonte depois de pintado. | `styles.css:33` | `font-display: optional` na fonte de rótulo, ou resolver na 003. | P |

### C. Layout e leitura

| # | Achado | Onde | Correção | Esforço |
|---|---|---|---|---|
| C1 | **`<br>` forçados nos títulos** (h1, h2 do problema, trilha, oferta, `.offer__name`) junto com `text-wrap: balance`: em 360 px sobram palavras órfãs e quebras duplas. | `index.html:180`, `:240`, `:280`, `:466`, `:480`, `:544` | Tirar os `<br>`; controlar com `max-width` em `ch` e `balance`. Depende da fonte final (003). | M |
| C2 | **Cartão de oferta largo demais entre 620 e 939 px**: uma coluna com `max-width: 980px` — o cartão estica e a vitrine de 132 px fica perdida no meio. | `styles.css:1251-1259` | `.offer { max-width: 560px; margin-inline: auto }` enquanto for coluna única. | P |
| C3 | **O selo "Mais completo" rouba 6,5 rem do título** em qualquer largura. No desktop o cartão tem espaço de sobra. | `styles.css:1302-1303` | Limitar o `padding-right` a `max-width: 619px`. | P |
| C4 | **Os dois cartões têm o mesmo peso visual**: mesma estrutura, mesmo botão. O destaque do combo é só borda e selo. | `styles.css:1285-1298` | Botão do curso em `.btn--ghost`, ou cartão do curso um pouco menor e mais escuro. É decisão de conversão, não de CSS: testar. | P |
| C5 | **Números de prova (`.stats`) nunca aparecem no celular** (`display: none` abaixo de 620 px). O ticker os repete, sem os contadores. É intencional — registrar para ninguém "consertar". | `styles.css:862-863` | Nada. | — |
| C6 | **Cabeçalho fixo só aparece depois de 75 % da viewport.** Com o hero mais alto da VSL (002), o visitante fica sem marca e sem atalho por mais tempo. | `scripts.js:244` | Reavaliar após a 002: disparar por "saiu do hero" (IntersectionObserver no `.hero`) em vez de altura fixa. | P |
| C7 | **Celular: `100svh` + `align-items: flex-end`** empurra a manchete para baixo da foto 5:4. Com o vídeo este arranjo sai. | `styles.css:757-765` | Resolver na 002. | — |

### D. Sistema

| # | Achado | Correção | Esforço |
|---|---|---|---|
| D1 | **Sem escala tipográfica**: 55 regras de `font-size` avulsas. | Tokens `--t-1` a `--t-7` (003). | M |
| D2 | **Padding dos cartões avulso** (`1.5rem`, `1.6rem`, `1.7rem 1.5rem 1.6rem`, `1.9rem 1.6rem 1.5rem`…). | Dois tokens, `--pad-card` e `--pad-card-lg`, com o salto no breakpoint de 620. | M |
| D3 | **Vitrine das gaitas duplicada** entre `styles.css` (`.offer__photos`) e `obrigado.css` (`.gaitas`), como o README avisa. | Um `vitrine.css` carregado pelas duas páginas. Só vale se a vitrine for mexida de novo. | M |

## Fora de escopo

- Trocar a paleta além dos ajustes de contraste.
- Reescrever componentes.

## Tarefas

O grupo A inteiro cabe num commit ("spec 006: quick wins"). B1 e C1
andam junto com a 003.

- [x] A1 a A5 e A7 (A6 continua pendente: precisa do texto jurídico)
- [x] B2 e B4 (B5 ficou para a 003: `optional` numa fonte decorativa some na primeira visita, justamente a que vende)
- [x] C2, C3 e C6 (o cabeçalho passa a aparecer quando o hero sai da tela)
- [ ] Medir B1 e B3 no Performance antes de decidir
- [ ] C4: decidir com o dono (é teste de conversão)
- [ ] D2
- [ ] Verificação

## Verificação

- Contraste das cores novas (qualquer calculadora WCAG): `--ash` ≥ 4,5
  sobre `--void`, e o que fica em cartão ≥ 4,5 sobre `--leather`.
- Lighthouse Acessibilidade ≥ 95 depois de A1, A2 e A3.
- Selecionar e copiar o preço no celular funciona.
- `grep -n "btn__play\|offer__anchor" index.html styles.css` não acha
  classe sem uso.

## Registro de implementação (26/10/2026)

Feito: A1 (texto selecionável, com `::selection` na cor da brasa), A2
(`--ash` #A39080; texto miúdo dentro dos cartões em `--sand`), A3
(`.ink-rust` em #C4573A), A4 e A5 (textos), A7 (`.btn__play` e
`.offer__anchor` removidos; variantes `bg-trilhos-*` apagadas e a linha
comentada no script), B2 (`will-change` fora), B4 (preload do LCP, que
agora é o pôster da VSL), C2 (`.offer` com 560px em coluna única), C3
(`padding-right` do selo só no celular), C6 (cabeçalho por
IntersectionObserver). C1 saiu pela metade: os `<br>` dos títulos e dos
nomes das ofertas foram removidos; a revisão fina espera a fonte da 003.
C7 foi resolvido pela 002.

Também entrou, fora da lista: a **faixa de foto no celular** (bloco
"Fundos no celular" do `styles.css`) — era a causa das fotos "mal
centralizadas" nas seções altas.

Pendente: A6 (páginas legais), B1 (assar a gradação nas imagens), B3
(grão no celular), C4 (hierarquia dos dois cartões — decisão de
conversão), D1 a D3.
