//import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './bootstrap.min.css';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  // disable strict mode because it breaks loadAllRes() on dev
  //<React.StrictMode>
  <App />
  //</React.StrictMode>
);
