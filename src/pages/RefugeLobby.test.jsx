import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import RefugeLobby from "./RefugeLobby";
import api from "../api";

jest.mock("../api", () => ({
  get: jest.fn(),
  post: jest.fn(),
  delete: jest.fn(),
}));

jest.mock("react-redux", () => ({
  useSelector: (selector) => selector({
    auth: {
      token: "token-test",
      user: { _id: "master-1", name: "Mestre" },
    },
  }),
}));

jest.mock("../components/notifications/ToastProvider", () => ({
  dispatchToast: jest.fn(),
}));

jest.mock("../components/notifications/ConfirmProvider", () => ({
  useConfirm: () => ({ confirm: jest.fn() }),
}));

describe("RefugeLobby", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    api.get.mockImplementation((url) => {
      if (url === "/refuge/campaign/campaign-1/refuges") {
        return Promise.resolve({ data: [] });
      }
      if (url === "/campaigns/campaign-1") {
        return Promise.resolve({
          data: { _id: "campaign-1", name: "Nova campanha", master: "master-1", status: "active" },
        });
      }
      return Promise.reject(new Error(`Rota inesperada: ${url}`));
    });
  });

  test("campanha nova exibe estado vazio sem tentar criar refúgio por GET", async () => {
    render(
      <MemoryRouter initialEntries={["/campaign/campaign-1/refuges"]}>
        <Routes>
          <Route path="/campaign/:id/refuges" element={<RefugeLobby />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByText("Nenhum refúgio cadastrado")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /criar primeiro refúgio/i })).toBeInTheDocument();

    await waitFor(() => expect(api.get).toHaveBeenCalledTimes(2));
    expect(api.get).not.toHaveBeenCalledWith("/refuge/campaign/campaign-1");
  });
});
