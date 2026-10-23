// CSS custom-property URLs resolve against the consuming stylesheet, which lives
// in assets/ after a Vite build. Anchor them to the document before handing them
// to CSS so project deployments never accidentally request assets/assets/.
export function assetUrl(path) {
  return new URL(`${import.meta.env.BASE_URL}assets/${path}`, document.baseURI).href;
}
