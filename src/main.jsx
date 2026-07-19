import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Register the service worker and keep every installed device on the
// latest version automatically - no manual delete/reinstall required.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const swUrl = `${import.meta.env.BASE_URL}sw.js`;

    navigator.serviceWorker.register(swUrl).then((registration) => {
      // Check GitHub Pages for a newer sw.js every time the app is opened.
      registration.update();

      // If a new service worker takes control (i.e. a new version was
      // just deployed), reload the page once to pick up the fresh assets.
      let hasReloaded = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (hasReloaded) return;
        hasReloaded = true;
        window.location.reload();
      });
    }).catch((err) => {
      console.error('Service worker registration failed:', err);
    });
  });
}
