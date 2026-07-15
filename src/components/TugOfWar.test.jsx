import React, { useState } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import api from "../api";
import TugOfWar from "./TugOfWar";

jest.mock("../api", () => ({ put: jest.fn(() => Promise.resolve({ data: {} })) }));
jest.mock("./notifications/ToastProvider", () => ({ dispatchToast: jest.fn() }));

const initialCharacter = {
  _id: "character-1",
  determinationLevel: 9,
  determinationPoints: 7,
  assimilationLevel: 1,
  assimilationPoints: 1,
};

const Harness = ({ initial = initialCharacter }) => {
  const [character, setCharacter] = useState(initial);
  return <TugOfWar character={character} setCharacter={setCharacter} />;
};

describe("Cabo de Guerra", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    api.put.mockClear();
  });

  afterEach(() => {
    act(() => jest.runOnlyPendingTimers());
    jest.useRealTimers();
  });

  test("preserva a edição livre e apenas avisa quando os níveis não somam dez", async () => {
    const view = render(<Harness />);
    expect(screen.getByText("Cabo de Guerra")).toBeTruthy();

    fireEvent.change(screen.getByLabelText("Nível de Assimilação"), { target: { value: "2" } });

    expect(screen.getByText("Configuração livre: níveis somam 11.")).toBeTruthy();

    await act(async () => jest.advanceTimersByTime(250));
    expect(api.put).toHaveBeenCalledWith("/characters/character-1/tugofwar", expect.objectContaining({
      determinationLevel: 9,
      assimilationLevel: 2,
      determinationPoints: 7,
      assimilationPoints: 1,
    }));
    view.unmount();
  });

  test("reduz os pontos junto com o nível", async () => {
    const view = render(<Harness />);

    fireEvent.change(screen.getByLabelText("Nível de Determinação"), { target: { value: "4" } });

    expect(screen.getByText("4", { selector: "strong" })).toBeTruthy();
    await act(async () => jest.advanceTimersByTime(250));
    expect(api.put).toHaveBeenCalledWith("/characters/character-1/tugofwar", expect.objectContaining({
      determinationLevel: 4,
      determinationPoints: 4,
    }));
    view.unmount();
  });

  test("não trata os extremos padrão como recurso esgotado", () => {
    const view = render(<Harness initial={{
      ...initialCharacter,
      determinationLevel: 10,
      determinationPoints: 10,
      assimilationLevel: 0,
      assimilationPoints: 0,
    }} />);

    expect(screen.queryByText(/esgotada/i)).toBeNull();
    view.unmount();
  });
});
