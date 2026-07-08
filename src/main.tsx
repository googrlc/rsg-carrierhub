import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// No login screen: the Carrier Hub is reachable only over the RSG tailnet
// (Tailscale), and all data access goes through the box's /api/carriers
// endpoint (service role). Network membership is the access boundary.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
