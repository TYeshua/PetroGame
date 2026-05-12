import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface FloatingElementProps {
  children: React.ReactNode;
  parallaxSpeed?: number;   // Quão rápido move com o scroll (pode ser negativo para subir)
  floatDuration?: number;   // Quão rápido ele "respira" flutuando (segundos)
  className?: string;       // Para posicionamento na tela (top, left, etc)
}

export const FloatingElement: React.FC<FloatingElementProps> = ({
  children,
  parallaxSpeed = 50,
  floatDuration = 3,
  className = '',
}) => {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // 1. Efeito Parallax amarrado ao Scroll (Caixa Externa)
    // Opcional: só roda o paralaxe em telas desktop para não poluir o mobile nativo, 
    // mas deixaremos assim como base (matchMedia pode ser adicionado futuramente).
    gsap.to(outerRef.current, {
      yPercent: parallaxSpeed,
      ease: 'none',
      scrollTrigger: {
        trigger: outerRef.current,
        start: 'top bottom', // Começa quando o elemento entra na tela por baixo
        end: 'bottom top',   // Termina quando o elemento sai por cima
        scrub: 1,            // Inércia amanteigada de 1s
      },
    });

    // 2. Efeito de Flutuação Contínua Orgânica (Caixa Interna)
    gsap.to(innerRef.current, {
      y: 20, // Move 20px para cima/baixo
      rotation: 5, // Rotação muito sutil inspirada no natural
      duration: floatDuration,
      repeat: -1, // Infinito
      yoyo: true, // Bumerangue
      ease: 'sine.inOut', // Acelera e desacelera suavemente
    });
  }, { scope: outerRef });

  return (
    // O contêiner externo controla o posicionamento na tela e o Parallax atrelado ao scroll
    <div ref={outerRef} className={`absolute z-0 pointer-events-none will-change-transform ${className}`}>
      {/* O contêiner interno controla a flutuação perpétua */}
      <div ref={innerRef} className="will-change-transform">
        {children}
      </div>
    </div>
  );
};
