// Only an explicit opt-in enables the experimental visual experience.
export function resolveOpening(search) {
  return new URLSearchParams(search).get('opening')?.toLowerCase() === 'enhanced'
    ? 'enhanced'
    : 'classic';
}
