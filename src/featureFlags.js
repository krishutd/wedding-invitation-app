export function resolveTheme(search) {
  return new URLSearchParams(search).get('theme')?.toLowerCase() === 'dark'
    ? 'dark'
    : 'light';
}
