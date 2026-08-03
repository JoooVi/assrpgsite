const DYNAMIC_ROUTES = [
  [/^\/reset-password\/[^/]+$/, "/reset-password/:token"],
  [/^\/shared\/[^/]+$/, "/shared/:id"],
  [/^\/character-portrait\/[^/]+$/, "/character-portrait/:id"],
  [/^\/character-sheet\/[^/]+$/, "/character-sheet/:id"],
  [/^\/campaign-lobby\/[^/]+$/, "/campaign-lobby/:id"],
  [/^\/campaign-sheet\/[^/]+$/, "/campaign-sheet/:id"],
  [/^\/campaign\/[^/]+\/refuges$/, "/campaign/:id/refuges"],
  [/^\/campaign\/[^/]+\/refuge\/[^/]+$/, "/campaign/:id/refuge/:refugeId"],
  [/^\/campaign\/[^/]+\/refuge$/, "/campaign/:id/refuge"],
  [/^\/campanha\/[^/]+\/vtt$/, "/campanha/:id/vtt"],
];

export const getPerformanceRoute = (pathname = "/") => {
  const normalizedPath = pathname !== "/" ? pathname.replace(/\/+$/, "") : "/";
  const match = DYNAMIC_ROUTES.find(([pattern]) => pattern.test(normalizedPath));

  return match?.[1] || normalizedPath;
};

