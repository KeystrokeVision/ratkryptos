import { useState } from 'react';
import { authAPI } from '../services/api';
import { User, Lock, Key, Loader, Eye, EyeOff, ShieldCheck, QrCode, Copy, CheckCircle2, ArrowLeft } from 'lucide-react';
import LanguageSelector from '../components/LanguageSelector';

interface LoginPageProps {
  onLogin: (token: string) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [hwid, setHwid] = useState('');
  const [needsHwid, setNeedsHwid] = useState(false);
  
  // 2FA Google Authenticator states
  const [needs2FA, setNeeds2FA] = useState(false);
  const [needs2FASetup, setNeeds2FASetup] = useState(false);
  const [twoFactorToken, setTwoFactorToken] = useState('');
  const [totpSecret, setTotpSecret] = useState('');
  const [totpQrCode, setTotpQrCode] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [copiedSecret, setCopiedSecret] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Gera HWID único baseado no navegador
  const generateHWID = (): string => {
    const nav = window.navigator;
    const screen = window.screen;
    
    const data = [
      nav.userAgent,
      nav.language,
      screen.width,
      screen.height,
      screen.colorDepth,
      new Date().getTimezoneOffset(),
      nav.hardwareConcurrency || 0,
      (nav as any).deviceMemory || 0,
    ].join('|');
    
    // Hash simples
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    return Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
  };

