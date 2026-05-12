import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GridScan } from './GridScan';
import GlitchText from './GlitchText';
import { GiOilDrum } from "react-icons/gi";

const words = ["Preparado?", "SPE UFPA Apresenta", "PetroGame", "A Convergência"];

export function HeroSection() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % words.length);
    }, 3500); // Change word every 3.5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative h-screen w-full overflow-hidden bg-[#111113] text-[#EDEDED] font-sans">
      
      {/* CAMADA 1: O FUNDO 3D (GridScan) */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-100">
        <GridScan
          sensitivity={0}
          lineThickness={1.5}
          linesColor="#27272A"
          gridScale={0.15}
          scanColor="#ef4444"
          scanOpacity={0.7}
          enablePost
          bloomIntensity={1.2}
          chromaticAberration={0.002}
          noiseIntensity={0.02}
          scanDuration={2.5}
          scanDelay={0.5}
          className="w-full h-full"
        />
      </div>

      {/* AuthKit-like Subtle Radial Spotlight Overlay */}
      <div className="absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_#111113_100%)] pointer-events-none opacity-80" />
      <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_50%_0%,_rgba(239,68,68,0.05)_0%,_transparent_50%)] pointer-events-none" />

      {/* Navigation Header */}
      <nav className="absolute top-0 left-0 right-0 z-50 flex items-center justify-center px-8 py-6 pointer-events-none">
        <div className="pointer-events-auto transition-transform hover:scale-105 duration-500">
          <img 
            src="/petrologo.PNG" 
            alt="PetroGame" 
            className="h-24 w-auto object-contain -mt-4 opacity-90 drop-shadow-[0_0_15px_rgba(239,68,68,0.2)]" 
          />
        </div>
      </nav>

      {/* CAMADA 2: CONTEÚDO CENTRAL */}
      <div className="relative z-50 flex h-full flex-col items-center justify-center pointer-events-none px-4">
        
        {/* Bloco do GlitchText com Animação de Entrada e Tamanho Ajustado */}
        <motion.div
          className="relative z-[100] flex flex-col items-center text-center pointer-events-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentWordIndex}
              initial={{ opacity: 0, filter: 'blur(10px)', scale: 0.95 }}
              animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
              exit={{ opacity: 0, filter: 'blur(10px)', scale: 1.05 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <GlitchText
                speed={0.8}
                enableShadows={true}
                enableOnHover={true}
                className={`font-bold tracking-tight text-5xl md:text-7xl lg:text-8xl xl:text-9xl leading-none ${
                  words[currentWordIndex] === "PetroGame" 
                  ? "text-red-600 drop-shadow-[0_0_40px_rgba(239,68,68,0.3)] uppercase font-black" 
                  : "text-white"
                }`}
              >
                {words[currentWordIndex]}
              </GlitchText>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center z-[100] pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
      >
        <motion.div
          className="relative h-12 w-12 flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <GiOilDrum className="w-full h-full text-zinc-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.2)]" />
        </motion.div>
      </motion.div>
    </section>
  );
}