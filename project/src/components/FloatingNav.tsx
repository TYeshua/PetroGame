import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Target, Info, Crown } from 'lucide-react';

export function FloatingNav() {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { icon: Target, label: "Missão", id: "premium-feature" },
    { icon: Info, label: "Info", id: "event-info" },
    { icon: Crown, label: "Ingressos", id: "tiers-section" },
  ];

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setIsOpen(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] md:hidden">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.2, type: "spring", stiffness: 200, damping: 20 }}
            className="absolute bottom-20 right-0 flex flex-col gap-3"
          >
            {menuItems.map((item, i) => (
              <motion.button
                key={item.label}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => scrollTo(item.id)}
                className="flex items-center justify-end gap-3"
              >
                <span className="text-sm font-medium text-white px-3 py-1.5 bg-[#1A1A1D]/80 backdrop-blur-md rounded-full border border-white/10 shadow-lg whitespace-nowrap">
                  {item.label}
                </span>
                <div className="w-12 h-12 rounded-full bg-[#1A1A1D]/90 backdrop-blur-xl border border-white/10 shadow-lg shadow-black/50 flex items-center justify-center hover:bg-white/10 hover:border-red-500/30 transition-colors">
                  <item.icon className="w-5 h-5 text-red-400" />
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-red-600/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-[0_0_25px_rgba(239,68,68,0.5)] border border-red-500/50 text-white transition-transform hover:scale-105 active:scale-95"
      >
        <motion.div
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </motion.div>
      </button>
    </div>
  );
}
