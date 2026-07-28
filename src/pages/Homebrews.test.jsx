import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Homebrews from "./Homebrews";

const mockDispatch = jest.fn(() => Promise.resolve());

jest.mock("../api", () => ({ post: jest.fn() }));

jest.mock("react-redux", () => ({
  useDispatch: () => mockDispatch,
  useSelector: (selector) => selector({
    auth: { token: "token", user: { _id: "user-1" } },
    items: { items: [], loading: false, error: null },
    assimilations: {
      allAssimilations: [],
      userAssimilations: [{
        _id: "assim-1",
        name: "Visao Termica",
        isCustom: true,
        createdBy: "user-1",
      }],
      loading: false,
      error: null,
    },
    characteristics: { characterTraits: [], loading: false, error: null },
  }),
}));

jest.mock("../redux/slices/assimilationsSlice", () => ({
  fetchAllAssimilations: jest.fn(() => ({ type: "test/fetch-assimilations" })),
}));
jest.mock("../redux/slices/itemsSlice", () => ({
  fetchItems: jest.fn(() => ({ type: "test/fetch-items" })),
}));
jest.mock("../redux/slices/characteristicsSlice", () => ({
  fetchCharacterTraits: jest.fn(() => ({ type: "test/fetch-traits" })),
}));

jest.mock("../components/AssimilationsList", () => ({ assimilationItems }) => (
  <div data-testid="assimilation-list">
    {assimilationItems.map((item) => <span key={item._id}>{item.name}</span>)}
  </div>
));
jest.mock("../components/ItemsList", () => () => <div />);
jest.mock("../components/CharacteristicsList", () => () => <div />);

describe("Homebrews", () => {
  beforeEach(() => jest.clearAllMocks());

  test("mostra imediatamente uma assimilacao criada na lista do usuario", async () => {
    render(<Homebrews />);
    expect(await screen.findByText("Visao Termica")).toBeInTheDocument();
  });
});
