# 002 — VSL no topo da página

**Status:** concluída — pendentes só o teste num iPhone real e o Lighthouse em produção
**Toca:** index.html · styles.css · scripts.js · pixel.js · README.md · assets/ (pôster) · tools/gerar-imagens.js

## Contexto

O hero hoje é foto + manchete + CTA + números de prova, e a foto do
duelo é o LCP da página (`index.html:144-165`). Uma VSL (video sales
letter) no topo muda o que a primeira tela vende: deixa de ser "leia e
role" e vira "assista". Isso mexe em layout, peso de página, medição e
no lugar das partículas (spec 004).

## Objetivo

Colocar o vídeo da VSL na primeira tela, no celular e no desktop, sem
derrubar o desempenho que a página tem hoje (~350 KB no celular), e
medindo quem dá play e até onde assiste.

## Requisitos

- R1. O vídeo aparece na primeira tela, sem rolar, em 360×640 e em
  1366×768.
- R2. Nenhum JS de player terceiro baixa antes do visitante clicar no
  play (fachada com pôster). Exceção: se D5 for um player com autoplay
  silencioso, o custo entra no orçamento e é medido.
- R3. O pôster passa pelo pipeline de imagens (AVIF/WebP/JPG via
  `tools/gerar-imagens.js`) e leva `fetchpriority="high"`: ele vira o
  LCP.
- R4. O play é um `<button>` com rótulo acessível e funciona por
  teclado; o iframe ou `<video>` tem `title`.
- R5. Pixel: `VSLPlay` (uma vez por carga) e `VSLProgresso` com
  `{ pct: 25 | 50 | 75 | 100 }` quando o player expõe o tempo.
- R6. `prefers-reduced-motion` não afeta o vídeo (é conteúdo, não
  decoração); afeta só moldura e partícula.
- R7. CLS zero: o espaço do vídeo é reservado por `aspect-ratio` antes
  de qualquer coisa carregar.
- R8. Lighthouse mobile: LCP ≤ 2,5 s em 4G simulado; peso total da home
  ≤ 450 KB antes do play.

## Fora de escopo

- Produzir ou editar o vídeo, legendas e thumbnail — chegam prontos.
- "Delay reveal" (esconder o preço até o minuto X do vídeo). Se for
  desejado, vira spec própria: mexe em dock, âncoras `#oferta` e pixel.
- Trocar a foto do duelo nas outras seções.

## Entradas e decisões pendentes

| # | Pergunta | Quem responde | Por que importa / recomendação |
|---|---|---|---|
| D1 | **Onde o vídeo está hospedado?** YouTube não listado · Vimeo · Panda Video · VTurb/Converte · MP4 próprio | você | define o embed, o peso e se dá para medir progresso. Tabela abaixo. |
| D2 | Link ou ID do vídeo | você | — |
| D3 | Proporção: 16:9 (horizontal) ou 9:16 (vertical, estilo Reels)? | você | 9:16 no desktop pede duas colunas; 16:9 cabe no empilhado |
| D4 | Pôster: frame do próprio vídeo, ou a foto do duelo com o play por cima? | você | recomendação: frame do vídeo com você olhando para a câmera. Pôster que parece vídeo recebe mais clique do que foto bonita |
| D5 | Autoplay mudo com "clique para ouvir" (padrão VTurb) ou pôster + play? | você | recomendação: pôster + play. Autoplay mudo baixa o vídeo para todo mundo, inclusive quem nunca ia assistir, e no iOS só toca mudo mesmo |
| D6 | A foto do duelo continua atrás do vídeo, ou o vídeo a substitui? | você | recomendação: fica, como fundo ambiente mais escuro. É a identidade da página e já está otimizada |
| D7 | Manchete acima do vídeo (VSL clássica) ou ao lado (split)? | você | recomendação: acima. Motivo no plano |

### Como cada hospedagem se comporta

