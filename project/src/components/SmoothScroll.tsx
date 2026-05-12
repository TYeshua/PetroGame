import React, { useEffect, useRef } from 'react';
import { ReactLenis } from 'lenis/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

// Registrando os plugins do GSAP globalmente para toda a aplicação
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

interface SmoothScrollProps {
  children: React.ReactNode;
}

export function SmoothScroll({ children }: SmoothScrollProps) {
  const lenisRef = useRef<any>(null);

  useEffect(() => {
    // Sincronizando perfeitamente o GSAP ScrollTrigger com o Lenis
    function update(time: number) {
      lenisRef.current?.lenis?.raf(time * 1000);
    }

    gsap.ticker.add(update);
    
    // Desabilitando lag smoothing do GSAP para evitar conflitos de pulo na animação de scroll
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(update);
    };
  }, []);

  return (
    <ReactLenis 
      root 
      ref={lenisRef} 
      autoRaf={false} 
      options={{ 
        lerp: 0.1, 
        duration: 1.2, 
        smoothWheel: true 
      }}
    >
      {children}
    </ReactLenis>
  );
}
