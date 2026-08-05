# GuidaGaita — Landing Page

Landing page de vendas do curso GuidaGaita. HTML, CSS e JavaScript puros, sem
build e sem dependências: os três arquivos da raiz são o site inteiro.

## Estrutura

```
landing-page-vendas/
├─ index.html      → conteúdo e estrutura das seções
├─ styles.css      → design system completo (cores, tipografia, animações)
├─ scripts.js      → revelações, contadores, poeira, parallax, player
├─ assets/         → fotos (masters + variantes) e fontes
├─ tools/          → script de imagens, rodado à mão (não é build do site)
└─ .github/workflows/deploy.yml
```

## Rodar localmente

```bash
python -m http.server 8000
```

Depois abra `http://127.0.0.1:8000`. Precisa de servidor: abrir o `index.html`
direto pelo arquivo quebra o carregamento das imagens de fundo.

## Pendências de conteúdo

Três coisas dependem de material que ainda não está no repositório.

### 1. Depoimentos — obrigatório antes de publicar

A seção `#depoimentos` tem três cartões marcados com **"⚠ Preencher"**, em
borda tracejada. Eles são propositalmente feios para que não passem
despercebidos. Substitua cada um pelo depoimento real de um aluno seguindo o
modelo que está comentado logo acima da seção no `index.html`, e remova a
classe `quote--vazio` e o `<span class="quote__flag">`.

### 2. Prévia em áudio — opcional

Grave um trecho tocando (30 a 60 segundos) e salve como:

```
assets/previa.mp3
```

A seção de prévia e o link "Ouvir uma prévia" do topo nascem escondidos e
aparecem sozinhos assim que o arquivo existir. Sem o arquivo, a página
simplesmente não mostra o player — nada quebra.

### 3. Oferta com prazo — desativada

O bloco de "De R$ 297 / 50% OFF" está comentado dentro do cartão de preço, no
`index.html`, junto das instruções para reativá-lo. Só volte a exibir o
desconto quando existir um prazo real, e apenas se R$ 297 for de fato o preço
praticado fora da promoção.

## Imagens

Os JPG e PNG sem sufixo em `assets/` são os **masters** — os originais de
câmera foram descartados e **não estão em lugar nenhum fora daqui**. Nunca
apague um master: é dele que saem todas as variantes. Ele não é servido ao
visitante, só fica no repositório.

| Master | Onde aparece |
|---|---|
| `hero-duelo.jpg` | Fundo do topo, fundo da chamada final e imagem de compartilhamento |
| `bg-vagao.jpg` | Fundo da seção "Por que tanta gente guarda a gaita na gaveta" |
| `bg-trilhos.jpg` | Fundo da seção de prévia em áudio |
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

### Trocar uma foto

Substitua o **master**, mantendo o nome e a proporção aproximada — fundos
horizontais com 1700–2400 px de largura, retratos verticais com ~820 px. Em
seguida rode `node tools/gerar-imagens.js` para refazer as variantes, e
commite as duas coisas. Trocar só o master não muda nada na página: ela serve
as variantes.

## Publicação (GitHub Pages)

1. Faça push na branch `main`.
2. Em **Settings › Pages**, defina **Source = GitHub Actions**.
3. O workflow `.github/workflows/deploy.yml` publica a raiz a cada push.
4. A URL aparece em **Deployments › GitHub Pages**.
