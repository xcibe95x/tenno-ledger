import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { SWRConfig } from 'swr';
import './index.css';
import App from './App.jsx';
import { StoreProvider } from './store.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { swrConfig, dataUrl, prefetch } from './lib/swr.js';

// Landing on the app kicks off every dataset it will need. Both files are
// static per deploy, so this is the only time they are requested — the Mods
// tab then opens straight from cache.
prefetch(dataUrl('items.json'));
prefetch(dataUrl('mods.json'));

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <SWRConfig value={swrConfig}>
        <StoreProvider>
          <App />
        </StoreProvider>
      </SWRConfig>
    </ErrorBoundary>
  </StrictMode>,
);
