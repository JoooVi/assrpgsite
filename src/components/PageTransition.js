import { motion } from 'framer-motion';


const animationVariants = {
  initial: {
    opacity: 0,
    y: 20, // Começa 20px para baixo
  },
  animate: {
    opacity: 1,
    y: 0, // Move para a posição original
  },
  exit: {
    opacity: 0,
    y: -20, // Sai 20px para cima
  },
};

const PageTransition = ({ children }) => {
  return (
    <motion.div
      variants={animationVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.5, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;