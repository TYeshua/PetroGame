import React, { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Users, Calendar, Clock, Mic, Cpu, X, Zap, Crown, Globe, Check, ArrowRight, ChevronRight, ChevronLeft, ChevronDown, Linkedin, Shield, AlertTriangle, Timer, Smartphone, UserCheck, HelpCircle, Wrench, Ban, FileText, Award, Scale } from 'lucide-react';
import { SiCoinmarketcap } from "react-icons/si";
import { FaCode, FaComment } from "react-icons/fa";
import { FaMoneyBillAlt } from "react-icons/fa";
import { FaPaste } from "react-icons/fa";
import CheckoutPix from './CheckoutPix'; 
import OrbitImages from './OrbitImages';
import PixelTransition from './PixelTransition';
import { motion, AnimatePresence } from 'framer-motion';

gsap.registerPlugin(ScrollTrigger);

// --- DADOS ---
const speakers = [
  { name: 'Shelda Corrêa', title: 'Presidente', icon: Users, image: '/team/shelda.jpeg', linkedin: 'https://www.linkedin.com/in/shelda-corr%C3%AAa-988a10159/' },
  { name: 'Davi Maia', title: 'Vice-presidente', icon: Users, image: '/team/davi.jpeg', linkedin: 'https://www.linkedin.com/in/davi-maia-557a7634b?utm_source=share_via&utm_content=profile&utm_medium=member_android#' },
  { name: 'Evelyn Campelo', title: 'Conselheira', icon: Users, image: '/team/Eveli.jpg', linkedin: 'https://www.linkedin.com/in/evelyncampelo?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app' },
  { name: 'Thiago Yeshua', title: 'Diretor de Tecnologia - Webmaster', icon: FaCode, image: '/team/yeshuanovo.jpeg', linkedin: 'www.linkedin.com/in/thiagoyeshua' },
  { name: 'Ana Brito', title: 'Diretora de Marketing', icon: SiCoinmarketcap, image: '/team/ana2.DNG', linkedin: 'https://www.linkedin.com/in/ana-clara-nascimento-7a4034255?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app' },
  { name: 'Gabriel Braga', title: 'Diretor de Comunicação e Eventos', icon: FaComment, image: '/team/braga.jpeg', linkedin: 'https://www.linkedin.com/in/gabriel-braga-975990235' },
  { name: 'Ana Anjo', title: 'Tesoureira', icon: FaMoneyBillAlt, image: '/team/anaanjo.jpeg', linkedin: 'https://www.linkedin.com/in/ana-clara-anjo-b59738256' },
  { name: 'Andressa Menezes', title: 'Secretária', icon: FaPaste, image: '/team/andressa.jpeg', linkedin: 'https://www.linkedin.com/in/andressa-menezes-a1b358303?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app'},
];

const schedule = [
  { date: '15 JUN', dayName: 'DIA 1', sessions: [{ time: '09:00', title: 'Opening Keynote', speaker: 'Dr. Helena Santos', type: 'keynote', description: 'Visão abrangente sobre as tecnologias.' }, { time: '14:00', title: 'Workshop: Unity', speaker: 'Carlos Mendes', type: 'workshop', description: 'Aprenda a criar gêmeos digitais.' }] },
  { date: '16 JUN', dayName: 'DIA 2', sessions: [{ time: '09:00', title: 'AI na Indústria', speaker: 'Marcus Tech', type: 'keynote', description: 'Otimizando redes de distribuição.' }, { time: '11:00', title: 'Metaverso', speaker: 'Pedro Silva', type: 'panel', description: 'Ambientes virtuais.' }] }
];

const temasAreas = [
  {
    title: 'História do Petróleo',
    time: 'Área 1',
    type: 'history',
    description: 'O conteúdo de estudo será disponibilizado gradualmente ao longo do período de preparação para a competição, incluindo resumos de livros, artigos científicos e materiais visuais/educativos, elaborados ou selecionados pela comissão organizadora, com o objetivo de auxiliar os participantes na revisão e consolidação dos principais conceitos relacionados aos temas propostos.'
  },
  {
    title: 'Geociências',
    time: 'Área 2',
    type: 'geo',
    description: 'O conteúdo de estudo será disponibilizado gradualmente ao longo do período de preparação para a competição, incluindo resumos de livros, artigos científicos e materiais visuais/educativos, elaborados ou selecionados pela comissão organizadora, com o objetivo de auxiliar os participantes na revisão e consolidação dos principais conceitos relacionados aos temas propostos.'
  },
  {
    title: 'Perfuração, Produção e Reservatórios',
    time: 'Área 3',
    type: 'engineering',
    description: 'O conteúdo de estudo será disponibilizado gradualmente ao longo do período de preparação para a competição, incluindo resumos de livros, artigos científicos e materiais visuais/educativos, elaborados ou selecionados pela comissão organizadora, com o objetivo de auxiliar os participantes na revisão e consolidação dos principais conceitos relacionados aos temas propostos.'
  }
];

