// Only an explicit opt-in enables the experimental visual experience.
export function resolveOpening(search) {
  return ['enhanced', 'enhancement'].includes(new URLSearchParams(search).get('opening')?.toLowerCase())
    ? 'enhanced'
    : 'classic';
}
