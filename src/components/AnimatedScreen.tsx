import { motion } from "motion/react";
import { ReactNode } from "react";

export function AnimatedScreen({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="flex-1 px-4 py-8 md:px-8 pb-24 md:pb-8"
    >
      {children}
    </motion.div>
  );
}
