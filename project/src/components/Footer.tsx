import { motion } from 'framer-motion';
import { Flame, Mail, Linkedin, Instagram, MapPin } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-obsidian-900 py-8">
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent" />

      <div className="container relative z-10 mx-auto px-6">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex flex-col gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-red-900 shadow-glow-red">
                <Flame className="h-5 w-5 text-white" />
              </div>
              <span className="font-display text-xl font-black uppercase tracking-wider text-white">
                PETROGAME
              </span>
            </div>

            <a 
              href="https://maps.app.goo.gl/a3Jp688nDv2JPWHQ9"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-zinc-400 hover:text-red-400 transition-colors group"
            >
              <MapPin className="h-4 w-4 text-red-500" />
              <span className="font-body text-xs leading-relaxed">
                Casa da Cultura - Salinópolis, PA
              </span>
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col gap-6 lg:items-end"
          >
            <div className="flex items-center gap-4">
              {[
                { icon: Linkedin, href: 'https://www.linkedin.com/company/spe-ufpa-student-chapter/posts/?feedView=all' },
                { icon: Instagram, href: 'https://www.instagram.com/spe.ufpa?igsh=dXM1M2s1bTEzbTdz' },
              ].map((social, i) => (
                <motion.a
                  key={i}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 backdrop-blur-lg transition-all duration-300 hover:border-red-600/50 hover:bg-red-600/10 hover:shadow-glow-red"
                >
                  <social.icon className="h-4 w-4 text-zinc-400 transition-colors duration-300 hover:text-red-400" />
                </motion.a>
              ))}
              
              <div className="h-8 w-px bg-white/10 mx-2 hidden lg:block" />

              <a 
                href="mailto:ufpaspe@gmail.com"
                className="flex items-center gap-2 text-zinc-400 hover:text-red-400 transition-colors group"
              >
                <Mail className="h-4 w-4" />
                <span className="font-body text-sm font-medium">ufpaspe@gmail.com</span>
              </a>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-8 border-t border-white/10 pt-6 flex flex-col items-center justify-between gap-6 lg:flex-row lg:gap-0 font-body text-xs text-zinc-600"
        >
          <p>
            © {currentYear} PetroGame. Todos os direitos reservados.
          </p>
          
          <div className="flex items-center gap-4">
            <span className="text-zinc-500 uppercase tracking-widest text-[9px] font-bold">Desenvolvido por</span>
            <a 
              href="https://www.linkedin.com/in/thiagoyeshua" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 border border-white/10 hover:border-red-600/50 hover:bg-red-600/10 transition-all duration-300"
            >
              <span className="font-display font-bold text-zinc-400 group-hover:text-white transition-colors text-[11px]">
                Thiago Yeshua
              </span>
              <Linkedin className="h-3 w-3 text-zinc-500 group-hover:text-white transition-all" />
            </a>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
