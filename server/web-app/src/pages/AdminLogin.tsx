import { useState } from 'react';
import { authAPI } from '../services/api';
import { Shield, User, Lock, Loader, QrCode, Copy, CheckCircle2, ShieldCheck, ArrowLeft } from 'lucide-react';

interface AdminLoginProps {
  onLogin: (token: string) => void;
}

export default function AdminLogin({ onLogin }: AdminLoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // 2FA states
  const [needs2FA, setNeeds2FA] = useState(false);
  const [needs2FASetup, setNeeds2FASetup] = useState(false);
  const [twoFactorToken, setTwoFactorToken] = useState('');
  const [totpSecret, setTotpSecret] = useState('');
  const [totpQrCode, setTotpQrCode] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [copiedSecret, setCopiedSecret] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCopySecret = () => {
    if (totpSecret) {
      navigator.clipboard.writeText(totpSecret);
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2500);
    }
  };

  const reset2FA = () => {
    setNeeds2FA(false);
    setNeeds2FASetup(false);
    setTwoFactorToken('');
    setTotpSecret('');
    setTotpQrCode('');
    setTotpCode('');
    setError('');
  };

  const verifyAdminRoleAndComplete = async (token: string) => {
    localStorage.setItem('admin_token', token);
    localStorage.setItem('token', token);
    const userInfo = await authAPI.me();
    if (!userInfo.is_admin) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('token');
      throw new Error('Apenas administradores podem acessar este painel.');
    }
    onLogin(token);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login({ username, password });
      
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

      await verifyAdminRoleAndComplete(response.access_token);
    } catch (err: any) {
      const detail = err.response?.data?.detail || err.message;
      if (detail?.includes('banned') || detail?.includes('banido')) {
        setError('🚫 Sua conta foi banida.');
      } else {
        setError(detail || 'Credenciais inválidas');
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
      const response = await authAPI.verify2FA({
        two_factor_token: twoFactorToken,
        code: totpCode.trim()
      });

      await verifyAdminRoleAndComplete(response.access_token);
    } catch (err: any) {
      const detail = err.response?.data?.detail || err.message;
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
      const response = await authAPI.setup2FA({
        two_factor_token: twoFactorToken,
        code: totpCode.trim()
      });

      await verifyAdminRoleAndComplete(response.access_token);
    } catch (err: any) {
      const detail = err.response?.data?.detail || err.message;
      setError(typeof detail === 'string' ? detail : 'Código de verificação incorreto.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#121214] via-[#121214] to-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#ef4444] rounded-full mb-4 shadow-lg shadow-[#ef4444]/30">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Panel</h1>
          <p className="text-[#ef4444]">Acesso Restrito - Administradores</p>
        </div>

        {/* Form Container */}
        <div className="bg-[#121214]/90 backdrop-blur rounded-md shadow-2xl p-8 border border-[#2a2a31]/30">
          {!needs2FA && !needs2FASetup ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 font-mono">
                  Usuário Admin
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[#24242a] border border-[#2a2a31]/30 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#ef4444] font-mono"
                    placeholder="admin"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 font-mono">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[#24242a] border border-[#2a2a31]/30 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#ef4444] font-mono"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="bg-[#ef4444]/10 border border-[#2a2a31] text-[#ef4444] px-4 py-3 rounded-md text-sm font-mono">
                  ⚠️ {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#ef4444] hover:bg-[#f87171] text-white font-semibold py-3 px-4 rounded-md transition-colors disabled:opacity-50 flex items-center justify-center space-x-2 font-mono uppercase tracking-wider"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Verificando...</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    <span>Entrar como Admin</span>
                  </>
                )}
              </button>
            </form>
          ) : needs2FASetup ? (
            <div className="space-y-4">
              <div className="text-center mb-3">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-[#121214]/60 border border-[#2a2a31]/40 rounded-full mb-2 text-[#ef4444]">
                  <QrCode className="w-6 h-6" />
                </div>
                <h2 className="text-sm font-bold text-white uppercase font-mono">Configurar Google Authenticator (Admin)</h2>
                <p className="text-gray-400 text-xs mt-1">Escaneie o QR Code no seu aplicativo autenticador.</p>
              </div>

              {totpQrCode && (
                <div className="flex justify-center my-2">
                  <div className="p-3 bg-white rounded-md shadow-lg border-2 border-[#2a2a31]/40">
                    <img src={totpQrCode} alt="QR Code 2FA Admin" className="w-40 h-40 object-contain rounded" />
                  </div>
                </div>
              )}

              {totpSecret && (
                <div className="bg-[#121214] border border-[#2a2a31]/20 rounded-md p-2.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase font-mono">Chave Manual</span>
                    <button
                      type="button"
                      onClick={handleCopySecret}
                      className="text-[10px] text-[#ef4444] hover:text-white flex items-center gap-1 font-mono"
                    >
                      {copiedSecret ? <CheckCircle2 className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                      {copiedSecret ? 'Copiado!' : 'Copiar'}
                    </button>
                  </div>
                  <div className="font-mono text-xs text-[#ef4444] break-all select-all bg-black/50 p-1.5 rounded text-center">
                    {totpSecret}
                  </div>
                </div>
              )}

              <form onSubmit={handleSetup2FA} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase mb-1 font-mono text-center">
                    Código de 6 dígitos
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    autoFocus
                    className="w-full py-3 bg-[#121214] border border-[#2a2a31]/30 rounded-md text-center text-2xl font-bold tracking-[0.35em] text-[#ef4444] placeholder-[#2a2a31] focus:outline-none focus:border-[#2a2a31] font-mono"
                    required
                  />
                </div>

                {error && (
                  <div className="bg-[#ef4444]/10 border border-[#2a2a31] text-[#ef4444] px-3 py-2 rounded-md text-xs font-mono">
                    ⚠️ {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || totpCode.length < 6}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold py-3 rounded-md transition-all flex items-center justify-center gap-2 text-xs uppercase font-mono"
                >
                  {loading ? <Loader className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  <span>Confirmar & Entrar</span>
                </button>

                <button
                  type="button"
                  onClick={reset2FA}
                  className="w-full py-2 text-gray-400 hover:text-white text-xs font-mono flex items-center justify-center gap-1"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>Voltar</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-[#121214]/60 border border-[#2a2a31]/40 rounded-full mb-2 text-[#ef4444]">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h2 className="text-base font-bold text-white uppercase font-mono">Autenticação em 2 Etapas</h2>
                <p className="text-gray-400 text-xs mt-1">Digite o código do Google Authenticator.</p>
              </div>

              <form onSubmit={handleVerify2FA} className="space-y-4">
                <div>
                  <input
                    type="text"
                    maxLength={6}
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    autoFocus
                    className="w-full py-3 bg-[#121214] border border-[#2a2a31]/30 rounded-md text-center text-3xl font-bold tracking-[0.35em] text-[#ef4444] placeholder-[#2a2a31] focus:outline-none focus:border-[#2a2a31] font-mono"
                    required
                  />
                </div>

                {error && (
                  <div className="bg-[#ef4444]/10 border border-[#2a2a31] text-[#ef4444] px-3 py-2 rounded-md text-xs font-mono">
                    ⚠️ {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || totpCode.length < 6}
                  className="w-full bg-[#ef4444] hover:bg-[#f87171] disabled:opacity-50 text-white font-bold py-3 rounded-md transition-all flex items-center justify-center gap-2 text-xs uppercase font-mono"
                >
                  {loading ? <Loader className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  <span>Verificar Código</span>
                </button>

                <button
                  type="button"
                  onClick={reset2FA}
                  className="w-full py-2 text-gray-400 hover:text-white text-xs font-mono flex items-center justify-center gap-1"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>Voltar</span>
                </button>
              </form>
            </div>
          )}
        </div>

        <p className="text-center text-[#ef4444]/50 text-xs mt-6">
          🔒 Área restrita - Acesso não autorizado é proibido
        </p>
      </div>
    </div>
  );
}

