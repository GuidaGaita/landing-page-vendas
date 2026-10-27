# GuidaGaita — Landing Page

Landing page de vendas do curso GuidaGaita. HTML, CSS e JavaScript puros, sem
build e sem dependências: os arquivos da raiz são o site inteiro.

## Estrutura

```
landing-page-vendas/
├─ index.html      → conteúdo e estrutura das seções
├─ styles.css      → design system completo (cores, tipografia, animações)
├─ scripts.js      → revelações, contadores, VSL, parallax, FAQ, parâmetros de campanha
├─ hero-fx.js      → partículas do hero (só decoração; três presets)
├─ pixel.js        → Meta Pixel: código base e todos os eventos
├─ obrigado.css    → folha das duas telas de pós-compra
├─ obrigado.js     → brasas flutuantes dessas telas (só decoração)
├─ obrigado/       → rota /obrigado — compra só do curso
├─ obrigado-gaita/ → rota /obrigado-gaita — curso + gaita
├─ assets/         → fotos (masters + variantes), fontes e o vídeo da VSL
├─ specs/          → uma spec por demanda, mais a constituição do projeto
└─ tools/          → script de imagens, rodado à mão (não é build do site)
```

## Rodar localmente

```bash
python -m http.server 8000
```

Depois abra `http://127.0.0.1:8000`. Precisa de servidor: abrir o `index.html`
direto pelo arquivo quebra o carregamento das imagens de fundo.

## Pendências de conteúdo

### 1. Depoimentos — dois publicados, sem foto

A seção `#depoimentos` traz os relatos do João Marcos e do Felipe Silva, com
as palavras deles. A grade está em 2 colunas no desktop; se um terceiro
entrar, vale voltar `.quotes` para 3 colunas no `styles.css`.

Nenhum dos dois tem foto — o `<figcaption>` aceita uma, o modelo está
comentado acima da seção no `index.html`.

O JSON-LD do `<head>` continua **sem** `aggregateRating`, e isso é
proposital: os depoimentos são texto livre, ninguém deu nota de 1 a 5.
Inventar média e quantidade de avaliações rende penalização manual do
Google. Só faz sentido acrescentar se você passar a coletar notas de fato.

### 2. Links legais do rodapé — apontam para lugar nenhum

"Política de Privacidade" e "Termos de Uso" estão como `href="#"`. Numa
página que recebe pagamento isso costuma ser exigido, inclusive pelo próprio
Greenn. Crie as duas páginas e troque os `href`.

### 3. Parcela do combo é derivada

"12x de R$ 30,54" (curso, R$ 297) é o número que o próprio vídeo da VSL
mostra. "12x de R$ 35,68" (curso + gaita, R$ 347) foi calculado com a mesma
taxa. Confirme o valor do combo no painel do Greenn e, se for outro, ajuste
no `index.html` (cartão e JSON-LD). Preço e link de cada oferta vivem em
quatro lugares; a lista está em `specs/001-precos-e-checkout/spec.md`.

## Endereço de publicação

O site é servido em `https://guidagaita.com/`. Esse endereço aparece fixo em
quatro lugares do `index.html`: `canonical`, `og:url`, `og:image` e o `url` do
`Course` no JSON-LD. A `og:image` precisa ser absoluta, senão WhatsApp e
Facebook não exibem a imagem ao compartilhar o link. **Se o domínio mudar, os
quatro mudam juntos.**

As outras duas `url` do JSON-LD são os links de checkout do Greenn: seguem a
oferta, não o domínio.

## Imagens

Os JPG e PNG sem sufixo em `assets/` são os **masters** — os originais de
câmera foram descartados e **não estão em lugar nenhum fora daqui**. Nunca
apague um master: é dele que saem todas as variantes. Ele não é servido ao
visitante, só fica no repositório.

