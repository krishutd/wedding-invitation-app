import React from 'react'
import { createRoot } from 'react-dom/client'
import { resolveOpening } from './featureFlags.js'

const opening = resolveOpening(window.location.search)
document.documentElement.dataset.opening = opening
document.querySelector('meta[name="theme-color"]')?.setAttribute(
  'content', opening === 'enhanced' ? '#F4EBDD' : '#eee4cc',
)
const background = document.createElement('link')
background.rel = 'preload'
background.as = 'image'
background.href = `${import.meta.env.BASE_URL}assets/envelope-${opening === 'enhanced' ? 'botanical' : 'fabric'}-background.png`
document.head.append(background)

// Load exactly one stylesheet before mounting, avoiding mixed styles or a variant flash.
async function mountInvitation() {
  const [{ default: App }] = opening === 'enhanced'
    ? await Promise.all([import('./App.jsx'), import('./styles.css')])
    : await Promise.all([import('./ClassicApp.jsx'), import('./classic.css')])
  createRoot(document.getElementById('root')).render(
    <React.StrictMode><App /></React.StrictMode>,
  )
}
mountInvitation()
