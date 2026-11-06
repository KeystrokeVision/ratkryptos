import shutil
F = r"C:\Users\user\kryptos\server\web-app\src\pages\DeviceControl.tsx"
shutil.copyfile(F, F + ".bak_blackspeed")
s = open(F, encoding="utf-8").read()

OLD = """  const toggleBlackScreen = async () => {
    const newState = !isBlackScreen;
    await sendCommand({
      action: newState ? 'BLACK_SCREEN_ON' : 'BLACK_SCREEN_OFF'
    });
    setIsBlackScreen(newState);
    // Sempre define o block touch como desativado ao ativar ou desativar a tela preta
    setIsBlackTouchBlocked(false);
    await sendCommand({ action: 'TOGGLE_BLACK_SCREEN_TOUCH', blocked: false });
    if (!newState) {
      setBlackScreenOpacity(100);
    }
    addLog(newState ? 'Tela preta ATIVADA' : 'Tela preta DESATIVADA');
  };"""

NEW = """  const toggleBlackScreen = async () => {
    const newState = !isBlackScreen;
    // [KRYPTOS-PATCH SPEED] UI otimista: muda o botao AGORA, envia depois
    setIsBlackScreen(newState);
    setIsBlackTouchBlocked(false);
    if (!newState) {
      setBlackScreenOpacity(100);
    }
    addLog(newState ? 'Tela preta ATIVADA' : 'Tela preta DESATIVADA');
    try {
      await sendCommand({
        action: newState ? 'BLACK_SCREEN_ON' : 'BLACK_SCREEN_OFF'
      });
      await sendCommand({ action: 'TOGGLE_BLACK_SCREEN_TOUCH', blocked: false });
    } catch (e) {}
  };"""

assert s.count(OLD) == 1, "toggle nao encontrado"
s = s.replace(OLD, NEW)
open(F, "w", encoding="utf-8").write(s)
print("frontend: UI otimista aplicada")
