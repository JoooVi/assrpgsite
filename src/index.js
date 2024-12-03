import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import store from "./redux/store";
import App from "./App";
import "./index.css";

const container = document.getElementById("root");
const root = createRoot(container);

console.log("Renderizando aplicação...");

root.render(
  <Provider store={store}>
    <App />
  </Provider>
);

console.log("Aplicação renderizada com sucesso");