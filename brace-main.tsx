import './index.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import BraceApp from './BraceApp';

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <BraceApp />
    </StrictMode>
  );
}