| Hospedagem | Fachada possível | Progresso mensurável | Custo antes do play | Observações |
|---|---|---|---|---|
| YouTube não listado | sim: pôster + iframe `youtube-nocookie.com` só no clique | sim, via IFrame API (ler `getCurrentTime` a cada 1 s) | 0 KB | mostra vídeos relacionados do canal ao pausar e no fim (`rel=0` limita ao próprio canal, não elimina). O domínio `nocookie` ajuda na LGPD |
| Vimeo (plano pago) | sim | sim, `player.js` → `timeupdate` | 0 KB | sem relacionados, controles customizáveis, mais caro |
| Panda Video | sim (iframe só no clique) | parcial, por eventos próprios | 0 KB | comum no mercado BR, feito para VSL, tem relatório de retenção |
| VTurb / Converte | o player é a fachada | sim, no painel deles | ~150–300 KB de JS | padrão da indústria de infoproduto BR: smart autoplay, delay reveal, retenção. O JS vai contra o orçamento da página |
| MP4 próprio (Hostinger) | nativa: `<video preload="metadata" poster>` | sim, `timeupdate` nativo | ~1 KB | sem CDN de vídeo, o MP4 sai do mesmo servidor do site; com tráfego de anúncio pode engasgar. Precisa de 2 ou 3 qualidades |

Recomendação: **Vimeo ou Panda** se já tiver conta; **YouTube não
listado** se a prioridade for custo zero. VTurb só se o relatório de
retenção dele for decisivo para a operação de tráfego — aí a spec aceita
o JS extra e mede com ele.

## Plano

### Layout recomendado (D7): VSL clássica, empilhada e centralizada

```
┌────────────────────────────────────┐
│     ★ O MÉTODO GUIDAGAITA ★        │  eyebrow (já existe)
│     No duelo entre você e a        │  h1, um pouco menor, centralizado
│     gaita, só falta você sacar.    │
│  ┌──────────────────────────────┐  │
│  │           ▶  (pôster)        │  │  .vsl — moldura tintype, 16:9
│  └──────────────────────────────┘  │
│  [ Quero tocar minha 1ª música ]   │  CTA (já existe)
│   100+ aulas · vitalício · 10 min  │  stats (já existem; no celular o ticker cobre)
└────────────────────────────────────┘
```

Por que empilhado e não ao lado: no celular é a única opção de qualquer
forma. No desktop, o vídeo centralizado e largo (até ~860 px) é o que as
VSLs que convertem usam. E evita a disputa com a foto: hoje ela ocupa a
coluna da direita (`styles.css:1963-1973`) e é lá que o seu rosto fica —
exatamente onde a coluna do vídeo cairia num split.

Consequências:

- `.hero__grid` perde as duas colunas do desktop (`styles.css:1959`); a
  foto volta a ser full-bleed com a máscara de baixo e fica com opacidade
  menor (ambiente, não protagonista).
- `.hero__sub` ("Do zero à primeira música…") desce para baixo do vídeo
  ou sai — o vídeo diz isso. Decidir olhando o resultado.
- O `min-height: 100svh` do hero sai (`styles.css:759`): com vídeo, a
  primeira tela pode ser mais alta que a viewport em celular pequeno, e
  tudo bem.
- `.scroll-hint` perde o sentido com o vídeo no centro. Remover.

### Componente `.vsl`

A fachada; o player entra só no clique:

```html
<div class="vsl tintype reveal" style="--d:100ms">
    <button class="vsl__play" type="button"
            aria-label="Assistir ao vídeo: por que você ainda não toca gaita">
        <picture>… pôster em 480/768/1200/1600, AVIF/WebP/JPG, fetchpriority="high" …</picture>
        <span class="vsl__btn" aria-hidden="true"></span>
    </button>
</div>
```

- Reaproveita `.tintype` (moldura de couro + cantoneiras douradas): o
  vídeo fica com a mesma cara dos retratos das etapas. `.btn__play`
  (`styles.css:573-583`) é um resto da prévia em áudio e vira a base do
  botão redondo de play.
- `aspect-ratio: 16 / 9` no `.vsl`; o `<picture>` cobre tudo.
- `scripts.js`: `setupVSL()` — no clique, troca o botão pelo `<iframe>`
  (ou `<video>`) já com autoplay e avisa o pixel. Para YouTube/Vimeo,
  carrega a API do player só nesse momento, para ler o progresso.
- O pôster é mais um master em `assets/` (`vsl-poster.jpg`, 1920×1080)
  com linha na tabela `FOTOS` do `tools/gerar-imagens.js`:
  `[480, 768, 1200, 1600]`, qualidade de foto nítida (46–50).

### Medição (`pixel.js`)

