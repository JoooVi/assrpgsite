import { FaBookOpen, FaHome, FaMap, FaUsers } from "react-icons/fa";

export const primaryNavigation = [
  {
    id: "home",
    label: "Início",
    to: "/",
    icon: FaHome,
    public: true,
    hideWhenAuthenticated: true,
    exact: true,
  },
  {
    id: "characters",
    label: "Personagens",
    to: "/characters",
    icon: FaUsers,
    protected: true,
    activePrefixes: ["/characters", "/character-sheet/", "/character-portrait/", "/create"],
  },
  {
    id: "campaigns",
    label: "Campanhas",
    to: "/campaigns",
    icon: FaMap,
    protected: true,
    badge: "Beta",
    activePrefixes: ["/campaigns", "/create-campaign", "/campaign-lobby/", "/campaign/", "/campanha/"],
  },
  {
    id: "homebrews",
    label: "Homebrews",
    to: "/homebrews",
    icon: FaBookOpen,
    protected: true,
    activePrefixes: ["/homebrews", "/shared/"],
  },
];

export const getPrimaryNavigation = (isAuthenticated) => (
  primaryNavigation.filter((item) => (
    (!item.protected || isAuthenticated)
    && (!item.hideWhenAuthenticated || !isAuthenticated)
  ))
);

export const isNavigationItemActive = (item, pathname) => {
  if (item.exact) return pathname === item.to;
  return (item.activePrefixes || [item.to]).some((prefix) => pathname.startsWith(prefix));
};