| Master | Onde aparece |
|---|---|
| `hero-duelo.jpg` | Fundo ambiente do topo (atrás da VSL), fundo da chamada final e imagem de compartilhamento |
| `vsl-poster.jpg` | Pôster da VSL no topo: é o LCP da página. Sai de um frame do vídeo (ver *VSL*) |
| `bg-vagao.jpg` | Fundo da seção "Por que tanta gente guarda a gaita na gaveta" |
| `bg-trilhos.jpg` | **Reserva** — era o fundo da prévia em áudio, que foi removida. Só o master: as variantes foram apagadas e a linha dele no `tools/gerar-imagens.js` está comentada. Descomente e rode o script se a foto voltar |
| `bg-vagoes.jpg` | Fundo das seções "A trilha" e "Quem te guia" |
| `bg-encarando.jpg` | Fundo da seção de preço |
| `bg-trem.jpg` | Fundo dos depoimentos, da garantia, do FAQ e do rodapé |
| `etapa-folego.jpg` | Retrato da Etapa 01 |
| `etapa-dominio.jpg` | Retrato da Etapa 02 |
| `etapa-estrada.jpg` | Retrato da Etapa 03 |
| `mentor.jpg` | Retrato redondo do mentor |
| `gaita-azul.png` / `gaita-rosa.png` | As duas gaitas flutuando no cartão de oferta |

### O que o visitante recebe

A página não serve os masters. Cada um gera variantes em AVIF, WebP e um
fallback, em uma ou duas larguras, e o navegador escolhe sozinho:

- no `index.html`, via `<picture>` com `<source type="...">`;
- no `styles.css`, via `image-set()`, com a largura de celular como base e a
  de desktop num `@media (min-width: 801px)`.

Na prática um celular baixa cerca de **350 KB** de página inteira, contra
1,4 MB antes de as variantes existirem.

O `<picture>` leva `display: contents` no reset do `styles.css`: ele existe
só para o navegador escolher o formato e não deve entrar no layout, senão a
caixa dele viraria o item flex de `.offer__photos` no lugar da imagem.

### Regerar as variantes

Depois de trocar ou acrescentar um master:

```bash
npm install sharp
node tools/gerar-imagens.js
```

Commite as variantes junto. O site em si continua sem build e sem
dependência — o `sharp` só serve para rodar esse script à mão.

As larguras e qualidades ficam na tabela `FOTOS` no topo do script. Os fundos
usam qualidade bem mais baixa (36) que as fotos nítidas (46-50) de propósito:
eles aparecem sob `opacity` .4-.8, sépia e um véu escuro, então a perda não
chega à tela.

## VSL

O vídeo do topo é servido daqui mesmo, da Hostinger: `assets/vsl.mp4`,
720×1280 (vertical, 9:16), H.264 + AAC, 5 min 22 s, cerca de 1,2 Mbps. Entra
na página como `<video preload="none">` atrás de um pôster com botão de
play: **nenhum byte do vídeo baixa antes do clique**. O play vem com som,
porque o clique é um gesto do visitante, e `playsinline` impede o iPhone de
abrir o vídeo em tela cheia. Depois do clique os controles nativos aparecem.

### O master não entra no git

O arquivo original (`VSL.mp4`, na raiz, 937 MB em 2160×3840) está no
`.gitignore`: o GitHub recusa arquivo acima de 100 MB, e o deploy vem do
GitHub. O que o site serve é a versão comprimida, gerada com:

```bash
ffmpeg -i VSL.mp4 -vf "scale=720:1280:flags=lanczos" \
  -c:v libx264 -preset slow -crf 28 -maxrate 2000k -bufsize 4000k \
  -profile:v high -level 4.0 -pix_fmt yuv420p -movflags +faststart \
  -c:a aac -b:a 112k -ac 2 assets/vsl.mp4
```

`+faststart` põe o índice no começo do arquivo; sem ele o navegador precisa
baixar o MP4 inteiro antes de tocar. Trocou o vídeo: rode o comando de novo,
gere o pôster (abaixo) e commite os dois.

### Pôster

