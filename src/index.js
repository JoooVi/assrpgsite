import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import store from "./redux/store";
import App from "./App";
import "./index.css";
import { HelmetProvider } from 'react-helmet-async';

const container = document.getElementById("root");
const root = createRoot(container);

console.log("Renderizando aplicação...");

root.render(
  <React.StrictMode>
    <HelmetProvider>
      <Provider store={store}>
        <App />
      </Provider>
    </HelmetProvider>
  </React.StrictMode>
);

console.log("Aplicação renderizada com sucesso");