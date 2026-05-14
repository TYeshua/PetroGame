import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Copy, Check, CheckCircle2, AlertCircle, User, Users, Mail, CreditCard, Info } from 'lucide-react';

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------
interface CheckoutPixProps {
  titulo: string;
  valorCentavos: number;
  valorFormatado: string;
  onClose: () => void;
}

type Step = 'ID' | 'LOADING' | 'PAY' | 'SUCCESS' | 'ERROR';

interface FormData {
  nome: string;
  email: string;
  cpf: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const envApiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';
const API_URL = envApiUrl.endsWith('/') ? envApiUrl.slice(0, -1) : envApiUrl;
const POLL_INTERVAL_MS = 5_000;

/** Formata CPF enquanto o usuário digita: 000.000.000-00 */
function formatCPF(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

/** Valida e-mail simples */
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}



// ---------------------------------------------------------------------------
// Animações
// ---------------------------------------------------------------------------
const slideVariants = {
  initial:  { opacity: 0, y: 20, scale: 0.97 },
  animate:  { opacity: 1, y: 0,  scale: 1,    transition: { duration: 0.35, ease: 'easeOut' } },
  exit:     { opacity: 0, y: -16, scale: 0.97, transition: { duration: 0.25 } },
};

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------
export default function CheckoutPix({ titulo, valorCentavos, valorFormatado, onClose }: CheckoutPixProps) {
  const isEquipe = titulo.toUpperCase().includes('EQUIPE');

  const [step, setStep]               = useState<Step>('ID');
  const [form, setForm]               = useState<FormData>({ nome: '', email: '', cpf: '' });
  const [errors, setErrors]           = useState<Partial<FormData>>({});
  const [pixCode, setPixCode]                 = useState('');
  const [pixCodeBase64, setPixCodeBase64]     = useState('');
  const [idTransacao, setIdTransacao]         = useState('');
  const [copied, setCopied]                   = useState(false);
  const [errorMsg, setErrorMsg]       = useState('');
  const pollingRef                    = useRef<ReturnType<typeof setInterval> | null>(null);

  // Encerrar polling ao desmontar
  useEffect(() => () => { if (pollingRef.current) clearInterval(pollingRef.current); }, []);

  // ---------------------------------------------------------------------------
  // Polling de status
  // ---------------------------------------------------------------------------
  const startPolling = useCallback((id: string) => {
    if (pollingRef.current) clearInterval(pollingRef.current);

    pollingRef.current = setInterval(async () => {
      try {
        const res  = await fetch(`${API_URL}/api/status-pagamento/${id}`);
        const data = await res.json();
        if (data.status === 'PAGO') {
          clearInterval(pollingRef.current!);
          pollingRef.current = null;
          setStep('SUCCESS');
        }
      } catch {
        // falha silenciosa no polling
      }
    }, POLL_INTERVAL_MS);
  }, []);

  // ---------------------------------------------------------------------------
  // Validação do formulário
  // ---------------------------------------------------------------------------
  function validate(): boolean {
    const errs: Partial<FormData> = {};
    if (!form.nome.trim() || form.nome.trim().length < 3)
      errs.nome  = 'Nome deve ter ao menos 3 caracteres.';
    if (!isValidEmail(form.email))
      errs.email = 'E-mail inválido.';
    if (form.cpf.replace(/\D/g, '').length !== 11)
      errs.cpf   = 'CPF deve ter 11 dígitos.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  // ---------------------------------------------------------------------------
  // Gerar PIX
  // ---------------------------------------------------------------------------
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setStep('LOADING');
    try {
      const res = await fetch(`${API_URL}/api/gerar-pix`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome:  form.nome.trim(),
          email: form.email.trim().toLowerCase(),
          cpf:   form.cpf.replace(/\D/g, ''),
          valor: valorCentavos,   // valor fixo pelo plano (ex: 6000 para Equipe)
          plano: titulo,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.sucesso) {
        throw new Error(data.detail ?? 'Erro desconhecido no servidor.');
      }

      setPixCode(data.qr_code);
      setPixCodeBase64(data.qr_code_base64);
      setIdTransacao(data.id_transacao ?? '');
      setStep('PAY');
      if (data.id_transacao) startPolling(data.id_transacao);

    } catch (err: unknown) {
      console.error("[CheckoutPix] Erro:", err);
      setErrorMsg(err instanceof Error ? err.message : 'Erro ao conectar com o servidor.');
      setStep('ERROR');
    }
  }

  // ---------------------------------------------------------------------------
  // Copiar código PIX
  // ---------------------------------------------------------------------------
  function copiar() {
    if (!pixCode) return;
    navigator.clipboard.writeText(pixCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  // ---------------------------------------------------------------------------
  // Se o X pode fechar (apenas Step ID e PAY)
  // ---------------------------------------------------------------------------
  const canClose = step === 'ID' || step === 'PAY' || step === 'ERROR';

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="w-full max-w-md mx-auto relative">

      {/* Botão fechar — só nos steps permitidos */}
      <AnimatePresence>
        {canClose && (
          <motion.button
            key="close-btn"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-label="Fechar"
            className="absolute -top-2 -right-2 z-20 text-white/40 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">

        {/* ── STEP ID: Formulário ── */}
        {step === 'ID' && (
          <motion.div key="step-id" variants={slideVariants} initial="initial" animate="animate" exit="exit">

            {/* Header diferenciado por plano */}
            <header className="mb-5">
              <div className="flex items-center gap-2 mb-1">
                {isEquipe
                  ? <Users className="w-4 h-4 text-red-500" />
                  : <User className="w-4 h-4 text-red-500" />}
                <p className="text-xs font-semibold uppercase tracking-widest text-red-500">
                  {isEquipe ? 'Plano Equipe' : 'Plano Individual'}
                </p>
              </div>
              <h2 className="text-2xl font-black uppercase text-white tracking-wider">{titulo}</h2>
              <p className="text-4xl font-black text-green-400 mt-1 drop-shadow-[0_0_12px_rgba(74,222,128,0.3)]">
                {valorFormatado}
              </p>
              {isEquipe && (
                <p className="text-xs text-zinc-500 mt-1">Inscrição para até 4 membros de equipe</p>
              )}
            </header>

            {/* Banner informativo exclusivo para equipes */}
            {isEquipe && (
              <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/25 rounded-xl px-4 py-3 mb-5">
                <Info className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-300 leading-relaxed">
                  Após o pagamento, você receberá no seu e-mail um formulário para cadastrar os{' '}
                  <span className="font-bold">4 membros da equipe</span>. Preencha com atenção.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">

              {/* Nome */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  <User className="w-3.5 h-3.5" />
                  {isEquipe ? 'Nome do Líder da Equipe' : 'Seu Nome Completo'}
                </label>
                <input
                  id="checkout-nome"
                  type="text"
                  placeholder={isEquipe ? 'Nome do responsável pela equipe' : 'Seu nome completo'}
                  value={form.nome}
                  onChange={e => setForm(p => ({ ...p, nome: e.target.value }))}
                  className={`w-full bg-white/5 border rounded-xl py-3 px-4 text-sm text-white outline-none placeholder:text-zinc-600
                    focus:border-red-500/70 transition-colors
                    ${errors.nome ? 'border-red-500' : 'border-white/10'}`}
                />
                {errors.nome && <p className="text-red-400 text-xs mt-1">{errors.nome}</p>}
              </div>

              {/* E-mail */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  <Mail className="w-3.5 h-3.5" />
                  {isEquipe ? 'E-mail do Líder' : 'Seu E-mail'}
                </label>
                <input
                  id="checkout-email"
                  type="email"
                  placeholder={isEquipe ? 'email-do-lider@exemplo.com' : 'seu@email.com'}
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  className={`w-full bg-white/5 border rounded-xl py-3 px-4 text-sm text-white outline-none placeholder:text-zinc-600
                    focus:border-red-500/70 transition-colors
                    ${errors.email ? 'border-red-500' : 'border-white/10'}`}
                />
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                {isEquipe && (
                  <p className="text-zinc-600 text-xs mt-1">O formulário dos membros será enviado para este e-mail.</p>
                )}
              </div>

              {/* CPF */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  <CreditCard className="w-3.5 h-3.5" />
                  {isEquipe ? 'CPF do Líder (Pagador)' : 'Seu CPF'}
                </label>
                <input
                  id="checkout-cpf"
                  type="text"
                  inputMode="numeric"
                  placeholder="000.000.000-00"
                  value={form.cpf}
                  onChange={e => setForm(p => ({ ...p, cpf: formatCPF(e.target.value) }))}
                  className={`w-full bg-white/5 border rounded-xl py-3 px-4 text-sm text-white outline-none placeholder:text-zinc-600
                    focus:border-red-500/70 transition-colors font-mono
                    ${errors.cpf ? 'border-red-500' : 'border-white/10'}`}
                />
                {errors.cpf && <p className="text-red-400 text-xs mt-1">{errors.cpf}</p>}
              </div>

              <button
                type="submit"
                id="checkout-submit"
                className={`w-full mt-2 text-white font-bold tracking-wider uppercase py-4 rounded-xl
                  transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]
                  ${isEquipe
                    ? 'bg-gradient-to-r from-red-700 to-red-500 hover:from-red-600 hover:to-red-400 shadow-[0_0_20px_rgba(220,38,38,0.35)] hover:shadow-[0_0_35px_rgba(220,38,38,0.55)]'
                    : 'bg-red-600 hover:bg-red-500 shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_30px_rgba(220,38,38,0.5)]'
                  }`}
              >
                {isEquipe ? '⚡ Inscrever Equipe — Gerar PIX →' : 'Gerar Código PIX →'}
              </button>
            </form>
          </motion.div>
        )}

        {/* ── STEP LOADING ── */}
        {step === 'LOADING' && (
          <motion.div
            key="step-loading"
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex flex-col items-center justify-center gap-6 py-16"
          >
            <div className="relative">
              <div className="w-20 h-20 rounded-full border border-red-500/20 animate-pulse" />
              <Loader2 className="w-10 h-10 text-red-500 animate-spin absolute inset-0 m-auto" />
            </div>
            <div className="text-center">
              <p className="text-white font-bold text-lg tracking-wider">Gerando seu PIX...</p>
              <p className="text-zinc-500 text-sm mt-1">Conectando ao gateway de pagamento</p>
            </div>
          </motion.div>
        )}

        {/* ── STEP PAY: QR Code ── */}
        {step === 'PAY' && (
          <motion.div
            key="step-pay"
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex flex-col items-center gap-5"
          >
            <div className="text-center">
              <h2 className="text-xl font-black uppercase text-white tracking-wider">Escaneie para Pagar</h2>
              <p className="text-zinc-400 text-sm mt-1">{valorFormatado} — {titulo}</p>
            </div>

            {/* QR Code */}
            <div className="p-3 bg-white rounded-2xl shadow-[0_0_40px_rgba(255,255,255,0.08)]">
              {pixCodeBase64 ? (
                <img
                  src={`data:image/jpeg;base64,${pixCodeBase64}`}
                  alt="QR Code PIX"
                  width={200}
                  height={200}
                  className="rounded-lg"
                />
              ) : (
                <div className="w-[200px] h-[200px] flex items-center justify-center bg-zinc-100 rounded-lg">
                  <Loader2 className="w-8 h-8 text-zinc-400 animate-spin" />
                </div>
              )}
            </div>

            {/* Aguardando badge */}
            <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full px-4 py-1.5">
              <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
              <span className="text-yellow-400 text-xs font-semibold tracking-wider uppercase">
                Aguardando pagamento...
              </span>
            </div>

            {/* Copia e cola */}
            <div className="w-full">
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                PIX Copia e Cola
              </label>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={pixCode}
                  className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-xs text-zinc-400 outline-none truncate font-mono"
                />
                <button
                  id="checkout-copiar"
                  onClick={copiar}
                  className={`flex items-center gap-1.5 px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all
                    ${copied
                      ? 'bg-green-600 text-white shadow-[0_0_15px_rgba(34,197,94,0.3)]'
                      : 'bg-red-600 hover:bg-red-500 text-white hover:shadow-[0_0_15px_rgba(220,38,38,0.4)]'
                    }`}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copiado' : 'Copiar'}
                </button>
              </div>
            </div>

            <p className="text-xs text-zinc-600 text-center">
              Verificamos o pagamento automaticamente a cada 5 segundos.
            </p>
          </motion.div>
        )}

        {/* ── STEP SUCCESS ── */}
        {step === 'SUCCESS' && (
          <motion.div
            key="step-success"
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex flex-col items-center justify-center gap-6 py-10 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
              className="relative"
            >
              <div className={`w-24 h-24 rounded-full flex items-center justify-center
                ${ isEquipe
                  ? 'bg-green-500/10 border border-green-500/30 shadow-[0_0_40px_rgba(34,197,94,0.25)]'
                  : 'bg-green-500/10 border border-green-500/30 shadow-[0_0_40px_rgba(34,197,94,0.25)]'
                }`}>
                <CheckCircle2 className="w-12 h-12 text-green-400" />
              </div>
              {/* Badge de tipo de plano */}
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className={`absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                  ${ isEquipe
                    ? 'bg-red-600/90 text-white'
                    : 'bg-zinc-700/90 text-zinc-200'
                  }`}
              >
                {isEquipe ? <Users className="w-3 h-3" /> : <User className="w-3 h-3" />}
                {isEquipe ? 'Equipe' : 'Individual'}
              </motion.div>
            </motion.div>

            <div className="mt-2">
              <h2 className="text-2xl font-black text-white tracking-wider uppercase">
                Pagamento Confirmado!
              </h2>

              {isEquipe ? (
                <>
                  <p className="text-zinc-400 text-sm mt-3 leading-relaxed max-w-xs mx-auto">
                    Sua equipe está inscrita! Enviamos um{' '}
                    <span className="text-amber-400 font-semibold">formulário de cadastro</span>{' '}
                    para o seu e-mail.
                  </p>
                  <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/25 rounded-xl px-4 py-3 mt-4 text-left max-w-xs mx-auto">
                    <Info className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-amber-300 leading-relaxed">
                      Todos os <span className="font-bold">4 membros</span> devem preencher o formulário enviado para garantir a vaga.
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-zinc-400 text-sm mt-3 leading-relaxed max-w-xs mx-auto">
                  Sua inscrição individual foi confirmada! Em breve você receberá os detalhes de acesso no seu e-mail.
                </p>
              )}
            </div>

            <button
              id="checkout-fechar-sucesso"
              onClick={onClose}
              className="mt-2 bg-green-600 hover:bg-green-500 text-white font-bold tracking-wider uppercase px-8 py-3 rounded-xl
                transition-all duration-300 shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)]
                hover:scale-[1.02]"
            >
              Fechar
            </button>
          </motion.div>
        )}

        {/* ── STEP ERROR ── */}
        {step === 'ERROR' && (
          <motion.div
            key="step-error"
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex flex-col items-center justify-center gap-6 py-10 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-red-400" />
            </div>

            <div>
              <h2 className="text-xl font-black text-white tracking-wider uppercase">Ops! Algo deu errado</h2>
              <p className="text-zinc-400 text-sm mt-2 max-w-xs mx-auto leading-relaxed">{errorMsg}</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setStep('ID'); setErrorMsg(''); }}
                className="bg-red-600 hover:bg-red-500 text-white font-bold tracking-wider uppercase px-6 py-3 rounded-xl
                  transition-all hover:scale-[1.02]"
              >
                Tentar Novamente
              </button>
              <button
                onClick={onClose}
                className="border border-white/15 bg-white/5 hover:bg-white/10 text-white font-bold tracking-wider uppercase px-6 py-3 rounded-xl
                  transition-all hover:scale-[1.02]"
              >
                Fechar
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}