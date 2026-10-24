// Only an explicit opt-in enables the experimental visual experience.
export function resolveOpening(search) {
  if (isThreadDateEnabled(search)) return 'enhanced';
  return ['enhanced', 'enhancement'].includes(new URLSearchParams(search).get('opening')?.toLowerCase())
    ? 'enhanced'
    : 'classic';
}

export function isThreadDateEnabled(search) {
  return new URLSearchParams(search).get('thread')?.toLowerCase() === 'choose-date';
}

export function resolveTheme(search) {
  return new URLSearchParams(search).get('theme')?.toLowerCase() === 'dark'
    ? 'dark'
    : 'light';
}
