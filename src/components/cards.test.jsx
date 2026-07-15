import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import CampaignCard from "./campaigns/CampaignCard";
import CharacterCard from "./characters/CharacterCard";

jest.mock("@dicebear/core", () => ({
  createAvatar: () => ({ toString: () => '<svg xmlns="http://www.w3.org/2000/svg" />' }),
}));
jest.mock("@dicebear/collection", () => ({ adventurerNeutral: {} }));

describe("cards semânticos", () => {
  test("CampaignCard usa link e mostra status traduzido", () => {
    render(<MemoryRouter><CampaignCard campaign={{ _id: "c1", name: "A Busca", status: "paused", isMaster: false, masterName: "Lia" }} /></MemoryRouter>);
    expect(screen.getByText("Pausada")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /abrir campanha/i })).toHaveAttribute("href", "/campaign-lobby/c1");
  });

  test("controle destrutivo aparece apenas para mestre", () => {
    const onDelete = jest.fn();
    const { rerender } = render(<MemoryRouter><CampaignCard campaign={{ _id: "c1", name: "Mesa", isMaster: false }} onDelete={onDelete} /></MemoryRouter>);
    expect(screen.queryByRole("button", { name: /excluir campanha/i })).not.toBeInTheDocument();
    rerender(<MemoryRouter><CampaignCard campaign={{ _id: "c1", name: "Mesa", isMaster: true }} onDelete={onDelete} /></MemoryRouter>);
    fireEvent.click(screen.getByRole("button", { name: /excluir campanha/i }));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  test("CharacterCard mantém link real sobre o card visual", () => {
    render(<MemoryRouter><CharacterCard character={{ _id: "p1", name: "Yuri", occupation: "Batedor", currentHealthLevel: 3 }} canDelete={false} /></MemoryRouter>);
    const link = screen.getByRole("link", { name: "Abrir ficha de Yuri" });
    link.focus();
    expect(link).toHaveFocus();
    expect(link).toHaveAttribute("href", "/character-sheet/p1");
  });

  test("ação secundária do personagem permanece fora do link principal", () => {
    const onDelete = jest.fn();
    render(<MemoryRouter><CharacterCard character={{ _id: "p1", name: "Yuri" }} onDelete={onDelete} /></MemoryRouter>);
    const link = screen.getByRole("link", { name: "Abrir ficha de Yuri" });
    const remove = screen.getByRole("button", { name: "Excluir personagem Yuri" });
    expect(link).not.toContainElement(remove);
    fireEvent.click(remove);
    expect(onDelete).toHaveBeenCalledTimes(1);
  });
});
