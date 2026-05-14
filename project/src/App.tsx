import { HeroSection } from './components/HeroSection';
import { EnergyCascadeBackground } from './components/EnergyCascadeBackground';
import { Footer } from './components/Footer';

import { SmoothScrollProvider } from './components/SmoothScrollProvider';
import { PremiumFeature } from './components/PremiumFeature';
import { EventInfo } from './components/EventInfo';
import { HorizontalScrollGallery } from './components/HorizontalScrollGallery';
import { FloatingElement } from './components/FloatingElement';
import { FloatingNav } from './components/FloatingNav';
import { Droplet, Settings, Flame, Zap, Hexagon } from 'lucide-react';
import { useEffect } from 'react';
import TargetCursor from './components/TargetCursor';

function App() {
  // Wake up backend no carregamento inicial da página
  useEffect(() => {
    const envApiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';
    const API_URL = envApiUrl.endsWith('/') ? envApiUrl.slice(0, -1) : envApiUrl;
    // Faz um fetch silencioso apenas para "acordar" o Render
    fetch(`${API_URL}/`).catch(() => {});
  }, []);

  return (
    <SmoothScrollProvider>
      <main className="relative min-h-screen bg-black text-white hover:cursor-default" style={{ overflow: "hidden" }}>
        <TargetCursor
          spinDuration={2}
          hideDefaultCursor
          parallaxOn
          hoverDuration={0.2}
          targetSelector="button, a, .cursor-target"
        />
        <EnergyCascadeBackground />
        
        {/* Elementos Flutuantes em Paralaxe (Partículas Temáticas) */}
        <FloatingElement parallaxSpeed={-150} floatDuration={4} className="top-[115vh] left-[5vw]">
          <Droplet className="w-48 h-48 text-red-500/20 drop-shadow-[0_0_80px_rgba(239,68,68,0.5)]" strokeWidth={1} />
        </FloatingElement>
        
        <FloatingElement parallaxSpeed={200} floatDuration={6} className="top-[145vh] right-[5vw]">
          <Settings className="w-56 h-56 text-white/10 drop-shadow-[0_0_80px_rgba(255,255,255,0.2)]" strokeWidth={1} />
        </FloatingElement>
        
        <FloatingElement parallaxSpeed={-100} floatDuration={3.5} className="top-[220vh] left-[10vw]">
          <Flame className="w-40 h-40 text-red-500/30 drop-shadow-[0_0_60px_rgba(239,68,68,0.6)]" strokeWidth={1} />
        </FloatingElement>
        
        <FloatingElement parallaxSpeed={160} floatDuration={5} className="top-[280vh] right-[2vw]">
          <Hexagon className="w-64 h-64 text-white/10 drop-shadow-[0_0_80px_rgba(255,255,255,0.2)]" strokeWidth={1} />
        </FloatingElement>

        <FloatingElement parallaxSpeed={-250} floatDuration={4.5} className="top-[350vh] left-[25vw]">
          <Zap className="w-32 h-32 text-red-500/25 drop-shadow-[0_0_50px_rgba(239,68,68,0.5)]" strokeWidth={1} />
        </FloatingElement>

        <div className="relative z-10 w-full overflow-hidden">
          <HeroSection />
          <PremiumFeature />
          <EventInfo />
          <HorizontalScrollGallery />
          <Footer />
        </div>
        <FloatingNav />
      </main>
    </SmoothScrollProvider>
  );
}

export default App;
