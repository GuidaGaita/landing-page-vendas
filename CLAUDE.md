# GuidaGaita — landing page

Site estático (HTML, CSS e JS puros, sem build). O `README.md` explica a
estrutura, o pipeline de imagens, as fontes, o pixel e o deploy — leia a
seção relevante antes de mexer na área correspondente.

## Como o trabalho é organizado (spec driven)

- Toda demanda tem uma spec em `specs/NNN-slug/spec.md`. Antes de
  implementar, leia `specs/constituicao.md` e a spec da demanda. Se a
  demanda não tem spec, crie uma a partir de `specs/_modelo.md` antes de
  escrever código.
- Spec com decisão pendente não se implementa. Pergunte, ou faça só a
  parte que não depende da resposta e deixe claro o que ficou de fora.
- Marque as tarefas (`[x]`) conforme avançar e atualize o `Status` no
  topo da spec. Commits citam a spec: `spec 002: fachada do vídeo`.
- `specs/README.md` tem o fluxo completo e o roadmap com a ordem sugerida.

## Regras que mais quebram

- Sem dependência em runtime, sem CDN de fonte, sem `npm` para o site.
- Animação só com `opacity`, `transform` e `clip-path`; respeita
  `prefers-reduced-motion`; nada some sem JS.
- Imagem nova = master em `assets/` + `node tools/gerar-imagens.js` +
  commit das variantes.
- Interação nova = evento no `pixel.js` + linha na tabela do README.
- Preço ou link de oferta muda em `index.html` (cartões + JSON-LD),
  `pixel.js` (`OFERTAS`) e README, tudo junto.
- Texto em pt-BR; comentário explica o porquê, não o quê.

## Rodar

```bash
python -m http.server 8000   # http://127.0.0.1:8000
```
