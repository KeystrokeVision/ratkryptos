import React from 'react';

interface LayoutEditToolbarProps {
  isEditMode: boolean;
  isDirty: boolean;
  onToggleEditMode: () => void;
  onSave: () => void;
  onReset: () => void;
}

export const LayoutEditToolbar: React.FC<LayoutEditToolbarProps> = ({
  isEditMode,
  isDirty,
  onToggleEditMode,
  onSave,
  onReset,
}) => {
  return (
    <div className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${
      isEditMode ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'
    }`}>
      <div className="bg-gray-800 border border-gray-600 rounded-xl shadow-2xl px-4 py-3 flex items-center gap-4">
        {/* Indicador de modo */}
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          <span className="text-red-400 font-medium text-sm">Modo EdiÃ§Ã£o</span>
        </div>

        <div className="w-px h-6 bg-gray-600" />

        {/* InstruÃ§Ãµes */}
        <div className="text-xs text-gray-400">
          <span className="text-yellow-400">Arraste bordas</span> para redimensionar â€¢ 
          <span className="text-yellow-400"> Clique em botÃµes</span> para editar cores
        </div>

        <div className="w-px h-6 bg-gray-600" />

        {/* BotÃµes de aÃ§Ã£o */}
        <div className="flex items-center gap-2">
          {isDirty && (
            <span className="text-xs text-orange-400 animate-pulse">
              â€¢ AlteraÃ§Ãµes nÃ£o salvas
            </span>
          )}
          
          <button
            onClick={onReset}
            className="px-3 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
            title="Resetar para layout padrÃ£o"
          >
            ðŸ”„ Resetar
          </button>
          
          <button
            onClick={onSave}
            className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
              isDirty 
                ? 'bg-rose-600 hover:bg-rose-500 text-white' 
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
            disabled={!isDirty}
            title="Salvar layout"
          >
            ðŸ’¾ Salvar
          </button>
          
          <button
            onClick={onToggleEditMode}
            className="px-3 py-1.5 text-xs bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
            title="Sair do modo ediÃ§Ã£o"
          >
            âœ– Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

// BotÃ£o flutuante para ativar modo ediÃ§Ã£o
export const EditModeToggle: React.FC<{
  isEditMode: boolean;
  onToggle: () => void;
}> = ({ isEditMode, onToggle }) => {
  if (isEditMode) return null;

  return (
    <button
      onClick={onToggle}
      className="fixed bottom-4 right-4 z-50 w-12 h-12 bg-red-600 hover:bg-red-500 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
      title="Ativar modo de ediÃ§Ã£o de layout"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    </button>
  );
};

export default LayoutEditToolbar;



