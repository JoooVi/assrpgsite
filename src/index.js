// index.js ATUALIZADO

import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import store from "./redux/store";
import App from "./App";
import "./index.css";
import { HelmetProvider } from 'react-helmet-async';
import FireflyBackground from './components/FireflyBackground'; // <-- 1. IMPORTAR AQUI

const container = document.getElementById("root");
const root = createRoot(container);

console.log("Renderizando aplicação...");

root.render(
  <React.StrictMode>
    <HelmetProvider>
      <Provider store={store}>
        <FireflyBackground /> {/* <-- 2. ADICIONAR AQUI */}
        <App />
      </Provider>
    </HelmetProvider>
  </React.StrictMode>
);

console.log("Aplicação renderizada com sucesso");