  const handleCopySecret = () => {
    if (totpSecret) {
      navigator.clipboard.writeText(totpSecret);
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2500);
    }
  };

  const resetAll2FAStates = () => {
    setNeeds2FA(false);
    setNeeds2FASetup(false);
    setTwoFactorToken('');
    setTotpSecret('');
    setTotpQrCode('');
    setTotpCode('');
    setNeedsHwid(false);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const currentHwid = generateHWID();
      setHwid(currentHwid);

      const response = await authAPI.login({ username, password });
      
      // Verifica se requer Google Authenticator 2FA
      if (response.needs_2fa) {
        setTwoFactorToken(response.two_factor_token || '');
        if (response.needs_2fa_setup) {
          setTotpSecret(response.secret || '');
          setTotpQrCode(response.qr_code || '');
          setNeeds2FASetup(true);
        } else {
          setNeeds2FA(true);
        }
        setLoading(false);
        return;
      }

      if (response.needs_hwid) {
        setNeedsHwid(true);
        setLoading(false);
        return;
      }

      onLogin(response.access_token);
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      let detailStr = '';
      if (typeof detail === 'string') {
        detailStr = detail;
      } else if (Array.isArray(detail)) {
        detailStr = detail.map((d: any) => d.msg || d.message || JSON.stringify(d)).join(', ');
      } else if (detail?.msg) {
        detailStr = detail.msg;
      }
      
      if (detailStr.includes('HWID_NOT_REGISTERED') || detailStr.includes('HWID de outro navegador')) {
        setNeedsHwid(true);
        setError('⚠️ HWID não registrado para este usuário. Informe a chave master de ativação.');
      } else if (detailStr.includes('USER_BANNED')) {
        setError('🚫 Sua conta foi banida. Contate o administrador.');
      } else {
        setError(detailStr || 'Erro ao autenticar');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!totpCode || totpCode.trim().length < 6) {
      setError('Por favor, informe o código de 6 dígitos.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const currentHwid = generateHWID();
      const response = await authAPI.verify2FA({
        two_factor_token: twoFactorToken,
        code: totpCode.trim(),
        hwid: currentHwid
      });

      if (response.needs_hwid) {
        setNeeds2FA(false);
        setNeedsHwid(true);
        setLoading(false);
        return;
      }

      onLogin(response.access_token);
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'Código 2FA incorreto ou expirado.');
    } finally {
      setLoading(false);
    }
  };

  const handleSetup2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!totpCode || totpCode.trim().length < 6) {
      setError('Por favor, insira o código de 6 dígitos gerado pelo Google Authenticator.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const currentHwid = generateHWID();
      const response = await authAPI.setup2FA({
        two_factor_token: twoFactorToken,
        code: totpCode.trim(),
        hwid: currentHwid
      });

      if (response.needs_hwid) {
        setNeeds2FASetup(false);
        setNeedsHwid(true);
        setLoading(false);
        return;
      }

      onLogin(response.access_token);
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'Código de verificação incorreto.');
    } finally {
      setLoading(false);
    }
  };

  const handleHwidActivation = async () => {
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.activateHwid({ username, password, hwid });
      onLogin(response.access_token);
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') {
        setError(detail);
      } else if (Array.isArray(detail)) {
        setError(detail.map((d: any) => d.msg || d.message || JSON.stringify(d)).join(', '));
      } else if (detail?.msg) {
        setError(detail.msg);
      } else {
        setError('Erro ao ativar HWID');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#120303] text-slate-100 flex items-center justify-center p-4 font-sans relative overflow-hidden">
      <div className="absolute top-4 right-4 z-50">
        <LanguageSelector />
      </div>
      
      {/* Grade de fundo cibernética */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, #ef4444 1px, transparent 1px),
            linear-gradient(to bottom, #ef4444 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      ></div>

      {/* Brilhos neon de fundo */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#ef4444]/10 rounded-full blur-[150px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#ef4444]/10 rounded-full blur-[150px] pointer-events-none animate-pulse" style={{ animationDuration: '6s' }}></div>

      <div className="max-w-md w-full relative z-10 my-auto">
        
        {/* LOGO E HEADER */}
        <div className="text-center mb-6 relative">
          <div className="relative inline-block mb-3 group cursor-pointer">
            <div className="absolute inset-[-8px] rounded-full border border-[#2a2a31]/20 animate-pulse"></div>
            <div className="absolute inset-0 rounded-full bg-[#ef4444]/10 blur-lg group-hover:bg-[#ef4444]/20 transition-all"></div>
            
            <img 
              src="/gangstar-logo.svg?v=2" 
              alt="Kryptos Remote" 
              className="relative w-20 h-20 mx-auto transition-transform duration-500 group-hover:scale-105 filter drop-shadow-[0_0_20px_rgba(239,68,68,0.6)]"
            />
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-black tracking-[0.2em] text-white mb-1 uppercase font-mono relative inline-block">
            KRYPTOS <span className="text-[#ef4444] drop-shadow-[0_0_10px_rgba(239,68,68,0.4)]">REMOTE</span>
          </h1>
        </div>

        {/* CONTAINER DO FORMULÁRIO */}
        <div className="bg-[#1e0503]/90 border border-[#2a2a31]/30 shadow-[0_0_40px_rgba(239,68,68,0.1)] rounded-md p-6 sm:p-8 relative overflow-hidden backdrop-blur-md">
          
          {/* Cantos cibernéticos */}
          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#ef4444]"></div>
          <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#ef4444]"></div>
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#ef4444]"></div>
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#ef4444]"></div>

          {/* 1. FLUXO PADRÃO: USUÁRIO E SENHA */}
          {!needs2FA && !needs2FASetup && !needsHwid && (
            <div>
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Usuário */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">
                    Usuário
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3.5 h-4 w-4 text-[#ef4444]" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-[#0f0203]/80 border border-[#2a2a31]/20 rounded-md text-white placeholder-[#6f6f78] focus:outline-none focus:border-[#ef4444] focus:ring-1 focus:ring-[#ef4444]/30 text-sm transition-all font-mono"
                      placeholder="Nome de usuário"
                      required
                    />
                  </div>
                </div>

                {/* Senha */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">
                    Senha
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-[#ef4444]" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-11 py-3 bg-[#0f0203]/80 border border-[#2a2a31]/20 rounded-md text-white placeholder-[#6f6f78] focus:outline-none focus:border-[#ef4444] focus:ring-1 focus:ring-[#ef4444]/30 text-sm transition-all font-mono"
                      placeholder="Senha"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3.5 text-[#8b8b94] hover:text-[#ef4444] transition-colors focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="bg-[#121214]/20 border border-[#2a2a31]/40 text-[#ef4444] px-4 py-3 rounded-md text-xs font-mono">
                    ⚠️ {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-[#ef4444] via-[#ef4444] to-[#ef4444] hover:brightness-110 disabled:from-[#24242a] disabled:to-[#121214] disabled:text-slate-650 disabled:opacity-50 text-white font-bold rounded-md transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest font-mono border border-[#3a3a44]/20 active:scale-[0.98]"
                >
                  {loading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin text-white" />
                      <span>Verificando...</span>
                    </>
                  ) : (
                    <span>Entrar</span>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* 2. FLUXO 2FA: CONFIGURAÇÃO INICIAL GOOGLE AUTHENTICATOR (QR CODE) */}
          {needs2FASetup && (
            <div>
              <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-[#121214]/40 border border-[#ef4444]/40 rounded-full mb-2 text-[#ef4444] shadow-[0_0_15px_rgba(239,68,68,0.25)]">
                  <QrCode className="w-6 h-6" />
                </div>
                <h2 className="text-sm font-black text-white uppercase tracking-wider font-mono">
                  Configurar Google Authenticator
                </h2>
                <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                  Escaneie o QR Code abaixo no app <span className="text-[#ef4444] font-semibold">Google Authenticator</span> no seu celular.
                </p>
              </div>

              <div className="space-y-4">
                {/* QR Code */}
                {totpQrCode && (
                  <div className="flex justify-center my-2">
                    <div className="p-3 bg-white rounded-md shadow-[0_0_25px_rgba(239,68,68,0.2)] border-2 border-[#ef4444]/40">
                      <img 
                        src={totpQrCode} 
                        alt="QR Code Google Authenticator" 
                        className="w-44 h-44 object-contain rounded-md"
                      />
                    </div>
                  </div>
                )}

                {/* Chave manual */}
                {totpSecret && (
                  <div className="bg-[#0f0203]/80 border border-[#2a2a31]/20 rounded-md p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                        Chave Manual (Setup Key)
                      </span>
                      <button
                        type="button"
                        onClick={handleCopySecret}
                        className="text-[10px] text-[#ef4444] hover:text-white flex items-center gap-1 font-mono transition-colors"
                      >
                        {copiedSecret ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        {copiedSecret ? 'Copiado!' : 'Copiar'}
                      </button>
                    </div>
                    <div className="font-mono text-xs text-[#ef4444] break-all select-all tracking-wider bg-black/40 p-2 rounded border border-[#ef4444]/10 text-center">
                      {totpSecret}
                    </div>
                  </div>
                )}

                {/* Formulário de confirmação do código */}
                <form onSubmit={handleSetup2FA} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono text-center">
                      Código de 6 dígitos gerado
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={totpCode}
                      onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000"
                      autoFocus
                      className="w-full py-3 bg-[#0f0203]/80 border border-[#2a2a31]/30 rounded-md text-center text-2xl font-black tracking-[0.35em] text-[#ef4444] placeholder-[#2a2a31] focus:outline-none focus:border-[#ef4444] focus:ring-1 focus:ring-[#ef4444]/40 font-mono transition-all"
                      required
                    />
                  </div>

                  {error && (
                    <div className="bg-[#121214]/20 border border-[#2a2a31]/40 text-[#ef4444] px-4 py-2.5 rounded-md text-xs font-mono">
                      ⚠️ {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || totpCode.length < 6}
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:brightness-110 disabled:opacity-50 text-white font-bold rounded-md transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest font-mono border border-emerald-400/20"
                  >
                    {loading ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin text-white" />
                        <span>Validando...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Confirmar & Entrar</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={resetAll2FAStates}
                    className="w-full py-2 text-slate-400 hover:text-white text-xs font-mono flex items-center justify-center gap-1 transition-colors"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    <span>Voltar ao Login</span>
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* 3. FLUXO 2FA: VERIFICAÇÃO GOOGLE AUTHENTICATOR (CÓDIGO 6 DÍGITOS) */}
          {needs2FA && !needs2FASetup && (
            <div>
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-[#121214]/40 border border-[#ef4444]/40 rounded-full mb-3 text-[#ef4444] shadow-[0_0_20px_rgba(239,68,68,0.3)]">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <h2 className="text-base font-black text-white uppercase tracking-wider font-mono">
                  Verificação em Duas Etapas
                </h2>
                <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                  Digite o código de 6 dígitos gerado pelo aplicativo <span className="text-[#ef4444] font-semibold">Google Authenticator</span>.
                </p>
              </div>

              <form onSubmit={handleVerify2FA} className="space-y-5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono text-center">
                    Código de Segurança (TOTP)
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    autoFocus
                    className="w-full py-3.5 bg-[#0f0203]/80 border border-[#2a2a31]/30 rounded-md text-center text-3xl font-black tracking-[0.35em] text-[#ef4444] placeholder-[#2a2a31] focus:outline-none focus:border-[#ef4444] focus:ring-1 focus:ring-[#ef4444]/40 font-mono transition-all"
                    required
                  />
                </div>

                {error && (
                  <div className="bg-[#121214]/20 border border-[#2a2a31]/40 text-[#ef4444] px-4 py-3 rounded-md text-xs font-mono">
                    ⚠️ {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || totpCode.length < 6}
                  className="w-full py-3 bg-gradient-to-r from-[#ef4444] via-[#ef4444] to-[#ef4444] hover:brightness-110 disabled:opacity-50 text-white font-bold rounded-md transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest font-mono border border-[#3a3a44]/20 active:scale-[0.98]"
                >
                  {loading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin text-white" />
                      <span>Verificando 2FA...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Verificar & Entrar</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={resetAll2FAStates}
                  className="w-full py-2 text-slate-400 hover:text-white text-xs font-mono flex items-center justify-center gap-1 transition-colors"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>Voltar ao Login</span>
                </button>
              </form>
            </div>
          )}

          {/* 4. FLUXO HWID: VINCULAR DISPOSITIVO */}
          {needsHwid && (
            <div>
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-[#121214]/40 border border-[#ef4444]/40 rounded-full mb-3 text-[#ef4444]">
                  <Key className="w-5 h-5" />
                </div>
                <h2 className="text-sm font-black text-white uppercase tracking-wider font-mono">Vincular HWID</h2>
                <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                  Primeiro login detectado a partir deste navegador.
                </p>
              </div>

              <div className="space-y-5">
                <div className="bg-[#0f0203]/80 border border-[#2a2a31]/20 rounded-md p-4">
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono mb-2">
                    Código de Hardware único
                  </label>
                  <div className="bg-[#120303] rounded-md p-3 font-mono text-[11px] text-[#ef4444] break-all select-all border border-[#ef4444]/10">
                    {hwid}
                  </div>
                </div>

                {error && (
                  <div className="bg-[#121214]/20 border border-[#2a2a31]/40 text-[#ef4444] px-4 py-3 rounded-md text-xs font-mono">
                    ⚠️ {error}
                  </div>
                )}

                <button
                  onClick={handleHwidActivation}
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:brightness-110 text-white font-bold rounded-md transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-xs uppercase tracking-widest font-mono border border-emerald-400/20"
                >
                  {loading ? 'Registrando...' : '✅ Registrar & Entrar'}
                </button>

                <button
                  onClick={resetAll2FAStates}
                  className="w-full bg-[#1d0503] hover:bg-[#320a04] text-slate-400 hover:text-white border border-[#2a2a31]/20 font-bold py-2.5 rounded-md transition-all text-xs uppercase tracking-wider font-mono"
                >
                  Voltar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
