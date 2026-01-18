import { useState } from 'react'
import { useFeatureFlag, useFeatureFlagValue, FeatureFlag } from '@localflag/react'
import type { AppFlags } from './flags'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const darkMode = useFeatureFlag<AppFlags>('darkMode')
  const maxItems = useFeatureFlagValue<AppFlags>('maxItems')
  const apiVersion = useFeatureFlagValue<AppFlags>('apiVersion')

  return (
    <div style={{ filter: darkMode ? 'invert(1) hue-rotate(180deg)' : 'none' }}>
      <FeatureFlag<AppFlags> flag="newHeader">
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '12px 24px',
          borderRadius: 8,
          marginBottom: 24,
          color: 'white'
        }}>
          New Header Component (feature flag enabled)
        </div>
      </FeatureFlag>

      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>LocalFlag Demo</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Max items: <strong>{maxItems}</strong> | API Version: <strong>{apiVersion}</strong>
        </p>
      </div>

      <FeatureFlag<AppFlags> flag="experimentalFeature">
        <div style={{
          background: '#ff6b6b',
          padding: '12px 24px',
          borderRadius: 8,
          marginTop: 24,
          color: 'white'
        }}>
          Experimental Feature (enable in DevTools)
        </div>
      </FeatureFlag>

      <p className="read-the-docs">
        Open the DevTools panel (bottom-right) to toggle feature flags
      </p>
    </div>
  )
}

export default App
