import { FC } from 'react';

interface GlitchTextProps {
  children: string;
  speed?: number;
  enableShadows?: boolean;
  enableOnHover?: boolean;
  className?: string;
}

const GlitchText: FC<GlitchTextProps> = ({ 
  children, 
  speed = 1, 
  enableShadows = true, 
  // enableOnHover não será usado nesta versão robusta para garantir que fique sempre visível,
  // mas mantemos na interface para não quebrar seu código do HeroSection
  enableOnHover = false, 
  className = '' 
}) => {
  
  const afterDuration = `${speed * 3}s`;
  const beforeDuration = `${speed * 2}s`;
  const afterShadow = enableShadows ? '-3px 0 red' : 'none';
  const beforeShadow = enableShadows ? '3px 0 cyan' : 'none';

  return (
    <div className={`relative inline-block font-black z-50 ${className}`}>
      
      {/* 1. Camada Base (O texto original) */}
      <span className="relative z-10 block">{children}</span>

      {/* 2. Camada Glitch Vermelha */}
      <span
        className="absolute top-0 left-[3px] -z-10 w-full h-full text-white opacity-80"
        style={{
          textShadow: afterShadow,
          animation: `glitch-anim-1 ${afterDuration} infinite linear alternate-reverse`
        }}
        aria-hidden="true"
      >
        {children}
      </span>

      {/* 3. Camada Glitch Ciano */}
      <span
        className="absolute top-0 left-[-3px] -z-10 w-full h-full text-white opacity-80"
        style={{
          textShadow: beforeShadow,
          animation: `glitch-anim-2 ${beforeDuration} infinite linear alternate-reverse`
        }}
        aria-hidden="true"
      >
        {children}
      </span>

      {/* CSS Injetado diretamente */}
      <style>{`
        @keyframes glitch-anim-1 {
          0% { clip-path: inset(20% 0 50% 0); }
          20% { clip-path: inset(30% 0 40% 0); }
          40% { clip-path: inset(25% 0 35% 0); }
          60% { clip-path: inset(15% 0 55% 0); }
          80% { clip-path: inset(10% 0 60% 0); }
          100% { clip-path: inset(30% 0 40% 0); }
        }
        @keyframes glitch-anim-2 {
          0% { clip-path: inset(10% 0 60% 0); }
          20% { clip-path: inset(30% 0 40% 0); }
          40% { clip-path: inset(40% 0 20% 0); }
          60% { clip-path: inset(20% 0 50% 0); }
          80% { clip-path: inset(25% 0 35% 0); }
          100% { clip-path: inset(15% 0 55% 0); }
        }
      `}</style>
    </div>
  );
};

export default GlitchText;