`assets/vsl-poster.jpg` é um frame do vídeo (1080×1920), extraído com
`ffmpeg -ss 45 -i VSL.mp4 -frames:v 1 -vf scale=1080:-1 -q:v 2 assets/vsl-poster.jpg`.
É um master como os outros: `node tools/gerar-imagens.js` gera as variantes
480/720/1080 que o `<picture>` serve. Como é o maior elemento da primeira
tela, ele é o LCP: tem `fetchpriority="high"` e um `preload` no `<head>`,
cujo `imagesizes` precisa bater com o `sizes` do `<picture>`.

### Vale saber

- **Peso no repositório.** Os ~47 MB do MP4 ficam no histórico do git para
  sempre, e cada visitante que dá play puxa o vídeo do servidor da
  Hostinger. Se o tráfego crescer, o caminho é Vimeo ou Panda Video (sem
  "vídeos relacionados", com relatório de retenção): troca-se o `<video>`
  por um `<iframe>` carregado no clique, e o resto da página não muda.
- **Medição.** `VSLPlay` e `VSLProgresso` (25/50/75/100 %) saem do
  `pixel.js` ouvindo o próprio `<video>`; ver *Medição — Meta Pixel*.
- **Layout.** O vídeo é vertical. No celular ele fica logo abaixo da
  manchete, com a largura presa a 64 % da altura da tela para o CTA
  aparecer sem rolar; no desktop ocupa a coluna da direita. A foto do duelo
  virou fundo ambiente do hero.

## Fontes

Ficam em `assets/fonts/`, servidas do próprio domínio — não do Google Fonts.
A folha do `fonts.googleapis.com` bloqueava a renderização e ainda exigia um
segundo salto até o `fonts.gstatic.com` antes de qualquer letra aparecer.

Só o subset latino, que cobre todo o português. O Outfit é variável: um
arquivo de 32 KB entrega de 400 a 700. Os `@font-face` estão no topo do
`styles.css` e os dois mais críticos têm `preload` no `<head>`.

Para trocar um peso ou uma família, baixe o `.woff2` do subset latino, ponha
em `assets/fonts/` e ajuste o `@font-face` — não volte a apontar para o CDN
do Google.

### Ajustar a intensidade de um fundo

Cada seção controla o próprio fundo por duas variáveis no `styles.css`, no
bloco "Intensidade seção a seção":

- `--bg-op` — quanto a foto aparece (0 a 1)
- `--veu` — quanto a camada escura por cima cobre (0 a 1)

Seção com muito texto usa foto fraca e véu forte; seção narrativa, o
contrário. Para trocar a foto de uma seção, basta mudar a classe
`section-bg--*` no `index.html`.

### Fundos no celular

Até 939 px a foto não cobre a seção inteira: vira uma faixa de no máximo
150 vw de altura no topo da seção, com o enquadramento natural, e derrete
no escuro por uma máscara. Antes, `cover` esticava a foto pela seção
inteira — que no celular é muito mais alta que larga — e sobrava uma fatia
irreconhecível (na seção do problema, um pedaço de camisa com a cabeça
cortada). Seção baixa continua inteira, como sempre foi. A regra está no
bloco "Fundos no celular" do `styles.css`, e é lá que se ajusta a posição
de cada foto dentro da faixa (`.section-bg--vagao` já tem a sua).

### Trocar uma foto

Substitua o **master**, mantendo o nome e a proporção aproximada — fundos
horizontais com 1700–2400 px de largura, retratos verticais com ~820 px. Em
seguida rode `node tools/gerar-imagens.js` para refazer as variantes, e
commite as duas coisas. Trocar só o master não muda nada na página: ela serve
as variantes.

## Movimento

As entradas ao rolar são um vocabulário de classes sobre `.reveal`, todas
disparadas pelo mesmo `IntersectionObserver` do `scripts.js` e definidas no
bloco "REVELAÇÃO AO ROLAR" do `styles.css`:

