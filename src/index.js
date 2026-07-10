// index.js ATUALIZADO

import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import store from "./redux/store";
import App from "./App";
import "./index.css";
import "./styles/nero-theme.css";
import { HelmetProvider } from 'react-helmet-async';
import FireflyBackground from './components/FireflyBackground'; // <-- 1. IMPORTAR AQUI
import { ToastProvider } from './components/notifications/ToastProvider';
import { ConfirmProvider } from './components/notifications/ConfirmProvider';

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <HelmetProvider>
      <Provider store={store}>
        <ToastProvider>
          <ConfirmProvider>
            <FireflyBackground /> {/* <-- 2. ADICIONAR AQUI */}
            <App />
          </ConfirmProvider>
        </ToastProvider>
      </Provider>
    </HelmetProvider>
  </React.StrictMode>
);
