import { assetUrl, botanicalAsset, radhaKrishnaAsset } from './assets.js';

function preloadImage(src) {
  return new Promise((resolve) => {
    const image = new Image();
    let finished = false;
    let decoding = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      resolve();
    };
    const decodeImage = () => {
      if (decoding) return;
      decoding = true;
      if (typeof image.decode === "function") {
        image
          .decode()
          .catch(() => {})
          .then(finish);
      } else {
        finish();
      }
    };

    image.onload = decodeImage;
    image.onerror = finish;
    image.src = src;

    if (image.complete) {
      if (image.naturalWidth > 0) decodeImage();
      else finish();
    }
  });
}

let imageReadiness;

// Shared by bootstrap and React so downloads start early and StrictMode reuses decoding.
export function preloadIntroAssets() {
  return imageReadiness ??= Promise.all([
    radhaKrishnaAsset(), botanicalAsset(),
    'envelope-botanical-overlay.webp', 'envelope-paper-texture.webp',
    'ivory-paper-texture.webp', 'wax-seal-texture.webp',
    'ganesha-seal-engraving.webp',
    'couple-calligraphy-groom-final.png', 'couple-calligraphy-bride-final.png',
  ].map(asset => preloadImage(assetUrl(asset))));
}