| Evento | Tipo | Quando | Parâmetros |
|---|---|---|---|
| `VSLPlay` | custom | primeiro clique no play | `{ origem: 'hero' }` |
| `VSLProgresso` | custom | passou de 25, 50, 75 e 100 % | `{ pct }` |

Entram na tabela de eventos do README. O `ViewContent` continua na
seção de oferta — não mudar o significado dele.

### Dados estruturados

Acrescentar um `VideoObject` ao JSON-LD (`name`, `description`,
`thumbnailUrl` absoluto, `uploadDate`, `embedUrl`). Só vale com URL
pública do pôster, que o pipeline já dá.

### Riscos

- **LCP.** O pôster vira o maior elemento. Precisa de
  `fetchpriority="high"` e, se o `<picture>` atrapalhar a descoberta,
  `<link rel="preload" as="image" imagesrcset imagesizes>` no `<head>`.
- **iOS.** Autoplay com som não existe. O clique no play da fachada é um
  gesto do usuário, então o `autoplay=1` do iframe que entra nesse
  momento funciona. Testar num iPhone de verdade.
- **Partícula (spec 004).** O canvas está em z-index 2, abaixo do
  `.hero__grid` (3). O vídeo cobre a partícula na área dele; o resto do
  hero continua animado. Nada a fazer.
- **Dock no celular.** Ele some enquanto o hero está visível
  (`scripts.js:261-278`). Com o hero mais alto, o comportamento continua
  certo.

## Tarefas

- [x] Receber D1 a D7
- [x] Pôster: receber o frame (1920×1080), salvar como master `assets/vsl-poster.jpg`, linha no `FOTOS`, rodar o script, commitar as variantes
- [x] `index.html`: hero novo (eyebrow → h1 → `.vsl` → CTA → stats); remover `.scroll-hint`; `VideoObject` no JSON-LD
- [x] `styles.css`: `.vsl`, `.vsl__play`, `.vsl__btn`; hero empilhado no desktop; foto como fundo ambiente; apagar o que sobrar de `.btn__play`
- [x] `scripts.js`: `setupVSL()` (fachada → player; API de progresso conforme D1)
- [x] `pixel.js`: `wireVSL()` com `VSLPlay` e `VSLProgresso`
- [x] `README.md`: seção "VSL" (hospedagem, como trocar o vídeo, como trocar o pôster) e tabela de eventos
- [x] Verificação

## Verificação

- Lighthouse mobile **antes de mexer** (3 rodadas), guardar os números.
- Network, carga limpa: nenhuma requisição a youtube/vimeo/panda/vturb
  antes do clique.
- Lighthouse mobile depois: LCP, CLS = 0, peso total. Comparar.
- Pixel Helper: `VSLPlay` uma vez; `VSLProgresso` 25/50/75/100
  assistindo até o fim.
- Teclado: Tab chega no play, Enter dá play, foco visível (outline
  dourado do `:focus-visible`).
- iPhone real: play com som funciona no primeiro toque.
- `prefers-reduced-motion`: o vídeo continua clicável e tocando.

## Registro de implementação (26/10/2026)

| Decisão | Resposta |
|---|---|
| D1 hospedagem | MP4 próprio, servido da Hostinger (`assets/vsl.mp4`). O master de 937 MB ficou na raiz, fora do git |
| D2 | `VSL.mp4` → recomprimido para 720×1280, CRF 28, 46,5 MB, `+faststart` |
| D3 proporção | **9:16 (vertical)** — por isso o desktop ficou em duas colunas (texto à esquerda, vídeo à direita), e no celular o vídeo tem a largura presa a 64 % da altura da tela |
| D4 pôster | frame dos 45 s do vídeo (olhando para a câmera, gaita na mão), pipeline normal de imagens |
| D5 | pôster + play; `preload="none"`, zero bytes antes do clique |
| D6 | a foto do duelo ficou, como fundo ambiente escurecido do hero |
| D7 | empilhado no celular; split no desktop (consequência do 9:16) |

Verificado aqui: nenhum pedido ao vídeo antes do clique, play por botão
com rótulo, JSON-LD com `VideoObject`, eventos `VSLPlay` e `VSLProgresso`
no `pixel.js`, sem erro de console, layout conferido em 390 px e 1366 px.
Não verificado: iPhone real (som no primeiro toque) e Lighthouse em
produção — rode os dois depois do deploy.
