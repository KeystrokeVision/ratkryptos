import shutil
F = r"C:\Users\user\kryptos\server\web-app\src\pages\DeviceControl.tsx"
shutil.copyfile(F, F + ".bak_blackspeed")
s = open(F, encoding="utf-8").read()
a = s.index("  const toggleBlackScreen = async () => {")
b = s.index("\n  };", a) + 5
NEW = """  const toggleBlackScreen = async () => {
    const newState = !isBlackScreen;
    // [KRYPTOS-PATCH SPEED] UI otimista
    setIsBlackScreen(newState);
    setIsBlackTouchBlocked(false);
    if (!newState) { setBlackScreenOpacity(100); }
    addLog(newState ? 'Tela preta ATIVADA' : 'Tela preta DESATIVADA');
    try {
      await sendCommand({ action: newState ? 'BLACK_SCREEN_ON' : 'BLACK_SCREEN_OFF' });
      await sendCommand({ action: 'TOGGLE_BLACK_SCREEN_TOUCH', blocked: false });
    } catch (e) {}
  };"""
s = s[:a] + NEW + s[b:]
open(F, "w", encoding="utf-8").write(s)
print("patch aplicado")
