import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import EmptyState from "./EmptyState";
import ErrorState from "./ErrorState";

describe("estados reutilizáveis", () => {
  test("renderiza ações primária e secundária no estado vazio", () => {
    render(
      <EmptyState
        title="Sem registros"
        primaryAction={<button type="button">Criar</button>}
        secondaryAction={<button type="button">Importar</button>}
      />
    );
    expect(screen.getByRole("button", { name: "Criar" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Importar" })).toBeInTheDocument();
  });

  test("bloqueia tentativas repetidas enquanto retry está em andamento", async () => {
    let resolveRetry;
    const onRetry = jest.fn(() => new Promise((resolve) => { resolveRetry = resolve; }));
    render(<ErrorState onRetry={onRetry} />);
    const retry = screen.getByRole("button", { name: /tentar novamente/i });
    fireEvent.click(retry);
    fireEvent.click(retry);
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: /tentando/i })).toBeDisabled();
    await act(async () => resolveRetry());
  });
});
