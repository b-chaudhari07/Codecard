import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import './index.css'
import App from './App.tsx'
import { AppErrorBoundary } from './components/ui/AppErrorBoundary'
import { applyTheme, getInitialTheme } from './lib/appTheme'
import { sanitizeAnalyticsUrl } from './lib/analytics'

// Apply before the first paint so a stored preference never flashes.
applyTheme(getInitialTheme())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppErrorBoundary>
      <App />
      {import.meta.env.PROD ? (
        <Analytics
          beforeSend={(event) => ({
            ...event,
            url: sanitizeAnalyticsUrl(event.url),
          })}
        />
      ) : null}
    </AppErrorBoundary>
  </StrictMode>,
)
