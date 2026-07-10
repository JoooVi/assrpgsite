import { motion, useReducedMotion } from "framer-motion";

const animationVariants = {
  initial: {
    opacity: 0,
    filter: "blur(8px)",
  },
  animate: {
    opacity: 1,
    filter: "blur(0px)",
  },
  exit: {
    opacity: 0,
    filter: "blur(8px)",
  },
};

const transitionShellStyle = {
  width: "100%",
  maxWidth: "100%",
  overflowX: "hidden",
  overflow: "clip",
  contain: "paint",
};

const PageTransition = ({ children }) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div style={transitionShellStyle}>{children}</div>;
  }

  return (
    <motion.div
      variants={animationVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
      style={transitionShellStyle}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
