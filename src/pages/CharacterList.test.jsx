import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import api from "../api";
import { ConfirmProvider } from "../components/notifications/ConfirmProvider";
import CharacterList from "./CharacterList";

jest.mock("../api", () => ({ __esModule: true, default: { get: jest.fn(), delete: jest.fn() } }));

const renderList = () => {
  const store = configureStore({ reducer: { auth: (state = { token: "token", isAuthenticated: true }) => state } });
  return render(<Provider store={store}><MemoryRouter><ConfirmProvider><CharacterList /></ConfirmProvider></MemoryRouter></Provider>);
};

describe("lista de personagens", () => {
  beforeEach(() => api.get.mockResolvedValue({ data: [{ _id: "p1", name: "Yuri", occupation: "Batedor", currentHealthLevel: 5 }] }));

  test("card preserva a arte e oferece link acessível", async () => {
    renderList();
    await waitFor(() => expect(screen.getByText("Yuri")).toBeInTheDocument());
    expect(screen.getByRole("link", { name: "Abrir ficha de Yuri" })).toHaveAttribute("href", "/character-sheet/p1");
  });

  test("não exibe filtros para uma lista pequena de personagens", async () => {
    renderList();
    await waitFor(() => expect(screen.getByText("Yuri")).toBeInTheDocument());
    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
    expect(screen.queryByText("Ordenar")).not.toBeInTheDocument();
  });
});
