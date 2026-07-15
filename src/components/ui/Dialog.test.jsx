import React, { useState } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import Dialog from "./Dialog";
import { ConfirmProvider, useConfirm } from "../notifications/ConfirmProvider";

const DialogHarness = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>Abrir</button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Editar registro"
        actions={<button type="button">Salvar</button>}
      >
        <input aria-label="Nome" />
      </Dialog>
    </>
  );
};

const ConfirmHarness = () => {
  const { confirm } = useConfirm();
  const [result, setResult] = useState("pendente");
  return (
    <>
      <button type="button" onClick={async () => setResult(String(await confirm("Excluir registro?")))}>Excluir</button>
      <output>{result}</output>
    </>
  );
};

describe("Dialog", () => {
  test("fecha com Escape e devolve o foco ao gatilho", async () => {
    render(<DialogHarness />);
    const trigger = screen.getByRole("button", { name: "Abrir" });
    trigger.focus();
    fireEvent.click(trigger);
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });

  test("mantém o Tab dentro do diálogo", async () => {
    render(<DialogHarness />);
    fireEvent.click(screen.getByRole("button", { name: "Abrir" }));
    const close = screen.getByRole("button", { name: "Fechar janela" });
    const save = screen.getByRole("button", { name: "Salvar" });
    await waitFor(() => expect(close).toHaveFocus());
    save.focus();
    fireEvent.keyDown(window, { key: "Tab" });
    expect(close).toHaveFocus();
  });

  test("Enter não confirma ação destrutiva", async () => {
    render(<ConfirmProvider><ConfirmHarness /></ConfirmProvider>);
    fireEvent.click(screen.getByRole("button", { name: "Excluir" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    fireEvent.keyDown(window, { key: "Enter" });
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("pendente")).toBeInTheDocument();
  });

  test("mantém estrutura rolável e bloqueia a página em viewport pequena", async () => {
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 390 });
    render(<DialogHarness />);
    fireEvent.click(screen.getByRole("button", { name: "Abrir" }));
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveClass("nero-dialog");
    expect(dialog.querySelector(".nero-dialog-content")).toBeInTheDocument();
    expect(document.body).toHaveStyle({ overflow: "hidden" });
  });
});
