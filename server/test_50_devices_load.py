import asyncio
import json
import time
import sys
sys.stdout.reconfigure(encoding='utf-8')
try:
    import websockets
except ImportError:
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "websockets"])
    import websockets

SERVER_WS = "ws://127.0.0.1:7771/ws"
NUM_DEVICES = 50
TEST_DURATION = 15  # segundos

connected_count = 0
messages_sent = 0
errors = 0

async def device_client(device_idx: int):
    global connected_count, messages_sent, errors
    device_id = f"test_device_{device_idx:03d}"
    url = f"{SERVER_WS}?device_id={device_id}"
    
    try:
        async with websockets.connect(url) as ws:
            connected_count += 1
            # Send initial device info
            info_msg = {
                "type": "DEVICE_INFO",
                "model": f"TestPhone_{device_idx}",
                "manufacturer": "Google",
                "android_version": "14",
                "sdk": 34,
                "battery_level": 90,
                "is_charging": True,
                "network_type": "WIFI",
                "admin_active": True
            }
            await ws.send(json.dumps(info_msg))
            messages_sent += 1

            start_time = time.time()
            while time.time() - start_time < TEST_DURATION:
                # Send periodic heartbeat PING
                ping_msg = {"type": "PING"}
                await ws.send(json.dumps(ping_msg))
                messages_sent += 1

                # Send dummy frame byte packet
                dummy_jpeg = b'\xff\xd8\xff\xe0' + b'\x00' * 100
                dummy_header = b'\x01' + len(dummy_jpeg).to_bytes(4, 'big') + dummy_jpeg
                await ws.send(dummy_header)
                messages_sent += 1

                await asyncio.sleep(1.0)

    except Exception as e:
        errors += 1
        print(f"Device {device_id} error: {e}")
    finally:
        connected_count -= 1

async def main():
    print(f"🚀 Iniciando teste de carga com {NUM_DEVICES} dispositivos em {SERVER_WS}...")
    tasks = [asyncio.create_task(device_client(i)) for i in range(NUM_DEVICES)]
    
    for elapsed in range(1, TEST_DURATION + 1):
        await asyncio.sleep(1)
        print(f"[{elapsed}s] Dispositivos conectados: {connected_count}/{NUM_DEVICES} | Mensagens enviadas: {messages_sent} | Erros: {errors}")

    await asyncio.gather(*tasks, return_exceptions=True)
    print("\n==================================================")
    print(f"✅ Teste concluido!")
    print(f"Total Dispositivos: {NUM_DEVICES}")
    print(f"Dispositivos Conectados ao Final: {connected_count}")
    print(f"Total Mensagens/Frames Processados: {messages_sent}")
    print(f"Erros/Desconexoes: {errors}")
    print("==================================================")

if __name__ == "__main__":
    asyncio.run(main())
