import React from 'react'
import { createRoot } from 'react-dom/client'
import { resolveTheme } from './featureFlags.js'
import { assetUrl, botanicalAsset } from './assets.js'
import { preloadIntroAssets } from './introAssets.js'

const theme = resolveTheme(window.location.search)
document.documentElement.dataset.theme = theme
document.querySelector('meta[name="color-scheme"]')?.setAttribute(
  'content', theme === 'dark' ? 'dark light' : 'only light',
)
if (theme === 'dark') document.documentElement.style.backgroundColor = '#511C25'
document.querySelector('meta[name="theme-color"]')?.setAttribute(
  'content', theme === 'dark' ? '#511C25' : '#F4EBDD',
)
const background = document.createElement('link')
background.rel = 'preload'
background.as = 'image'
background.href = assetUrl(botanicalAsset())
document.head.append(background)
if (theme === 'dark') {
  document.documentElement.style.setProperty('--dark-botanical-background', `url("${background.href}")`)
}

preloadIntroAssets()

// Load invitation styles before mounting to avoid an unstyled flash.
async function mountInvitation() {
  const [{ default: App }] = await Promise.all([
    import('./App.jsx'), import('./styles.css'),
    theme === 'dark' ? import('./dark.css') : Promise.resolve(),
  ])
  createRoot(document.getElementById('root')).render(
    <React.StrictMode><App /></React.StrictMode>,
  )
}
mountInvitation()
