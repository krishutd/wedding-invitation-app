import { resolveTheme } from './featureFlags.js';

export function radhaKrishnaAsset() {
  return resolveTheme(window.location.search) === 'dark'
    ? 'radha-krishna-golden-moon-dark.png'
    : 'radha-krishna-silhouette.png';
}

// Anchor URLs to the document so project deployments do not request assets/assets/.
export function assetUrl(path) {
  return new URL(`${import.meta.env.BASE_URL}assets/${path}`, document.baseURI).href;
}