const companies = ['PETROBRAS', 'SHELL', 'EPIC GAMES', 'UNITY', 'VALE', 'EQUINOR', 'UNREAL ENGINE'];

interface TierType {
  name: string;
  price: string;
  priceInCents: number;
  description: string;
  icon: any;
  features: string[];
  highlighted?: boolean;
}

const tiers: TierType[] = [
  { 
    name: 'INDIVIDUAL', 
    price: 'R$ 8,00', 
    priceInCents: 800, 
    description: 'Acesso único para competidor', 
    icon: Users, 
    features: ['Acesso total ao evento', 'Participação individual', 'Certificado de participação'] 
  },
  { 
    name: 'EQUIPE', 
    price: 'R$ 60,00', 
    priceInCents: 6000, 
    description: 'Inscrição completa para o time', 
    highlighted: true, 
    icon: Crown, 
    features: ['Participação no PetroGame', 'Vaga garantida para a equipe', 'Certificados individuais'] 
  },
];

const getIcon = (type: string) => {
  const sizeClass = "w-[40%] h-[40%] pointer-events-none";
  switch (type) {
    case 'history': return <Clock className={sizeClass} />;
    case 'geo': return <Globe className={sizeClass} />;
    case 'engineering': return <Zap className={sizeClass} />;
    case 'keynote': return <Mic className={sizeClass} />;
    case 'panel': return <Users className={sizeClass} />;
    case 'workshop': return <Cpu className={sizeClass} />;
    default: return <Zap className={sizeClass} />;
  }
};

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

// --- CAROUSEL DE LÍDERES COM PIXEL TRANSITION ---
interface SpeakerType {
  name: string;
  title: string;
  icon: any;
  image: string;
  linkedin: string;
}

