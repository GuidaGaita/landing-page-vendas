# GuidaGaita Landing Page

Landing page promocional para o curso GuidaGaita.

## Publicação via GitHub Pages

1. Crie o repositório e faça o push com os arquivos deste diretório (`git init`, `git remote add origin ...`, `git push origin main`).
2. Em **Settings › Pages**, defina **Source = GitHub Actions**.
3. Cada push no branch `main` executará o workflow `.github/workflows/deploy.yml`, que publica o conteúdo da raiz.
4. A URL ficará disponível em **Deployments › GitHub Pages** após o primeiro deploy.

## Estrutura

```
landing-page-vendas/
├─ index.html
├─ styles.css
├─ scripts.js
└─ .github/workflows/deploy.yml
```

Personalize estilos, imagens em `assets/` e textos conforme necessário.
