import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import api from "../api";
import { ConfirmProvider } from "../components/notifications/ConfirmProvider";
import CampaignList from "./CampaignList";

jest.mock("../api", () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), delete: jest.fn() },
}));

const campaigns = [
  { _id: "a", name: "Mesa Ativa", description: "Cidade", status: "active", isMaster: true },
  { _id: "p", name: "Mesa Pausada", description: "Floresta", status: "paused", isMaster: false },
];

const renderList = () => {
  const store = configureStore({ reducer: { auth: (state = { user: { _id: "u1" }, token: "token" }) => state } });
  return render(<Provider store={store}><MemoryRouter><ConfirmProvider><CampaignList /></ConfirmProvider></MemoryRouter></Provider>);
};

describe("lista de campanhas", () => {
  beforeEach(() => api.get.mockResolvedValue({ data: campaigns }));

  test("mostra as campanhas sem painel de filtros", async () => {
    renderList();
    await waitFor(() => expect(screen.getByText("Mesa Ativa")).toBeInTheDocument());
    expect(screen.getByText("Mesa Pausada")).toBeInTheDocument();
    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Pausadas" })).not.toBeInTheDocument();
  });

  test("exclusão exige confirmação explícita", async () => {
    renderList();
    await waitFor(() => expect(screen.getByText("Mesa Ativa")).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "Excluir campanha Mesa Ativa" }));
    expect(screen.getByRole("dialog", { name: "Excluir campanha?" })).toBeInTheDocument();
    expect(api.delete).not.toHaveBeenCalled();
  });
});