const PowerPlayersCarousel: React.FC<{ speakers: SpeakerType[] }> = ({ speakers }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  const itemsPerPage = 2;
  const totalPages = Math.ceil(speakers.length / itemsPerPage);

  const goToPage = (page: number) => {
    if (isAnimating) return;
    setIsAnimating(true);

    const direction = page > currentPage ? 1 : -1;
    const container = carouselRef.current;
    if (!container) return;

    const cards = container.querySelectorAll('.pixel-card-wrapper');
    
    // Animate out
    gsap.to(cards, {
      opacity: 0,
      y: direction * 30,
      duration: 0.3,
      stagger: 0.05,
      ease: 'power2.in',
      onComplete: () => {
        setCurrentPage(page);
        // Reset position for animate in
        requestAnimationFrame(() => {
          const newCards = container.querySelectorAll('.pixel-card-wrapper');
          gsap.fromTo(newCards, 
            { opacity: 0, y: -direction * 30 },
            { 
              opacity: 1, 
              y: 0, 
              duration: 0.5, 
              stagger: 0.1, 
              ease: 'power3.out',
              onComplete: () => setIsAnimating(false)
            }
          );
        });
      }
    });
  };

  const nextPage = () => {
    const next = (currentPage + 1) % totalPages;
    goToPage(next);
  };

  const prevPage = () => {
    const prev = (currentPage - 1 + totalPages) % totalPages;
    goToPage(prev);
  };

  // Auto-play
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isAnimating) {
        const next = (currentPage + 1) % totalPages;
        goToPage(next);
      }
    }, 6000);
    return () => clearInterval(interval);
  }, [currentPage, isAnimating, totalPages]);

  const currentSpeakers = speakers.slice(
    currentPage * itemsPerPage,
    currentPage * itemsPerPage + itemsPerPage
  );

  return (
    <div className="fade-up-element relative">
      {/* Navigation arrows */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <button
          onClick={prevPage}
          className="group w-12 h-12 rounded-full border border-white/10 bg-white/[0.03] flex items-center justify-center hover:bg-white/[0.08] hover:border-red-500/30 transition-all duration-300"
          aria-label="Anterior"
        >
          <ChevronLeft className="w-5 h-5 text-zinc-400 group-hover:text-red-400 transition-colors" />
        </button>
        
        <div className="flex items-center gap-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => goToPage(i)}
              className={`h-2 rounded-full transition-all duration-500 ${
                i === currentPage 
                  ? 'w-8 bg-red-500' 
                  : 'w-2 bg-white/20 hover:bg-white/40'
              }`}
              aria-label={`Página ${i + 1}`}
            />
          ))}
        </div>

        <button
          onClick={nextPage}
          className="group w-12 h-12 rounded-full border border-white/10 bg-white/[0.03] flex items-center justify-center hover:bg-white/[0.08] hover:border-red-500/30 transition-all duration-300"
          aria-label="Próximo"
        >
          <ChevronRight className="w-5 h-5 text-zinc-400 group-hover:text-red-400 transition-colors" />
        </button>
      </div>

      {/* Carousel Grid */}
      <div ref={carouselRef} className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-[900px] mx-auto">
        {currentSpeakers.map((s, i) => (
          <div key={`${currentPage}-${i}`} className="pixel-card-wrapper">
            <SpotLightCard className="overflow-hidden rounded-[24px] transition-all duration-500 hover:-translate-y-1">
              <PixelTransition
                firstContent={
                  <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                    <img
                      src={s.image}
                      alt={s.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                    {/* Name overlay at the bottom */}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        padding: '2rem 1.5rem 1.5rem',
                        background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)',
                      }}
                    >
                      <p style={{
                        fontWeight: 700,
                        fontSize: '1.5rem',
                        color: '#ffffff',
                        letterSpacing: '-0.02em',
                        lineHeight: 1.2,
                        textShadow: '0 2px 8px rgba(0,0,0,0.5)',
                      }}>
                        {s.name}
                      </p>
                    </div>
                  </div>
                }
                secondContent={
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '1rem',
                      background: 'linear-gradient(135deg, #1A1A1D 0%, #111113 50%, #1A1A1D 100%)',
                      padding: '2rem',
                      textAlign: 'center',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Glow effect */}
                    <div style={{
                      position: 'absolute',
                      top: '-50%',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '200px',
                      height: '200px',
                      background: 'radial-gradient(circle, rgba(239,68,68,0.15) 0%, transparent 70%)',
                      pointerEvents: 'none',
                    }} />

                    {/* Icon */}
                    <div style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '16px',
                      background: 'linear-gradient(180deg, #27272A 0%, #18181B 100%)',
                      border: '1px solid rgba(239,68,68,0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '0.25rem',
                      boxShadow: '0 0 30px rgba(239,68,68,0.15)',
                    }}>
                      <s.icon style={{ width: '24px', height: '24px', color: '#f87171' }} />
                    </div>

                    {/* Name */}
                    <p style={{
                      fontWeight: 800,
                      fontSize: '1.75rem',
                      color: '#ffffff',
                      letterSpacing: '-0.03em',
                      lineHeight: 1.2,
                    }}>
                      {s.name}
                    </p>

                    {/* Title */}
                    <p style={{
                      fontWeight: 500,
                      fontSize: '1rem',
                      color: '#a1a1aa',
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                    }}>
                      {s.title}
                    </p>

                    {/* LinkedIn Button */}
                    <a
                      href={s.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        marginTop: '0.75rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '12px',
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#ffffff',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        textDecoration: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        pointerEvents: 'auto',
                        position: 'relative',
                        zIndex: 10,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(59,130,246,0.15)';
                        e.currentTarget.style.borderColor = 'rgba(59,130,246,0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                      }}
                    >
                      <Linkedin style={{ width: '16px', height: '16px', color: '#60a5fa' }} />
                      LinkedIn
                    </a>
                  </div>
                }
                gridSize={8}
                pixelColor="#ef4444"
                once={false}
                animationStepDuration={0.4}
                aspectRatio="120%"
                style={{
                  borderRadius: '24px',
                  border: 'none',
                }}
              />
            </SpotLightCard>
          </div>
        ))}
      </div>

      {/* Page counter */}
      <div className="text-center mt-8">
        <span className="text-sm text-zinc-500 font-medium tracking-wider">
          {String(currentPage + 1).padStart(2, '0')} / {String(totalPages).padStart(2, '0')}
        </span>
      </div>
    </div>
  );
};

