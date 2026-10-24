import React from 'react'
import { createRoot } from 'react-dom/client'
import { resolveTheme } from './featureFlags.js'

const theme = resolveTheme(window.location.search)
document.documentElement.dataset.theme = theme
document.querySelector('meta[name="color-scheme"]')?.setAttribute(
  'content', theme === 'dark' ? 'dark' : 'only light',
)
if (theme === 'dark') document.documentElement.style.backgroundColor = '#511C25'
document.querySelector('meta[name="theme-color"]')?.setAttribute(
  'content', theme === 'dark' ? '#511C25' : '#F4EBDD',
)
const background = document.createElement('link')
background.rel = 'preload'
background.as = 'image'
background.href = `${import.meta.env.BASE_URL}assets/${theme === 'dark' ? 'envelope-botanical-background-dark.png' : 'envelope-botanical-background.png'}`
document.head.append(background)
if (theme === 'dark') {
  document.documentElement.style.setProperty('--dark-botanical-background', `url("${background.href}")`)
}

// Load invitation styles before mounting to avoid an unstyled flash.
async function mountInvitation() {
  const [{ default: App }] = await Promise.all([import('./App.jsx'), import('./styles.css')])
  if (theme === 'dark') {
    const image = new Image()
    image.src = background.href
    await Promise.all([import('./dark.css'), image.decode().catch(() => {})])
  }
  createRoot(document.getElementById('root')).render(
    <React.StrictMode><App /></React.StrictMode>,
  )
}
mountInvitation()
