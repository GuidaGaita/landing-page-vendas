# Specs — os mapas de construção

Este diretório é o "spec driven" do projeto: cada demanda vira uma pasta
numerada com um `spec.md`, e a implementação só começa quando a spec
está `pronta`. O código segue a spec, não o contrário — e a spec fica
aqui depois, como registro de por que as coisas são como são.

## Fluxo

1. **Demanda nova** → copie `_modelo.md` para `specs/NNN-slug/spec.md`.
   Numeração sequencial: o número é ordem de chegada, não prioridade.
2. **Especificar** (o quê e por quê): contexto, objetivo, requisitos
   verificáveis, fora de escopo. Ainda sem solução.
3. **Decidir**: a seção "Entradas e decisões pendentes" lista o que só o
   dono do produto responde (link do vídeo, preço, fonte escolhida).
   Enquanto houver item sem resposta, status = `aguardando decisão`.
4. **Planejar** (como): abordagem, arquivos tocados, riscos. Conferir
   contra `constituicao.md`. Se o plano viola um princípio, ou a spec
   muda ou a constituição muda — mas de forma consciente e escrita.
5. **Implementar** pelas tarefas, marcando `[x]`. Commits pequenos,
   citando a spec na mensagem (`spec 002: fachada do vídeo`).
6. **Verificar** pelos critérios de aceite e pela seção "Verificação".
   Só então status = `concluída`.

Status possíveis: `rascunho` · `aguardando decisão` · `pronta` ·
`em andamento` · `concluída` · `cancelada`.

Quem implementa (você ou o Claude) lê nesta ordem: `constituicao.md`, a
spec da demanda e a parte do `README.md` da raiz que a spec cita.

## Roadmap

Ordem sugerida de execução e o motivo de cada posição:

| Ordem | Spec | Status | Depende de | Por que aqui |
|---|---|---|---|---|
| 1 | [001 — Preços e checkout](001-precos-e-checkout/spec.md) | concluída | — | Menor esforço, maior impacto direto na venda, zero risco visual. |
| 2 | [006 — Auditoria de estilos](006-auditoria-de-estilos/spec.md), grupo A | concluída (menos A6) | — | Correções de minutos (texto selecionável, contraste, erros de texto). Podem ir no mesmo commit da 001. |
| 3 | [002 — VSL no topo](002-vsl-no-hero/spec.md) | concluída | — | Reorganiza o hero inteiro. Partícula e animação vivem lá, então vem antes delas. |
| 4 | [003 — Tipografia](003-tipografia/spec.md) | aguardando decisão | — | Muda a métrica de todo título. A coreografia (005) depende da fonte final. |
| 5 | [004 — Partículas do hero](004-particulas-do-hero/spec.md) | concluída | 002 | A partícula cobre o hero novo; decidir depois de saber onde o vídeo fica. |
| 6 | [005 — Animações](005-animacoes/spec.md) | concluída | 002, 003 | Camada de polimento. Por último para não refazer. |
| 7 | [006 — Auditoria de estilos](006-auditoria-de-estilos/spec.md), grupos B a D | em andamento | 003 | Escala tipográfica e gradação "assada" nas imagens andam junto com a 003. |

## Origem

A estrutura (constituição → spec → plano → tarefas) é a mesma do
[spec-kit](https://github.com/github/spec-kit) do GitHub, só que sem a
CLI: aqui tudo é Markdown em pasta, sem dependência nenhuma — como o
resto do projeto. Se um dia valer adotar a ferramenta, os arquivos
migram quase sem mexer.
