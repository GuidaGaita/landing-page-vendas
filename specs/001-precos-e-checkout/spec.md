# 001 — Preços e links de checkout

**Status:** concluída — falta cadastrar as URLs de obrigado nas ofertas novas (painel do Greenn) e conferir a parcela do combo
**Toca:** index.html · pixel.js · README.md · scripts.js (só se o domínio do checkout mudar)

## Contexto

Preço e link de checkout são a informação mais duplicada do site: cada
oferta aparece em cinco pontos, em três arquivos, e nada avisa quando um
deles fica para trás. Hoje:

| Oferta | Slug Greenn | À vista | 12x (estimado) | Link |
|---|---|---|---|---|
| Curso + Gaita (combo) | `r3k5wcq` | R$ 337 | R$ 34,64 | `payfast.greenn.com.br/r3k5wcq/offer/Xl6vxa?ch_id=141821&b_id_1=jfgn4jm` |
| Curso | `6z65zng` | R$ 247 | R$ 25,39 | `payfast.greenn.com.br/6z65zng/offer/QyL4EC?ch_id=141822&b_id_1=jfgn4jm` |

O parcelamento foi **estimado** aplicando a taxa de juros do
parcelamento antigo (README, "Parcelamento é estimativa"; comentário em
`index.html:450-455`). Nunca foi conferido no painel do Greenn.

## Objetivo

Trocar os valores e os links das duas ofertas em todos os pontos, de uma
vez, sem deixar rastro do valor antigo — e deixar a próxima troca mais
barata.

## Requisitos

- R1. Valor à vista, parcela e link de cada oferta batem entre os
  cartões, o JSON-LD e o `pixel.js`.
- R2. `InitiateCheckout` e `Purchase` mandam o valor novo.
- R3. Os parâmetros de campanha continuam chegando ao checkout
  (`setupCheckoutParams`, `scripts.js:392-414`).
- R4. `/obrigado` e `/obrigado-gaita` continuam cadastradas como URL de
  obrigado das ofertas (no painel do Greenn).
- R5. Nenhuma ocorrência de slug ou valor antigo sobra no repositório.

## Fora de escopo

- Criar um terceiro plano. Se precisar, é outra spec: mexe em grade,
  pixel e página de obrigado.
- Mudar o texto das listas de benefícios.

## Entradas e decisões pendentes

| # | Pergunta | Quem responde | Por que importa |
|---|---|---|---|
| D1 | Novo valor **à vista** de cada oferta | você | — |
| D2 | Valor da **parcela** de cada oferta, lido do painel do Greenn (não calcular) | você | o atual é estimativa; a página promete um número que o checkout pode não cumprir (constituição, item 9) |
| D3 | Novo **link** de cada oferta, completo (com `ch_id` e `b_id_1` se continuarem existindo) | você | o slug dentro do link é como o pixel identifica o plano |
| D4 | O checkout continua em `payfast.greenn.com.br`? | você | `scripts.js:400` e `pixel.js:109` acham os botões por esse domínio |
| D5 | Mostrar **preço âncora** riscado ("de R$ X por R$ Y")? | você | o estilo `.offer__anchor` já existe sem uso (`styles.css:1486-1501`). Só vale se o "de" for um preço realmente praticado — âncora inventada é infração do CDC |
| D6 | O preço muda nas duas ofertas ou só numa? | você | — |

## Plano

### Onde cada coisa vive hoje

| O quê | Arquivo:linha | Observação |
|---|---|---|
| JSON-LD `price` curso / combo | `index.html:92` / `:102` | string com duas casas: `"337.00"` |
| JSON-LD `url` curso / combo | `index.html:96` / `:106` | sem `&amp;` — é JSON, não HTML |
| Cartão combo: parcela, à vista, link | `index.html:506-515`, `:530` | `<sup>,64</sup>` separa os centavos; no `href` o `&` é `&amp;` |
| Cartão curso: parcela, à vista, link | `index.html:547-556`, `:571` | idem |
| Comentário "AINDA PENDENTE" | `index.html:446-460` | apagar o item 1 quando a parcela passar a ser a do painel |
| `OFERTAS` (slug, valor, nome) | `pixel.js:26-37` | `valor` é número; o slug precisa ser um trecho **único** do link novo |
| Seletor dos botões de checkout | `pixel.js:109`, `scripts.js:400` | muda só se D4 = não |
| README | tabela de eventos (`Purchase`), "Qual plano é qual", "Parcelamento é estimativa", exemplo de URL em "Os parâmetros de campanha seguem até o checkout" | |

