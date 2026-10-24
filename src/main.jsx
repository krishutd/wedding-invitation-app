import React from 'react'
import { createRoot } from 'react-dom/client'
import { resolveOpening, resolveTheme } from './featureFlags.js'

const opening = resolveOpening(window.location.search)
const theme = resolveTheme(window.location.search)
document.documentElement.dataset.theme = theme
document.querySelector('meta[name="color-scheme"]')?.setAttribute(
  'content', theme === 'dark' ? 'dark' : 'only light',
)
if (theme === 'dark') document.documentElement.style.backgroundColor = '#511C25'
document.documentElement.dataset.opening = opening
document.querySelector('meta[name="theme-color"]')?.setAttribute(
  'content', theme === 'dark' ? '#511C25' : opening === 'enhanced' ? '#F4EBDD' : '#eee4cc',
)
const background = document.createElement('link')
background.rel = 'preload'
background.as = 'image'
background.href = `${import.meta.env.BASE_URL}assets/${theme === 'dark' ? 'envelope-botanical-background-dark.png' : `envelope-${opening === 'enhanced' ? 'botanical' : 'fabric'}-background.png`}`
document.head.append(background)
if (theme === 'dark') {
  document.documentElement.style.setProperty('--dark-botanical-background', `url("${background.href}")`)
}

// Load exactly one stylesheet before mounting, avoiding mixed styles or a variant flash.
async function mountInvitation() {
  const [{ default: App }] = opening === 'enhanced'
    ? await Promise.all([import('./App.jsx'), import('./styles.css')])
    : await Promise.all([import('./ClassicApp.jsx'), import('./classic.css')])
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
