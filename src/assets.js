import { resolveTheme } from './featureFlags.js';

export function botanicalAsset() {
  return resolveTheme(window.location.search) === 'dark'
    ? 'envelope-botanical-background-dark.webp'
    : 'envelope-botanical-background.webp';
}

export function radhaKrishnaAsset() {
  return resolveTheme(window.location.search) === 'dark'
    ? 'radha-krishna-golden-moon-dark.webp'
    : 'radha-krishna-silhouette.webp';
}

// Anchor URLs to the document so project deployments do not request assets/assets/.
export function assetUrl(path) {
  return new URL(`${import.meta.env.BASE_URL}assets/${path}`, document.baseURI).href;
}
