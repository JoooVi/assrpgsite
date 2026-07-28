import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import CharacteristicsList from "./CharacteristicsList";

const mockDispatch = jest.fn();

jest.mock("react-redux", () => ({
  useDispatch: () => mockDispatch,
  useSelector: (selector) => selector({
    auth: { token: null, user: { _id: "u1" } },
    characteristics: { characterTraits: [] },
  }),
}));

jest.mock("./notifications/ConfirmProvider", () => ({
  useConfirm: () => ({ confirm: jest.fn() }),
}));

jest.mock("../redux/slices/characteristicsSlice", () => ({
  createCharacteristic: jest.fn((payload) => ({ type: "test/create", payload })),
  updateCharacteristic: jest.fn((payload) => ({ type: "test/update", payload })),
  deleteCharacteristic: jest.fn((payload) => ({ type: "test/delete", payload })),
  fetchCharacterTraits: jest.fn(() => ({ type: "test/fetch" })),
}));

describe("modais de Homebrew", () => {
  test("Escape fecha a criação e devolve o foco ao botão", async () => {
    render(<CharacteristicsList traits={[]} />);
    const trigger = screen.getByRole("button", { name: /criar nova característica/i });
    trigger.focus();
    fireEvent.click(trigger);
    expect(screen.getByRole("dialog", { name: /nova característica/i })).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });

  test("digitar no formulario nao move o foco para o botao de fechar", async () => {
    render(<CharacteristicsList traits={[]} />);
    fireEvent.click(screen.getByRole("button", { name: /criar nova caracter/i }));

    const nameInput = screen.getAllByRole("textbox")[0];
    nameInput.focus();
    fireEvent.change(nameInput, { target: { value: "Marca" } });

    await waitFor(() => expect(nameInput).toHaveFocus());
    expect(nameInput).toHaveValue("Marca");
  });
});