| Classe | Entrada | Onde |
|---|---|---|
| `.reveal` | fade + 13 px para cima | padrão |
| `.reveal--words` | cada `<span class="w" style="--i:n">` sobe na vez dele | manchete do hero, título final |
| `.reveal--stamp` | carimbo: pousa de cima com leve giro | preço, selo "Mais completo", selo da garantia, a "virada" |
| `.reveal--wipe` | cortina da esquerda para a direita | faixa rolante, "Etapa 0n", título dos cartões de oferta, corda da trilha |
| `.reveal--side` | entra de lado (ímpar da esquerda, par da direita) | depoimentos |
| `.reveal--late` | igual ao padrão, mas só dispara com o bloco 12 % dentro da tela, e sobe 28 px | cartões das etapas e suas etiquetas |
| `.reveal--pronto` | não some nem entra: sempre visível; o observer só marca a chegada para o reflexo do botão | os dois botões de checkout |
| `.checks--stagger` | a lista vai se marcando item a item | listas das etapas e das ofertas |

O atraso (`--d`) vai inline no HTML quando é fixo. Nos cartões das etapas
ele vive no CSS, só de 620 px para cima: lado a lado eles entram em
sequência; empilhados no celular, cada um entra na própria vez.

Mais quatro coisas sem classe própria: a palavra dourada ou ferrugem de um
título ganha um sublinhado que cresce depois da entrada; cada botão laranja
recebe um reflexo único 1 s depois de aparecer (`sheen-once`); a barra fixa
do celular pisca uma vez ao chegar na trilha e outra nos depoimentos
(`setupDockFlash` no `scripts.js`, classe `is-flashing`); e, no desktop, os
fundos fotográficos derivam ao rolar via `animation-timeline` (só em
navegador que suporta; nos outros ficam parados).

Regras: só `opacity`, `clip-path` e as propriedades individuais `translate`,
`scale` e `rotate` (não `transform`, para o hover dos cartões continuar
funcionando); atraso por `--d` e `--i` no HTML, nunca por JS; tudo desligado
por `prefers-reduced-motion`; sem JS, tudo visível. O que não leva o olho ao
CTA nem conta a história (trilhos, duelo, brasa) não entra.

### Foto que revela

Cada foto de fundo (e a do hero) entra em sépia monocromática e vai ganhando
cor conforme sobe pela tela, como papel fotográfico no banho; ao sair pelo
topo, volta ao sépia. São duas camadas dentro do próprio elemento (bloco
"FOTO QUE REVELA" do `styles.css`), pintadas com um tom sépia em
`mix-blend-mode: multiply` (tinge e escurece, para o olho notar): a de entrada some durante o intervalo `entry` da
linha do tempo de rolagem, a de saída aparece durante o `exit`. Só
`opacity`, sem JS. Onde o navegador não tem `animation-timeline` (Firefox,
iPhone antes do iOS 26) a foto fica num sépia leve e fixo. A força é a
variável `--sepia` (1 = monocromático de verdade nas pontas) e o tom é
`--sepia-cor`; as duas podem ser ajustadas por foto, por exemplo
`.section--final .section-bg { --sepia: .7 }`.

## Partículas do hero

O canvas atrás da primeira tela é o `hero-fx.js`, um arquivo à parte porque
é só decoração. O efeito sai do atributo `data-fx` do `<canvas>` no
`index.html`:

| Preset | O que é |
|---|---|
| `vento` (padrão) | poeira de estrada cruzando o quadro, com rajadas — a cena do duelo |
| `fumaca` | vapor do trem subindo devagar |
| `brasas` | os pontos de luz que o hero tinha antes |

Para comparar, troque o atributo e recarregue. O motor é o mesmo para os
três: pausa fora da tela e com a aba oculta, limita o DPR a 2, reaproveita
um sprite por partícula e integra o movimento por tempo — em tela de 120 Hz
a poeira anda na mesma velocidade que em 60 Hz (a versão anterior corria o
dobro). Orçamento: até 70 partículas no celular e 130 no desktop.

## Publicação

Hospedado na **Hostinger**, servido na raiz de `https://guidagaita.com/` — a
landing é o site inteiro, não existe subpasta.

