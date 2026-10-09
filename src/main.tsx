import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './styles/military-ui.css';
import './styles/responsive-overlays.css';
import './styles/modal-design-system.css';
import './styles/core-visual.css';
import './styles/command-art.css';
import './styles/flat-dark.css';
import { UiSkinProvider } from './components/core-visual/UiSkinContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UiSkinProvider skin="flat"><App /></UiSkinProvider>
  </StrictMode>,
);
