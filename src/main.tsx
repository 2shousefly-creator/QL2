import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './styles/military-ui.css';
import './styles/responsive-overlays.css';
import './styles/modal-design-system.css';
import './styles/core-visual.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
