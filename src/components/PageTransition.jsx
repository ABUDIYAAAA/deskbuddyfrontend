import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";

const transition = {
  duration: 0.38,
  ease: [0.4, 0, 0.2, 1],
};

const variants = {
  initial: {
    opacity: 0,
    scale: 0.98,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition,
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    transition,
  },
};

const PageTransition = ({ children }) => {
  const location = useLocation();
  return (
    <motion.div
      key={location.pathname}
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ minHeight: "100vh" }}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition; 