A Hostinger está ligada a este repositório e publica sozinha: o site atualiza
quando o commit **chega ao GitHub**, ou seja, no `git push` — commit local não
dispara nada. Não existe workflow aqui; o GitHub Pages foi desativado e o
`deploy.yml`, removido.

Como o que vai para o ar é o conteúdo versionado, valem duas consequências:

- **Arquivo novo só aparece no site depois de `git add` + commit + push.**
  Arquivo não rastreado não sobe, por mais que exista na sua máquina. Vale
  principalmente para o `pixel.js`: se ele não subir, a medição some inteira
  e nada na página avisa (veja *Medição — Meta Pixel*).
- **O que não deve ser publicado não deve ser commitado.** Foi por isso que a
  pasta com o modelo da página de obrigado, e seus 24 MB de foto, ficou de
  fora do repositório.

`tools/` e o próprio `README.md` acompanham o repositório e ficam alcançáveis
pelo domínio. São inofensivos, mas não fazem parte do site.

## Páginas de obrigado

Duas telas de pós-compra, uma para cada oferta:

| Rota | Oferta | Destaque |
|---|---|---|
| `/obrigado` | só o curso | retrato do professor |
| `/obrigado-gaita` | curso + gaita | a vitrine animada das gaitas, a mesma da seção de oferta |

As duas dividem `obrigado.css` e `obrigado.js`, têm `noindex` e reaproveitam
as imagens e fontes de `assets/`. **Cada uma precisa estar cadastrada como
URL de obrigado da oferta correspondente no painel do Greenn** — sem isso o
comprador nunca chega nelas.

A animação das gaitas é cópia da vitrine da oferta (`.offer__photos`, no
`styles.css`). Mexeu em uma, mexa na outra.

## Medição — Meta Pixel

Pixel `1397849958862391` (Facebook/Instagram Ads), instalado nas três páginas.

Todo o código vive em **`pixel.js`**: o snippet base da Meta e os dez
eventos. Está num arquivo só, e não colado no `<head>` de cada página, porque
o site não tem template — snippet copiado em três lugares é o tipo de coisa
que alguém atualiza em dois e esquece no terceiro, e aí as páginas passam a
medir coisas diferentes sem ninguém notar.

**O ID aparece em quatro lugares:** o `pixel.js` e o `<noscript>` de cada uma
das três páginas. O `<noscript>` não tem como sair de lá — com o JS
desligado, nenhum arquivo `.js` roda para injetá-lo. **Se trocar o pixel,
troque nos quatro.**

### O que é medido

| Evento | Página | Quando |
|---|---|---|
| `PageView` | as três | ao abrir |
| `ViewContent` | home | a seção de preços entra na tela |
| `InitiateCheckout` | home | clique num dos dois botões do Greenn, com o valor do plano |
| `Purchase` | `/obrigado` e `/obrigado-gaita` | ao abrir, com R$ 297 ou R$ 347 |
| `Contact` | `/obrigado-gaita` | clique no botão de WhatsApp |
| `ScrollDepth` * | home | passou de 25, 50, 75 e 90% da página |
| `CTAOferta` * | home | clique num dos cinco botões que levam a `#oferta`, com a origem |
| `FAQAberta` * | home | abriu uma pergunta do FAQ, com o texto dela |
| `VSLPlay` * | home | primeiro play no vídeo do topo |
| `VSLProgresso` * | home | o vídeo passou de 25, 50, 75 e 100% |

`*` eventos personalizados: aparecem em relatório, mas a Meta não os usa para
otimizar campanha. Os cinco de cima são os padrão dela.

**Qual plano é qual** sai do slug do link do Greenn — `r3k5wcq` é o combo com
a gaita (R$ 347), `6z65zng` é só o curso (R$ 297). O slug é o primeiro trecho
do link; o `offer/<id>` depois dele muda quando o Greenn gera um link novo,
e o pixel não liga para isso. Mudou o slug, mude o `OFERTAS` no `pixel.js`.

