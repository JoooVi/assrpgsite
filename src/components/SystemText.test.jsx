import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import SystemText from "./SystemText";

describe("SystemText", () => {
  test("renderiza a sintaxe de simbolo com dois-pontos", () => {
    render(<SystemText text="Receba :Pressao: agora." />);

    expect(screen.getByRole("img", { name: /press/i })).toBeInTheDocument();
    expect(screen.queryByText(":Pressao:")).not.toBeInTheDocument();
  });

  test("preserva tokens desconhecidos escritos com dois-pontos", () => {
    render(<SystemText text="Use :token_desconhecido: aqui." />);
    expect(screen.getByText(/:token_desconhecido:/)).toBeInTheDocument();
  });
});
