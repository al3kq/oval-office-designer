import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { initializeStore } from './model/store'
import App from './App'
import './index.css'

initializeStore()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
