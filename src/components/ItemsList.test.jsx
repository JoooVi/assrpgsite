import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import ItemsList from "./ItemsList";
import { createItem } from "../redux/slices/itemsSlice";

const mockUnwrap = jest.fn();
const mockDispatch = jest.fn(() => ({ unwrap: mockUnwrap }));

jest.mock("react-redux", () => ({
  useDispatch: () => mockDispatch,
  useSelector: (selector) => selector({
    auth: { token: "token-test", user: { _id: "user-1" } },
  }),
}));

jest.mock("../redux/slices/itemsSlice", () => ({
  fetchItems: jest.fn(() => ({ type: "items/fetch" })),
  createItem: jest.fn((payload) => ({ type: "items/create", payload })),
  updateItem: jest.fn((payload) => ({ type: "items/update", payload })),
  deleteItem: jest.fn((payload) => ({ type: "items/delete", payload })),
}));

jest.mock("./notifications/ConfirmProvider", () => ({
  useConfirm: () => ({ confirm: jest.fn() }),
}));

jest.mock("./notifications/ToastProvider", () => ({
  dispatchToast: jest.fn(),
}));

describe("ItemsList", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUnwrap.mockResolvedValue({ _id: "item-1", name: "Lanterna" });
    mockDispatch.mockImplementation(() => ({ unwrap: mockUnwrap }));
  });

  test("mantem a acao de salvar visivel e envia a criacao do item", async () => {
    render(<ItemsList items={[]} currentUserId="user-1" onShare={jest.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: /criar novo item/i }));
    expect(screen.getByRole("button", { name: "Salvar item" })).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText(/rifle de precis/i), {
      target: { value: "Lanterna" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Salvar item" }));

    await waitFor(() => expect(createItem).toHaveBeenCalledTimes(1));
    expect(mockUnwrap).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });
});