### O `Purchase` não conta duas vezes

Ele dispara ao abrir a página de obrigado, então um F5 contaria a mesma venda
de novo — e o anúncio aprenderia com número inflado, que é pior do que não
aprender. Duas travas: um registro em `sessionStorage` e um `eventID` mandado
junto, para a Meta descartar duplicata do lado dela.

O `eventID` usa o número da transação **se** o Greenn mandar algum na URL de
retorno (`transaction_id`, `sale_id`, `order_id`...). Se não vier nada, cai
num id gerado na hora — o que ainda resolve o F5, mas não a mesma pessoa
abrindo o link de outro aparelho. Vale conferir, numa compra de teste, o que
aparece na barra de endereço.

### Os parâmetros de campanha seguem até o checkout

A venda não acontece aqui — acontece no `payfast.greenn.com.br`, que é outro
domínio. Se a origem não for junto no link, quem chega pelo anúncio cai num
checkout que não sabe de onde veio, e o relatório do Greenn não diz qual
campanha vendeu.

Quem resolve é o `setupCheckoutParams()`, no `scripts.js`: na carga da página
ele reescreve o `href` dos dois botões do Greenn somando os parâmetros de
rastreamento que vieram na URL.

```
guidagaita.com/?utm_source=ig&utm_campaign=set&fbclid=ABC&cupom=METADE
                              ↓
payfast.greenn.com.br/r3k5wcq/offer/VLq50u
    ?ch_id=141821&b_id_1=jfgn4jm                 ← intactos
    &utm_source=ig&utm_campaign=set&fbclid=ABC   ← somados
                                 cupom fica de fora
```

**Passa só o que é rastreamento:** qualquer `utm_*`, mais os identificadores
de clique das plataformas de anúncio (`fbclid`, `gclid`, `gbraid`, `wbraid`,
`ttclid`, `msclkid`, `igshid`) e os campos livres do Greenn (`src`, `sck`,
`ref`).

Repassar a query inteira seria mais simples, mas deixaria qualquer um forjar
uma URL da landing e injetar parâmetro na página de pagamento — cupom,
prefill, o que o Greenn aceitasse. Pela mesma razão **o que já está no link
vence**: abrir a landing com `?ch_id=999` não muda o `ch_id` da oferta.

**Plataforma de anúncio nova?** Some o click id dela à lista `RASTREIO`, logo
acima da função, no `scripts.js`. É uma linha.

O `href` é reescrito na carga, e não no clique, para que abrir em nova aba,
copiar o endereço e o clique do meio do mouse levem os parâmetros também.

As duas URLs iguais no JSON-LD do `index.html` ficam de fora de propósito: são
dados estruturados para o Google, não links.

### Conferir se está funcionando

Com a extensão **Meta Pixel Helper** no Chrome, ou pelo **Gerenciador de
Eventos → Testar Eventos**, que mostra os parâmetros ao vivo.

O que vale é o teste em `https://guidagaita.com/`, não no `localhost`. E
confira antes se `https://guidagaita.com/pixel.js` **abre**: se der 404, o
arquivo não foi versionado e não existe medição nenhuma — sem nada na página
avisar.

### Ainda falta

- **Verificar o domínio** `guidagaita.com` no Gerenciador de Negócios da Meta.
  Sem isso o iOS limita a atribuição e o `Purchase` chega capado.
- **Conferir no Greenn** se `/obrigado` e `/obrigado-gaita` estão cadastradas
  como URL de obrigado de cada oferta. Sem isso o comprador nunca chega lá, e
  o `Purchase` nunca dispara.
- **API de Conversões (CAPI)** — pixel no navegador perde de 20 a 30% para
  bloqueador de anúncio e iOS. A correção é o Greenn mandar a venda servidor
  a servidor; precisa de integração lá, não dá para fazer daqui.
- **Consentimento (LGPD)** — hoje o pixel dispara direto, sem banner. Faz par
  com a Política de Privacidade, que é a pendência 2 lá em cima.
