import React, { useRef, useState } from 'react';
import { Target, MapPin, Calendar, Users, Trophy, UserCheck, AlertCircle, PlayCircle, Info, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

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

export const EventInfo: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const fadeElements = gsap.utils.toArray('.fade-up-info');
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
  }, { scope: containerRef });

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <section id="event-info" ref={containerRef} className="relative py-32 bg-[#111113] border-t border-white/[0.04]">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(239,68,68,0.05),_transparent_60%)] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10 max-w-[1200px]">
        {/* Header */}
        <div className="text-center mb-10 fade-up-info">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6">
            Tudo sobre o <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-800">PetroGames</span>
          </h2>
          <p className="text-[#A1A1AA] text-base max-w-xl mx-auto mb-8">
            Informações detalhadas sobre o evento, formato, inscrições e como se preparar para o desafio.
          </p>

          {/* Ler Mais Button */}
          <button
            onClick={toggleExpand}
            className="group inline-flex items-center gap-2.5 px-6 py-3 rounded-full border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.07] hover:border-red-500/30 transition-all duration-300 text-sm font-medium text-zinc-300 hover:text-white backdrop-blur-sm"
          >
            <span>{isExpanded ? 'Recolher' : 'Ler Mais'}</span>
            <ChevronDown 
              className={`w-4 h-4 text-red-400 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isExpanded ? 'rotate-180' : 'rotate-0'}`}
            />
          </button>
        </div>

        {/* Collapsible Content */}
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div 
              ref={contentRef}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6">
            {/* Objetivo */}
            <SpotLightCard className="p-8 fade-up-info lg:col-span-2 group hover:border-red-500/30 transition-colors">
              <div className="flex flex-col md:flex-row gap-6 relative z-10">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-b from-[#27272A] to-[#18181B] border border-white/5 text-zinc-300 shadow-inner group-hover:text-red-400 group-hover:border-red-500/30 transition-colors">
                  <Target className="h-7 w-7" />
                </div>
                <div className="space-y-4">
                  <h3 className="text-2xl font-semibold text-white">1. Objetivo</h3>
                  <div className="space-y-3 text-[#D4D4D8] leading-relaxed">
                    <p>
                      O objetivo do evento é promover o engajamento dos estudantes de Engenharia e áreas afins com o Capítulo Estudantil SPE-UFPA, reforçando conhecimentos técnicos relacionados à Engenharia de Petróleo. A iniciativa busca estimular o raciocínio rápido e a capacidade de tomada de decisão, além de contribuir para a consolidação desses conhecimentos por meio de uma competição interna estruturada no formato de perguntas e respostas.
                    </p>
                    <p>
                      Do ponto de vista institucional, o evento também tem como finalidade incentivar novas filiações ao Capítulo Estudantil, além de ampliar a divulgação do papel da Society of Petroleum Engineers (SPE) na formação acadêmica e profissional dos estudantes.
                    </p>
                    <p>
                      No que se refere ao desenvolvimento dos participantes, a atividade busca estimular habilidades fundamentais para a formação profissional, como o trabalho em equipe, a comunicação, a tomada de decisão e a gestão do tempo em situações de pressão, competências essenciais no contexto da indústria de petróleo e gás.
                    </p>
                  </div>
                </div>
              </div>
            </SpotLightCard>

            {/* Local e Data */}
            <SpotLightCard className="p-8 fade-up-info group hover:border-red-500/30 transition-colors">
              <div className="flex flex-col gap-6 relative z-10">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-b from-[#27272A] to-[#18181B] border border-white/5 text-zinc-300 shadow-inner group-hover:text-red-400 group-hover:border-red-500/30 transition-colors">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">2. Local e Data</h3>
                  <p className="text-[#D4D4D8] leading-relaxed">
                    O PetroGames Interno SPE-UFPA será realizado no dia <strong>6 de junho</strong>, na <strong>Casa de Cultura</strong>. Neste dia ocorrerão as fases classificatórias e eliminatórias iniciais, compreendendo as rodadas de classificação, as quartas de final, as semifinais e a final, onde as duas equipes finalistas disputarão o título.
                  </p>
                </div>
              </div>
            </SpotLightCard>

            {/* Inscrições */}
            <SpotLightCard className="p-8 fade-up-info group hover:border-red-500/30 transition-colors">
              <div className="flex flex-col gap-6 relative z-10">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-b from-[#27272A] to-[#18181B] border border-white/5 text-zinc-300 shadow-inner group-hover:text-red-400 group-hover:border-red-500/30 transition-colors">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">3. Inscrições</h3>
                  <p className="text-[#D4D4D8] leading-relaxed">
                    Exclusivamente online via formulário. Taxa de <strong>R$ 60,00 por equipe</strong> (quatro participantes). O pagamento no ato da inscrição é obrigatório. As inscrições estarão abertas até o dia <strong>31 de maio</strong>.
                  </p>
                </div>
              </div>
            </SpotLightCard>

            {/* Participantes */}
            <SpotLightCard className="p-8 fade-up-info group hover:border-red-500/30 transition-colors">
              <div className="flex flex-col gap-6 relative z-10">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-b from-[#27272A] to-[#18181B] border border-white/5 text-zinc-300 shadow-inner group-hover:text-red-400 group-hover:border-red-500/30 transition-colors">
                  <UserCheck className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">4. Participantes</h3>
                  <p className="text-[#D4D4D8] leading-relaxed">
                    Estudantes da <strong>UFPA</strong> com ID de membro ativo na <strong>SPE</strong>. Aberto para cursos como Geologia, Geofísica e demais Engenharias.
                  </p>
                </div>
              </div>
            </SpotLightCard>

            {/* Equipes */}
            <SpotLightCard className="p-8 fade-up-info group hover:border-red-500/30 transition-colors">
              <div className="flex flex-col gap-6 relative z-10">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-b from-[#27272A] to-[#18181B] border border-white/5 text-zinc-300 shadow-inner group-hover:text-red-400 group-hover:border-red-500/30 transition-colors">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">5. Equipes</h3>
                  <p className="text-[#D4D4D8] leading-relaxed">
                    Compostas por <strong>4 integrantes</strong> de diferentes semestres/cursos. Obrigatório ter composição mista e indicar um <strong>capitão</strong>. Não são permitidas alterações após a inscrição.
                  </p>
                </div>
              </div>
            </SpotLightCard>

            {/* Formato */}
            <SpotLightCard className="p-8 fade-up-info lg:col-span-2 group hover:border-red-500/30 transition-colors">
              <div className="flex flex-col md:flex-row gap-6 relative z-10">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-b from-[#27272A] to-[#18181B] border border-white/5 text-zinc-300 shadow-inner group-hover:text-red-400 group-hover:border-red-500/30 transition-colors">
                  <Trophy className="h-7 w-7" />
                </div>
                <div className="space-y-4 w-full">
                  <h3 className="text-2xl font-semibold text-white">6. Formato do Torneio</h3>
                  <div className="space-y-4 text-[#D4D4D8] leading-relaxed">
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                      <h4 className="font-semibold text-white mb-2 flex items-center gap-2"><PlayCircle className="w-5 h-5 text-red-500" /> Fase Classificatória</h4>
                      <p>Rodadas de perguntas e respostas com pontuação acumulativa. Por exemplo, de 10 equipes, as 6 melhores avançam no ranking e 4 são eliminadas.</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                      <h4 className="font-semibold text-white mb-2 flex items-center gap-2"><Trophy className="w-5 h-5 text-red-500" /> Fase Eliminatória</h4>
                      <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Quartas de final:</strong> 3º vs 6º e 4º vs 5º lugar.</li>
                        <li><strong>Semifinais:</strong> 1º e 2º lugares (que avançam direto) enfrentam os vencedores das quartas.</li>
                        <li><strong>Final:</strong> As duas vencedoras disputam o título. Campeã é a equipe com maior pontuação no final.</li>
                      </ul>
                    </div>
                    <p className="text-sm text-zinc-400 italic mt-4 flex items-center gap-2">
                      <Info className="w-4 h-4" /> O nível de dificuldade das questões é progressivo, simulando o formato do PetroGames oficial.
                    </p>
                  </div>
                </div>
              </div>
            </SpotLightCard>
          </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};
