import { useEffect, useState } from "react";
import "./PageTransition.css";

let hasRenderedInitialPage = false;

const PageTransition = ({ children }) => {
  const skipInitialAnimation = !hasRenderedInitialPage;
  const [isVisible, setIsVisible] = useState(skipInitialAnimation);
  hasRenderedInitialPage = true;

  useEffect(() => {
    if (skipInitialAnimation) return undefined;
    const frameId = window.requestAnimationFrame(() => setIsVisible(true));
    return () => window.cancelAnimationFrame(frameId);
  }, [skipInitialAnimation]);

  return (
    <div className={`page-transition-shell${isVisible ? " is-visible" : " is-entering"}`}>
      {children}
    </div>
  );
};

export default PageTransition;
