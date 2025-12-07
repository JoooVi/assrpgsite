import { motion } from 'framer-motion';

const animationVariants = {
  initial: {
    opacity: 0,
    scale: 0.98, // Começa levemente menor (fundo)
    filter: 'blur(8px)', // Começa desfocado
  },
  animate: {
    opacity: 1,
    scale: 1, // Tamanho normal
    filter: 'blur(0px)', // Foca a imagem
  },
  exit: {
    opacity: 0,
    scale: 1.02, // Aumenta um pouco ao sair (vem para frente)
    filter: 'blur(8px)',
  },
};

const PageTransition = ({ children }) => {
  return (
    <motion.div
      variants={animationVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      // Usamos 'easeOut' para entrada rápida e saída suave
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      style={{ width: '100%' }} // Garante que não quebre o layout
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;