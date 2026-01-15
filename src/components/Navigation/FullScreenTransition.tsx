'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface FullScreenTransitionProps {
  isVisible: boolean;
  onComplete?: () => void;
  color?: string;
}

export default function FullScreenTransition({ 
  isVisible, 
  onComplete, 
  color = 'var(--primary)' 
}: FullScreenTransitionProps) {
  return (
    <AnimatePresence onExitComplete={onComplete}>
      {isVisible && (
        <motion.div
          initial={{ clipPath: 'circle(0% at 50% 50%)' }}
          animate={{ clipPath: 'circle(150% at 50% 50%)' }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          style={{ backgroundColor: color }}
          className="fixed inset-0 z-[100] flex items-center justify-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-white text-4xl font-bold tracking-widest"
          >
            欢迎开启治愈之旅...
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
