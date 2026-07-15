import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import CharacteristicsMenu from "./CharacteristicsMenu";

describe("características oficiais de item", () => {
  test("exibe todas as categorias na ordem do livro", () => {
    render(
      <CharacteristicsMenu
        open
        item={{ characteristics: { points: 10, details: [] } }}
        onClose={jest.fn()}
        onChange={jest.fn()}
      />
    );

    expect(screen.getByText("Pesado")).toBeInTheDocument();
    expect(screen.getByText("Uso Único")).toBeInTheDocument();
    expect(screen.getByText("Iluminador")).toBeInTheDocument();
    expect(screen.getByText("Restaurador")).toBeInTheDocument();
    expect(screen.getAllByText(/^Categoria /).map((node) => node.textContent)).toEqual([
      "Categoria -1",
      "Categoria 1",
      "Categoria 2",
      "Categoria 3",
      "Categoria 4",
    ]);
  });

  test("Explosivo inclui Uso Único sem reduzir sua categoria", async () => {
    const onChange = jest.fn();
    render(
      <CharacteristicsMenu
        open
        item={{ characteristics: { points: 10, details: [] } }}
        onClose={jest.fn()}
        onChange={onChange}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Adicionar característica Explosivo" }));

    await waitFor(() => expect(onChange).toHaveBeenCalled());
    const updated = onChange.mock.calls.at(-1)[0].characteristics;
    expect(updated.points).toBe(6);
    expect(updated.details.map(({ name }) => name)).toEqual(["Explosivo", "Uso Único"]);
  });
});
