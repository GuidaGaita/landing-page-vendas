/* ═══════════════════════════════════════════════════════════
   Gera as variantes AVIF/WebP/fallback que a página serve.

   Isto NÃO é um build do site: o site continua sendo três
   arquivos estáticos, sem dependência nenhuma. Este script roda
   à mão, só quando uma foto entra ou é trocada, e o resultado é
   commitado junto. Para rodar:

       npm install sharp
       node tools/gerar-imagens.js

   Os JPG/PNG originais em assets/ são os masters — não apague.
   Eles não têm cópia fora do git (ver "Imagens" no README).
   ═══════════════════════════════════════════════════════════ */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ASSETS = path.join(__dirname, '..', 'assets');

/* Larguras e qualidade por foto.

   As fotos de fundo aguentam compressão muito mais pesada que as de
   conteúdo porque nunca são vistas limpas: entram com opacity .4-.8,
   filtro sépia e um véu escuro por cima (ver .section-bg no styles.css).
   Por isso q36 nelas e q46-50 nas que aparecem nítidas.

   O AVIF ganha larga do WebP aqui — estas fotos têm grão de filme, que
   é justamente o que o WebP comprime mal. */
const FOTOS = [
  // arquivo             larguras                webpQ avifQ  larguraDoFallback
  ['hero-duelo.jpg',     [480, 768, 1200, 1800], 66,   50,    1200],
  ['etapa-folego.jpg',   [640],                  62,   46,     640],
  ['etapa-dominio.jpg',  [640],                  62,   46,     640],
  ['etapa-estrada.jpg',  [640],                  62,   46,     640],
  ['mentor.jpg',         [520],                  64,   48,     520],
  ['bg-vagao.jpg',       [800, 1280],            42,   36,    1280],
  ['bg-trilhos.jpg',     [800, 1280],            42,   36,    1280],
  ['bg-vagoes.jpg',      [800, 1280],            42,   36,    1280],
  ['bg-encarando.jpg',   [800, 1280],            42,   36,    1280],
  ['bg-trem.jpg',        [800, 1280],            42,   36,    1280],
];

/* As duas gaitas do cartão de oferta são PNG com transparência e
   aparecem a 132x132 — 396px cobre até tela 3x. O fallback continua
   PNG (e não JPEG) porque o recorte precisa do canal alfa. */
const GAITAS = ['gaita-azul.png', 'gaita-rosa.png'];

const kb = (f) => (fs.statSync(f).size / 1024).toFixed(1) + 'KB';

(async () => {
  for (const [arquivo, larguras, webpQ, avifQ, larguraFallback] of FOTOS) {
    const src = path.join(ASSETS, arquivo);
    if (!fs.existsSync(src)) { console.log('· pulando (não existe): ' + arquivo); continue; }
    const base = arquivo.replace(/\.jpg$/, '');

    for (const w of larguras) {
      // Com uma largura só, o arquivo não leva sufixo (etapa-folego.avif);
      // com várias, leva (bg-vagao-800.avif). O HTML e o CSS seguem isso.
      const sufixo = larguras.length > 1 ? `-${w}` : '';
      await sharp(src).resize({ width: w, withoutEnlargement: true })
        .avif({ quality: avifQ, effort: 6 }).toFile(path.join(ASSETS, `${base}${sufixo}.avif`));
      await sharp(src).resize({ width: w, withoutEnlargement: true })
        .webp({ quality: webpQ, effort: 6 }).toFile(path.join(ASSETS, `${base}${sufixo}.webp`));
    }

    // Fallback para navegador sem AVIF nem WebP, e para as redes sociais,
    // que não leem nenhum dos dois (ver og:image no index.html).
    const fb = path.join(ASSETS, `${base}-fallback.jpg`);
    await sharp(src).resize({ width: larguraFallback, withoutEnlargement: true })
      .jpeg({ quality: 70, mozjpeg: true, progressive: true }).toFile(fb);

    console.log(`${arquivo.padEnd(20)} ${kb(src).padStart(8)} → ${kb(path.join(ASSETS, base + (larguras.length > 1 ? '-' + larguras[0] : '') + '.avif'))} (menor avif)`);
  }

  for (const arquivo of GAITAS) {
    const src = path.join(ASSETS, arquivo);
    if (!fs.existsSync(src)) { console.log('· pulando (não existe): ' + arquivo); continue; }
    const base = arquivo.replace(/\.png$/, '');

    await sharp(src).resize({ width: 396 }).avif({ quality: 48, effort: 6 })
      .toFile(path.join(ASSETS, `${base}.avif`));
    await sharp(src).resize({ width: 396 }).webp({ quality: 60, alphaQuality: 90, effort: 6 })
      .toFile(path.join(ASSETS, `${base}.webp`));
    await sharp(src).resize({ width: 396 }).png({ compressionLevel: 9, palette: true })
      .toFile(path.join(ASSETS, `${base}-fallback.png`));

    console.log(`${arquivo.padEnd(20)} ${kb(src).padStart(8)} → ${kb(path.join(ASSETS, base + '.avif'))} (avif)`);
  }
})();
