# GuidaGaita — Landing Page

Landing page de vendas do curso GuidaGaita. HTML, CSS e JavaScript puros, sem
build e sem dependências: os três arquivos da raiz são o site inteiro.

## Estrutura

```
landing-page-vendas/
├─ index.html      → conteúdo e estrutura das seções
├─ styles.css      → design system completo (cores, tipografia, animações)
├─ scripts.js      → revelações, contadores, poeira, parallax, player
├─ assets/         → fotos
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

`assets/` contém só as 10 imagens que a página usa — os originais de câmera
(bem maiores e mais pesados) foram descartados depois de gerar estas versões
web. Se precisar recortar ou reprocessar alguma, terá que refotografar ou
recuperar o original de outro backup: **eles não estão no git**, então
apagados aqui não há como restaurar.

| Arquivo | Onde aparece |
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

Peso total: cerca de 1,8 MB para as 10 — bem abaixo do que os originais de
câmera pesariam (perto de 100 MB, o que levaria mais de um minuto para
carregar no celular).

### Ajustar a intensidade de um fundo

Cada seção controla o próprio fundo por duas variáveis no `styles.css`, no
bloco "Intensidade seção a seção":

- `--bg-op` — quanto a foto aparece (0 a 1)
- `--veu` — quanto a camada escura por cima cobre (0 a 1)

Seção com muito texto usa foto fraca e véu forte; seção narrativa, o
contrário. Para trocar a foto de uma seção, basta mudar a classe
`section-bg--*` no `index.html`.

### Trocar uma foto

Substitua o arquivo, mantendo o nome e a proporção aproximada. Ao gerar a
partir de uma foto nova, use: fundos horizontais com 1700–2400 px de largura
e qualidade JPEG 60–70 (ficam sob camadas escuras, não precisam de mais), e
retratos verticais com ~820 px de largura e qualidade 82.

## Publicação (GitHub Pages)

1. Faça push na branch `main`.
2. Em **Settings › Pages**, defina **Source = GitHub Actions**.
3. O workflow `.github/workflows/deploy.yml` publica a raiz a cada push.
4. A URL aparece em **Deployments › GitHub Pages**.
