import { getPerformanceRoute } from "./performanceRoute";

describe("getPerformanceRoute", () => {
  test.each([
    ["/", "/"],
    ["/campaigns", "/campaigns"],
    ["/campaigns/", "/campaigns"],
    ["/reset-password/private-token", "/reset-password/:token"],
    ["/character-sheet/507f1f77bcf86cd799439011", "/character-sheet/:id"],
    ["/campaign/abc/refuges", "/campaign/:id/refuges"],
    ["/campaign/abc/refuge/ref-1", "/campaign/:id/refuge/:refugeId"],
    ["/campanha/abc/vtt", "/campanha/:id/vtt"],
  ])("normaliza %s como %s", (pathname, expected) => {
    expect(getPerformanceRoute(pathname)).toBe(expected);
  });
});

