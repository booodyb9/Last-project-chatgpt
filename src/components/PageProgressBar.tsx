import { useEffect, useState } from 'react';
import { motion, useScroll, useSpring, AnimatePresence } from 'motion/react';
import { useLocation } from 'react-router-dom';

export default function PageProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const location = useLocation();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    setIsNavigating(true);
    const timeout = setTimeout(() => {
      setIsNavigating(false);
    }, 800); 

    return () => clearTimeout(timeout);
  }, [location.pathname]);

  return (
    <div className="fixed top-0 left-0 right-0 z-[99999] pointer-events-none" dir="ltr">
      {/* Scroll Progress Bar */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0284C7] via-[#38BDF8] to-[#0284C7] origin-left"
        style={{ scaleX }}
      />
      
      {/* Navigation Loading Bar */}
      <AnimatePresence>
        {isNavigating && (
          <motion.div
            className="absolute top-0 left-0 right-0 h-1.5 bg-[#38BDF8] origin-left shadow-[0_0_15px_rgba(56,189,248,0.8)]"
            initial={{ scaleX: 0, opacity: 1 }}
            animate={{ scaleX: 1, opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
            transition={{ duration: 0.8, ease: "circOut" }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
