import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { FeatureFlagProvider, DevTools } from '@localflag/react'
import { defaultFlags } from './flags'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FeatureFlagProvider defaultFlags={defaultFlags}>
      <App />
      <DevTools />
    </FeatureFlagProvider>
  </StrictMode>,
)
