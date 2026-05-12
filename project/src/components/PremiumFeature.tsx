import React, { useRef, Suspense, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Zap, Cpu, Flame, Target } from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Environment, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

gsap.registerPlugin(ScrollTrigger);

const TrophyModel = () => {
  const { scene } = useGLTF('./trofeunome1.glb');
  const trophyRef = useRef<THREE.Group>(null);
  
  useFrame((state, delta) => {
    if (trophyRef.current) {
      trophyRef.current.rotation.y += delta * 1.0; // Gira apenas no eixo Y
    }
  });

  return (
    <group ref={trophyRef} position={[0, 0.1, 0]}>
      <primitive 
        object={scene} 
        scale={2.5}
      />
    </group>
  );
};

useGLTF.preload('./trofeunome1.glb');

// --- COMPONENTES AUXILIARES ---
const SpotLightCard = ({ children, className = "" }: any) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={`relative overflow-hidden bg-[#1A1A1D] border border-white/10 rounded-[24px] shadow-xl shadow-black/50 backdrop-blur-md ${className}`}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(239, 68, 68, 0.1), transparent 40%)`,
        }}
      />
      {children}
    </div>
  );
};

export const PremiumFeature: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Fade up animations for texts and cards
    const fadeElements = gsap.utils.toArray('.fade-up-feature');
    fadeElements.forEach((el: any) => {
      gsap.fromTo(el, 
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
          }
        }
      );
    });

    // 3D Visualizer entrance
    gsap.from(rightRef.current, {
      scale: 0.9,
      opacity: 0,
      duration: 1.5,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 70%',
      }
    });

  }, { scope: containerRef });

  return (
    <section 
      id="premium-feature"
      ref={containerRef} 
      className="relative min-h-[90vh] flex items-center justify-center bg-[#111113] py-32 overflow-hidden border-t border-white/[0.04]"
    >
      {/* Background Subtle Spotlight */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(239,68,68,0.05),_transparent_70%)] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10 max-w-[1200px]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Left Column - Information Hierarchy */}
          <div className="lg:col-span-7 space-y-10">
            {/* Header Section */}
            <div className="space-y-4 fade-up-feature">
              <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white leading-tight">
                Sobre o <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-800">PetroGame</span>
              </h2>
              <p className="text-[#D4D4D8] text-lg md:text-xl max-w-xl leading-relaxed tracking-[-0.01em]">
                A indústria de energia e o universo dos games se fundem. O PetroGame não é apenas um congresso — é uma explosão de ideias que redefine o futuro em um único palco.
              </p>
            </div>

            {/* Mission Card (Large) */}
            <SpotLightCard className="p-8 fade-up-feature group transition-all duration-500 ease-out hover:-translate-y-1 hover:border-red-500/30">
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center relative z-10">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-b from-[#27272A] to-[#18181B] border border-white/5 text-zinc-300 shadow-inner group-hover:text-red-400 group-hover:border-red-500/30 transition-colors">
                  <Target className="h-7 w-7" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold tracking-tight text-white">Nossa Missão</h3>
                  <p className="text-[#D4D4D8] text-sm leading-relaxed">
                    Desenvolver e aplicar metodologias inovadoras que integrem tecnologia avançada, inteligência de dados e experiências imersivas para otimizar o aprendizado e a produção no setor energético.
                  </p>
                </div>
              </div>
            </SpotLightCard>

            {/* Features Grid (Small Cards) - Horizontal Scroll Snap on Mobile */}
            <div className="flex sm:grid sm:grid-cols-3 gap-4 overflow-x-auto snap-x snap-mandatory pb-4 sm:pb-0 sm:overflow-visible hide-scrollbar -mx-6 px-6 sm:mx-0 sm:px-0">
              {[
                { icon: Zap, title: 'Energia', desc: 'Exploração contínua.' },
                { icon: Cpu, title: 'Tech', desc: 'Sistemas imersivos.' },
                { icon: Flame, title: 'Eventos', desc: 'Networking global.' }
              ].map((item, idx) => (
                <SpotLightCard key={idx} className="snap-center w-[85vw] sm:w-auto shrink-0 p-6 fade-up-feature flex flex-col gap-4 group transition-all duration-500 sm:hover:-translate-y-1">
                  <div className="text-zinc-400 group-hover:text-red-400 transition-colors relative z-10">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <div className="space-y-1 relative z-10">
                    <h4 className="text-base font-semibold tracking-tight text-white">{item.title}</h4>
                    <p className="text-sm text-[#D4D4D8] leading-snug">{item.desc}</p>
                  </div>
                </SpotLightCard>
              ))}
            </div>
          </div>

          {/* Right Column - 3D Visualizer */}
          <div ref={rightRef} className="lg:col-span-5 flex flex-col items-center justify-center relative">
            
            {/* Outer Glow for the 3D Element */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] bg-red-600/30 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse" />

            {/* AuthKit-like Sleek 3D Container */}
            <div className="relative w-full aspect-square max-w-[450px] bg-[#1A1A1D] border border-white/10 rounded-full shadow-[0_0_100px_-10px_rgba(239,68,68,0.5)] overflow-hidden">
              
              {/* Inner Glowing Spotlight behind the 3D object */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(239,68,68,0.25)_0%,_transparent_70%)] pointer-events-none" />
              
              {/* Subtle inner gradient ring */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent rounded-full pointer-events-none" />
              
              {/* 3D Canvas */}
              <div className="w-full h-full cursor-grab active:cursor-grabbing relative z-10">
                <Canvas camera={{ position: [0, 0, 5], fov: 40 }}>
                  <ambientLight intensity={0.5} />
                  {/* Clean studio lighting for premium look */}
                  <spotLight position={[0, 10, 5]} angle={0.4} penumbra={1} intensity={2} color="#ffffff" />
                  <spotLight position={[5, -5, 5]} angle={0.5} penumbra={1} intensity={1} color="#ff3333" />
                  <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ffffff" />
                  <Environment preset="studio" />
                  
                  <Suspense fallback={null}>
                    <TrophyModel />
                  </Suspense>

                  <OrbitControls 
                    enableZoom={false} 
                    enablePan={false}
                    autoRotate={true}
                    autoRotateSpeed={0.5}
                  />
                </Canvas>
              </div>
            </div>

            {/* Attribution Text */}
            <p className="mt-6 text-zinc-500 text-[10px] tracking-[0.2em] uppercase font-medium opacity-50">
              By S. Portela
            </p>

          </div>

        </div>
      </div>
    </section>
  );
};