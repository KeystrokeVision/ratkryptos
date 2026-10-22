import socket

def check_port(ip, port):
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.settimeout(3)
    try:
        s.connect((ip, port))
        print(f"Port {port} is OPEN")
        s.close()
    except socket.timeout:
        print(f"Port {port} TIMEOUT")
    except Exception as e:
        print(f"Port {port} CLOSED or filtered: {e}")

check_port("192.168.1.70", 7771)
check_port("192.168.1.70", 8080)