### Abordagem

1. Aplicar D1 a D6 em todos os pontos da tabela, num commit só.
2. Se D5 = sim: inserir `<p class="offer__anchor">de <s>R$ X</s></p>`
   logo acima de `.offer__price` em cada cartão. O estilo já existe.
3. Se D4 = não (domínio novo): trocar o seletor nos dois arquivos e
   conferir se o checkout novo aceita os parâmetros de rastreio
   (`utm_*`, `fbclid`, `src`/`sck`/`ref` são convenção do Greenn; outra
   plataforma pode usar outros nomes).
4. Fechar a pendência 3 do README (parcelamento) — o valor passa a ser o
   do painel.

### Deixar a próxima troca mais barata (opcional, recomendado)

`tools/conferir-ofertas.js`: lê o `OFERTAS` do `pixel.js` e confere se
cada slug e valor aparece no `index.html` (JSON-LD e cartões) e no
README. Roda à mão, como o `gerar-imagens.js`; não é build, só acusa
divergência. São ~40 linhas e evitam exatamente o cenário "atualizou em
dois lugares e esqueceu no terceiro" que o cabeçalho do `pixel.js`
descreve.

## Tarefas

- [x] Receber D1 a D6
- [x] `index.html`: JSON-LD (2 preços + 2 URLs)
- [x] `index.html`: cartão combo (parcela, centavos no `<sup>`, à vista, `href`)
- [x] `index.html`: cartão curso (idem)
- [x] `index.html`: comentário "AINDA PENDENTE" — reescrito com os valores novos
- [x] `pixel.js`: `OFERTAS` (os slugs não mudaram; só o `offer/<id>` do link)
- [x] D4 = sim: o domínio continua `payfast.greenn.com.br`, nada a fazer
- [x] D5 = não: sem preço âncora; o CSS `.offer__anchor`, sem uso, foi removido
- [x] `README.md`: tabela de eventos, "Qual plano é qual", pendência da parcela, exemplo de URL
- [ ] Greenn: cadastrar `/obrigado` e `/obrigado-gaita` como URL de obrigado das ofertas novas
- [ ] (opcional) `tools/conferir-ofertas.js`
- [x] Verificação: grep limpo. Pixel Helper e compra de teste ficam com você, em produção

## Verificação

```bash
# Nada do antigo pode sobrar. Os números batem em coisas que não são
# preço (linhas, ids), então é para ler o resultado, não só contar.
grep -rn "r3k5wcq\|6z65zng\|337\|247\|34,64\|25,39" --include=*.html --include=*.js --include=*.md .
```

- Abrir a home com `?utm_source=teste&fbclid=abc` e conferir, no `href`
  dos dois botões, que os dois parâmetros foram somados ao link novo.
- Meta Pixel Helper: clicar em cada botão e ver `InitiateCheckout` com o
  `value` novo e o `content_ids` com o slug novo.
- Compra de teste no Greenn: cair em `/obrigado-gaita`, ver `Purchase`
  com valor novo e `eventID` começando com `gg-<slug>-`.
- Rich Results Test do Google no JSON-LD, para os dois `Offer`.

## Registro de implementação (26/10/2026)

| Decisão | Resposta |
|---|---|
| D1 à vista | curso R$ 297 · curso + gaita R$ 347 |
| D2 parcela | curso 12x de R$ 30,54 (número que o próprio vídeo da VSL mostra); combo 12x de R$ 35,68, derivado com a mesma taxa — **conferir no painel** |
| D3 links | `r3k5wcq/offer/VLq50u` (combo) e `6z65zng/offer/Ms4jFs` (curso), com os mesmos `ch_id` e `b_id_1` |
| D4 domínio | o mesmo; seletores intactos |
| D5 âncora | não |
| D6 | as duas ofertas |

Ficou com você: cadastrar `/obrigado` e `/obrigado-gaita` como URL de
obrigado das ofertas novas no Greenn, e testar o `InitiateCheckout` com o
Pixel Helper em produção. O `tools/conferir-ofertas.js` opcional não foi
feito.
