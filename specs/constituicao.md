# Constituição do projeto

Os princípios que toda spec e todo commit respeitam. Foram tirados do
que o código e o README já praticam — isto só deixa escrito. Mudar um
deles é possível, mas é uma decisão explícita, registrada aqui, não um
efeito colateral de uma tarefa.

## 1. Site estático puro

HTML, CSS e JS na raiz são o site inteiro. Sem build, sem framework,
sem dependência em tempo de execução. `tools/` roda à mão e o resultado
é commitado. Nada que precise de `npm install` para o visitante ver a
página.

## 2. Desempenho é funcionalidade

A página pesa ~350 KB no celular e o LCP é a foto (ou o pôster) do
hero. Toda mudança é medida antes e depois: Lighthouse mobile, três
rodadas. Orçamentos: LCP ≤ 2,5 s em 4G simulado; CLS = 0; nenhuma
tarefa longa > 50 ms durante a rolagem; fontes ≤ 95 KB no total.

## 3. Movimento só no compositor

Animar `opacity`, `transform` e `clip-path`. Nunca `box-shadow`,
`filter`, `top`/`left`, `height` ou `background-position`. Nada de ler
layout dentro de `requestAnimationFrame` sem necessidade. Loop de canvas
pausa fora da tela e com a aba oculta, e integra por tempo, não por
quadro.

## 4. Movimento é opcional

`prefers-reduced-motion` desliga tudo que é decorativo (o bloco no fim
do `styles.css` faz isso). Conteúdo nunca depende de animação para
aparecer: sem JS, tudo fica visível (o `.js` no `<html>` é o portão do
`.reveal`).

## 5. Imagem passa pelo pipeline

Master em `assets/` (nunca apagar: não há cópia fora do git). Variantes
AVIF/WebP/fallback saem de `tools/gerar-imagens.js`. `<picture>` no HTML
e `image-set()` no CSS. `loading="lazy"` abaixo da dobra,
`fetchpriority="high"` no LCP. Rede social recebe sempre JPG com URL
absoluta.

## 6. Fontes da casa

Subset latino, self-hosted em `assets/fonts/`, `@font-face` no topo do
CSS, `preload` só das críticas. Nunca `fonts.googleapis.com` no site
publicado.

## 7. Tudo que o visitante faz é medido — uma vez

Todo CTA, interação ou passo do funil novo ganha evento em `pixel.js`
(evento padrão da Meta quando existir, `trackCustom` quando não) e uma
linha na tabela do README. O ID do pixel vive em quatro lugares.
`Purchase` não duplica. Evento que mente é pior que não medir.

## 8. O checkout é outro domínio

`scripts.js` e `pixel.js` reconhecem os botões de compra pelo domínio
`payfast.greenn.com.br`, e só parâmetros de rastreio atravessam para lá.
Preço, slug e link de cada oferta vivem em `index.html` (cartões e
JSON-LD), em `pixel.js` (`OFERTAS`) e no README — e os três precisam
bater.

## 9. Só o que é verdade

Sem nota média inventada, sem contagem regressiva falsa, sem "vagas
limitadas" que não existem, sem preço âncora que nunca foi praticado.
Depoimento é com as palavras do aluno. O que a página promete, o
checkout cumpre: parcelamento é o do painel, não estimativa.

## 10. Celular primeiro

O layout base é o de 360 px; 620 e 940 px são progressões. Centralizado
no celular, alinhado à esquerda a partir do tablet. Dock fixo com o CTA
no celular. Testar num aparelho real, não só no emulador.

## 11. Acessível por padrão

Contraste mínimo de 4,5:1 em texto pequeno e 3:1 em título. Foco
visível (`:focus-visible` dourado). Decorativo leva `aria-hidden`. Tudo
que é clicável é `<a>` ou `<button>` e funciona por teclado. Texto é
selecionável.

## 12. Em português, explicando o porquê

Código, comentários, commits, specs e README em pt-BR. Comentário
explica por que a coisa é assim, não o que ela faz. Decisão não-óbvia
sem comentário é um bug futuro.

## 13. Deploy é `git push`

A Hostinger publica o que chega na `main` do GitHub. Arquivo novo só
sobe com `git add`. O que não deve ir ao ar não é commitado. As três
páginas (`/`, `/obrigado`, `/obrigado-gaita`) compartilham `assets/`,
`pixel.js` e a vitrine das gaitas: mexeu numa, confere nas outras.