export const HorizontalScrollGallery: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  
  const [selectedSessionInfo, setSelectedSessionInfo] = useState<any>(null);
  const [selectedTier, setSelectedTier] = useState<TierType | null>(null);
  const [isRulesExpanded, setIsRulesExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useGSAP(() => {
    // Fade in text elements like AuthKit
    const fadeElements = gsap.utils.toArray('.fade-up-element');
    fadeElements.forEach((el: any) => {
      gsap.fromTo(el, 
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 90%",
          }
        }
      );
    });

    if (marqueeRef.current) {
      gsap.to(marqueeRef.current, {
        xPercent: -50,
        repeat: -1,
        duration: 30,
        ease: "linear"
      });
    }
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="w-full bg-[#111113] text-[#EDEDED] font-sans selection:bg-red-500/30">
      

      {/* 3. POWER PLAYERS (PixelTransition Carousel) */}
      <section className="py-32 px-6 max-w-[1200px] mx-auto relative">
        <div className="text-center mb-16 fade-up-element">
          <h3 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Líderes da Operação</h3>
          <p className="text-[#D4D4D8] text-lg">Mentes brilhantes por trás da convergência.</p>
        </div>

        <PowerPlayersCarousel speakers={speakers} />
      </section>

      {/* 4. TEMAS DOS JOGOS (Clean Orbit Wrapper) */}
      <section className="py-32 px-6 relative border-t border-white/[0.04] bg-[#111113] overflow-hidden">
        {/* Very subtle background glow for orbit */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(239,68,68,0.03)_0%,_transparent_50%)] pointer-events-none" />
        
        <div className="max-w-[1200px] mx-auto relative z-10 flex flex-col items-center">
          <div className="text-center mb-16 fade-up-element">
            <h3 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Mapeamento de Áreas</h3>
            <p className="text-[#D4D4D8] text-lg max-w-2xl mx-auto">Navegue pelas esferas de conhecimento. Clique em qualquer núcleo para extrair dados da sessão.</p>
          </div>

          <div className="relative h-[400px] md:h-[600px] w-full flex items-center justify-center fade-up-element">
            <OrbitImages
              items={temasAreas.map((theme, index) => (
                <motion.button
                  key={index}
                  onClick={() => setSelectedSessionInfo(theme)}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.85, rotate: -5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  className="group relative w-full h-full cursor-pointer outline-none"
                >
                  <div className="relative w-full h-full bg-[#1A1A1D] border-2 border-red-500/80 rounded-full shadow-[0_0_30px_rgba(239,68,68,0.5)] flex items-center justify-center overflow-hidden transition-all duration-300 ease-out group-hover:bg-red-500/40 group-hover:border-red-400 group-hover:shadow-[0_0_80px_rgba(239,68,68,1)]">
                    <div className="absolute top-0 left-1 w-3/4 h-1/2 bg-gradient-to-b from-white/[0.2] to-transparent rounded-full blur-[1px] group-hover:from-white/[0.4] transition-colors duration-300" />
                    <div className="text-red-400 group-hover:text-white transition-all duration-300 relative z-10 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)] group-hover:drop-shadow-[0_0_20px_rgba(255,255,255,0.8)] flex items-center justify-center w-full h-full">
                      {getIcon(theme.type)}
                    </div>
                  </div>
                </motion.button>
              ))}
              shape="ellipse"
              radiusX={isMobile ? 480 : 400}
              radiusY={isMobile ? 480 : 140}
              duration={isMobile ? 40 : 60}
              itemSize={isMobile ? 220 : 64}
              showPath={true}
              pathColor="rgba(239, 68, 68, 0.4)"
              pathWidth={isMobile ? 4 : 2}
              responsive={true}
              centerContent={
                <div className="flex flex-col items-center">
                   <div className="w-14 h-14 md:w-24 md:h-24 bg-gradient-to-b from-[#27272A] to-[#18181B] border-2 border-red-500/50 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(239,68,68,0.6)] transition-all duration-300">
                      <Globe className="w-6 h-6 md:w-10 md:h-10 text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]" />
                   </div>
                </div>
              }
            />
          </div>

          {/* --- REGRAS & PONTUAÇÃO CARDS --- */}
          <div className="mt-24 w-full">
            <div className="text-center mb-10 fade-up-element">
              <h3 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">Regulamento & Pontuação</h3>
              <p className="text-[#A1A1AA] text-base max-w-xl mx-auto mb-8">Conheça as regras, critérios de desempate e normas de conduta do PetroGames.</p>

              {/* Ler Mais Button */}
              <button
                onClick={() => setIsRulesExpanded(!isRulesExpanded)}
                className="cursor-magnetic group inline-flex items-center gap-2.5 px-6 py-3 rounded-full border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.07] hover:border-red-500/30 transition-all duration-300 text-sm font-medium text-zinc-300 hover:text-white backdrop-blur-sm"
              >
                <span>{isRulesExpanded ? 'Recolher' : 'Ler Mais'}</span>
                <ChevronDown 
                  className={`w-4 h-4 text-red-400 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isRulesExpanded ? 'rotate-180' : 'rotate-0'}`}
                />
              </button>
            </div>

            {/* Collapsible Content */}
            <AnimatePresence initial={false}>
              {isRulesExpanded && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className="pt-2">
              {/* Scoring & Tiebreaker */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5 fade-up-element">
                {/* Pontuação */}
                <SpotLightCard className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-b from-[#27272A] to-[#18181B] border border-red-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.15)]">
                      <Award className="w-5 h-5 text-red-400" />
                    </div>
                    <h4 className="font-semibold text-white text-lg">Pontuação</h4>
                  </div>
                  <p className="text-[#A1A1AA] text-sm leading-relaxed">
                    Cada resposta correta vale <span className="text-white font-semibold">10 pontos</span>. Respostas incorretas ou não respondidas não geram pontuação. A classificação é definida pela soma total dos pontos.
                  </p>
                </SpotLightCard>

                {/* Desempate */}
                <SpotLightCard className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-b from-[#27272A] to-[#18181B] border border-red-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.15)]">
                      <Scale className="w-5 h-5 text-red-400" />
                    </div>
                    <h4 className="font-semibold text-white text-lg">Desempate</h4>
                  </div>
                  <ul className="space-y-2 text-[#A1A1AA] text-sm">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                      <span>Maior número de respostas corretas</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                      <span>Rodada extra até que o empate seja desfeito</span>
                    </li>
                  </ul>
                </SpotLightCard>
              </div>

              {/* General Rules Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 fade-up-element">

                {/* Regra 1 - Tempo */}
                <SpotLightCard className="p-5">
                  <div className="flex items-center gap-2.5 mb-3">
                    <Timer className="w-4 h-4 text-red-400" />
                    <h5 className="font-semibold text-white text-sm">Tempo de Resposta</h5>
                  </div>
                  <p className="text-[#A1A1AA] text-xs leading-relaxed">
                    Cada equipe tem até <span className="text-white font-medium">1 minuto</span> para discutir e apresentar a resposta. Sem resposta no prazo = sem pontuação.
                  </p>
                </SpotLightCard>

                {/* Regra 2 - Dispositivos */}
                <SpotLightCard className="p-5">
                  <div className="flex items-center gap-2.5 mb-3">
                    <Smartphone className="w-4 h-4 text-red-400" />
                    <h5 className="font-semibold text-white text-sm">Sem Dispositivos</h5>
                  </div>
                  <p className="text-[#A1A1AA] text-xs leading-relaxed">
                    Proibido o uso de celulares, computadores, smartwatches ou qualquer dispositivo eletrônico durante as rodadas.
                  </p>
                </SpotLightCard>

                {/* Regra 3 - Respostas */}
                <SpotLightCard className="p-5">
                  <div className="flex items-center gap-2.5 mb-3">
                    <FileText className="w-4 h-4 text-red-400" />
                    <h5 className="font-semibold text-white text-sm">Respostas Claras</h5>
                  </div>
                  <p className="text-[#A1A1AA] text-xs leading-relaxed">
                    Respostas devem ser claras e objetivas. Variações de terminologia podem ser aceitas se mantiverem o significado técnico.
                  </p>
                </SpotLightCard>

                {/* Regra 4 - Conduta */}
                <SpotLightCard className="p-5">
                  <div className="flex items-center gap-2.5 mb-3">
                    <Shield className="w-4 h-4 text-red-400" />
                    <h5 className="font-semibold text-white text-sm">Conduta Respeitosa</h5>
                  </div>
                  <p className="text-[#A1A1AA] text-xs leading-relaxed">
                    Os participantes devem manter postura respeitosa e colaborativa com equipes adversárias, comissão e público.
                  </p>
                </SpotLightCard>

                {/* Regra 5 - Pontualidade */}
                <SpotLightCard className="p-5">
                  <div className="flex items-center gap-2.5 mb-3">
                    <Clock className="w-4 h-4 text-red-400" />
                    <h5 className="font-semibold text-white text-sm">Pontualidade</h5>
                  </div>
                  <p className="text-[#A1A1AA] text-xs leading-relaxed">
                    Presença obrigatória <span className="text-white font-medium">15 min antes</span> do início. Atraso de +5 min = W.O. Duas ausências consecutivas = desclassificação.
                  </p>
                </SpotLightCard>

                {/* Regra 6 - Substituição */}
                <SpotLightCard className="p-5">
                  <div className="flex items-center gap-2.5 mb-3">
                    <UserCheck className="w-4 h-4 text-red-400" />
                    <h5 className="font-semibold text-white text-sm">Substituições</h5>
                  </div>
                  <p className="text-[#A1A1AA] text-xs leading-relaxed">
                    A substituição pelo reserva deve ser solicitada antes da rodada. Não é permitida durante rodada em andamento.
                  </p>
                </SpotLightCard>

                {/* Regra 7 - Contestações */}
                <SpotLightCard className="p-5">
                  <div className="flex items-center gap-2.5 mb-3">
                    <HelpCircle className="w-4 h-4 text-red-400" />
                    <h5 className="font-semibold text-white text-sm">Contestações</h5>
                  </div>
                  <p className="text-[#A1A1AA] text-xs leading-relaxed">
                    Questionamentos sobre perguntas ou respostas devem ser apresentados imediatamente após a rodada. Decisão final é da comissão.
                  </p>
                </SpotLightCard>

                {/* Regra 8 - Problemas Técnicos */}
                <SpotLightCard className="p-5">
                  <div className="flex items-center gap-2.5 mb-3">
                    <Wrench className="w-4 h-4 text-red-400" />
                    <h5 className="font-semibold text-white text-sm">Problemas Técnicos</h5>
                  </div>
                  <p className="text-[#A1A1AA] text-xs leading-relaxed">
                    Em caso de falha técnica, a comissão pode interromper e reiniciar a rodada sem prejuízo às equipes.
                  </p>
                </SpotLightCard>

                {/* Regra 9 - Penalizações */}
                <SpotLightCard className="p-5">
                  <div className="flex items-center gap-2.5 mb-3">
                    <Ban className="w-4 h-4 text-red-400" />
                    <h5 className="font-semibold text-white text-sm">Penalizações</h5>
                  </div>
                  <p className="text-[#A1A1AA] text-xs leading-relaxed">
                    Comportamento inadequado, fraude ou descumprimento pode resultar em perda de pontos ou desclassificação.
                  </p>
                </SpotLightCard>

              </div>

              {/* Acceptance note */}
              <div className="mt-8 text-center fade-up-element">
                <p className="text-[#52525B] text-xs max-w-lg mx-auto">
                  A participação no PetroGames implica na aceitação integral deste regulamento. Casos omissos serão decididos pela comissão organizadora.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>

  </div>
</section>

      {/* 5. TIERS (AuthKit Exact Match Pricing) */}
      <section id="tiers-section" className="py-32 px-6 relative flex flex-col items-center justify-center border-t border-white/[0.04] bg-[#111113]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(239,68,68,0.08),_transparent_60%)] pointer-events-none" />
        
        <div className="z-10 text-center mb-16 fade-up-element">
          <h3 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">Acesso ao Evento</h3>
          <p className="text-[#D4D4D8] text-xl">Escolha sua licença operacional.</p>
        </div>
        
        <div className="z-10 flex flex-col lg:flex-row justify-center gap-6 max-w-[1000px] w-full">
          {tiers.map((tier, i) => {
            return (
              <div 
                key={i} 
                className={`fade-up-element flex-1 p-8 rounded-[32px] border transition-all duration-500 flex flex-col relative overflow-hidden bg-[#1A1A1D] shadow-2xl shadow-black/40 backdrop-blur-md
                  ${tier.highlighted 
                    ? 'border-red-500/60 shadow-[0_0_100px_-15px_rgba(239,68,68,0.3)] scale-[1.02]' 
                    : 'border-white/10'}`}
              >
                {tier.highlighted && (
                  <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 blur-[80px] pointer-events-none" />
                )}
                
                <div className="flex-1 relative z-10 flex flex-col">
                  <h4 className="font-semibold text-lg text-white mb-2">{tier.name}</h4>
                  <p className="text-[#D4D4D8] text-sm mb-6">{tier.description}</p>
                  
                  <div className="mb-8 flex items-baseline gap-2">
                    <span className="text-5xl font-bold tracking-tight text-white">
                      {tier.price}
                    </span>
                  </div>
                  
                  <div className="h-px w-full bg-white/[0.06] mb-8" />
                  
                  <ul className="space-y-4 mb-10 flex-1">
                    {tier.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-3 text-sm text-[#D4D4D8] font-medium">
                        <div className="w-5 h-5 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 text-white" /> 
                        </div>
                        {f}
                      </li>
                    ))}
                  </ul>

                  <button 
                    onClick={() => setSelectedTier(tier)}
                    className={`cursor-magnetic w-full py-3.5 rounded-[12px] font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2
                      ${tier.highlighted 
                        ? 'bg-white text-black hover:bg-zinc-200' 
                        : 'bg-white/[0.04] text-white border border-white/[0.08] hover:bg-white/[0.08]'
                    }`}
                  >
                    Prosseguir <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* MODAL SESSÃO (Minimalist) */}
      <AnimatePresence>
      {selectedSessionInfo && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setSelectedSessionInfo(null)} 
          />
          <motion.div 
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 1 }}
            onDragEnd={(e, info) => {
              if (info.offset.y > 100) setSelectedSessionInfo(null);
            }}
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="bg-[#1A1A1D] border-t md:border border-white/[0.08] p-8 rounded-t-[32px] md:rounded-[24px] z-10 max-w-md w-full relative shadow-2xl pb-12 md:pb-8"
          >
            <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-6 md:hidden" />
            <button onClick={() => setSelectedSessionInfo(null)} className="absolute top-6 right-6 text-[#D4D4D8] hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-1.5 rounded-full">
              <X className="w-4 h-4"/>
            </button>
            <div className="flex items-center gap-2 text-zinc-400 text-sm font-medium mb-4">
              <Clock className="w-4 h-4"/> {selectedSessionInfo.time}
            </div>
            <h3 className="text-2xl font-bold tracking-tight mb-2 text-white">{selectedSessionInfo.title}</h3>
            <p className="text-[#D4D4D8] text-sm mb-6 leading-relaxed">{selectedSessionInfo.description}</p>
            {selectedSessionInfo.speaker && (
              <div className="flex items-center gap-4 pt-6 border-t border-white/[0.06]">
                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
                   <Mic className="w-4 h-4 text-zinc-300" />
                </div>
                <div>
                  <p className="text-xs text-[#D4D4D8] font-medium mb-0.5">Speaker</p>
                  <p className="font-semibold text-sm text-white">{selectedSessionInfo.speaker}</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
      </AnimatePresence>

      {/* MODAL DE CHECKOUT PIX (Mantém o componente filho igual, mas wrapper mais elegante) */}
      <AnimatePresence>
      {selectedTier && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setSelectedTier(null)} 
          />
          <motion.div 
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 1 }}
            onDragEnd={(e, info) => {
              if (info.offset.y > 100) setSelectedTier(null);
            }}
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="bg-[#1A1A1D] border-t md:border border-white/[0.08] p-8 rounded-t-[32px] md:rounded-[32px] z-10 max-w-md w-full relative shadow-2xl pb-12 md:pb-8"
          >
            <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-6 md:hidden" />
            <CheckoutPix
              titulo={selectedTier.name}
              valorCentavos={selectedTier.priceInCents}
              valorFormatado={selectedTier.price}
              onClose={() => setSelectedTier(null)}
            />
          </motion.div>
        </div>
      )}
      </AnimatePresence>

    </div>
  );
};