#!/bin/bash
# ============================================================
#   Gangstar Remote Server — VPS (PostgreSQL + uvicorn turbo)
# ============================================================

echo ""
echo "============================================================"
echo "   Gangstar Remote Server — VPS (Linux Turbo Mode)"
echo "============================================================"
echo ""

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR" || exit 1

echo "[1/4] Parando processos anteriores..."
pkill -f "python3.*main.py" 2>/dev/null
pkill -f "uvicorn.*main:app" 2>/dev/null
pkill -f "python3.*launch_8080.py" 2>/dev/null
sleep 2

echo "[2/4] Configurando ambiente..."
export PYTHONOPTIMIZE="2"
export PYTHONASYNCIODEBUG="0"
export PYTHONDONTWRITEBYTECODE="1"
export PYTHONUNBUFFERED="1"
export FRAME_TTL_SECONDS="60"
export HIERARCHY_TTL_SECONDS="30"
export DASHBOARD_QUEUE_SIZE="10"
export GANGSTAR_UVICORN_WORKERS="1"

if [ -f ".env.vps" ]; then
    while IFS= read -r line || [ -n "$line" ]; do
        # Trim whitespace
        line=$(echo "$line" | xargs 2>/dev/null || echo "$line" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')
        if [ -n "$line" ] && [[ ! "$line" =~ ^# ]] && [[ "$line" == *"="* ]]; then
            key=$(echo "$line" | cut -d'=' -f1 | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')
            val=$(echo "$line" | cut -d'=' -f2- | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//' -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")
            export "$key"="$val"
        fi
    done < ".env.vps"
fi

if [ -z "$DATABASE_URL" ]; then
    export DATABASE_URL="postgresql://postgres:1111@localhost:5432/rat_db"
fi
if [ -z "$SERVER_URL" ]; then
    DETECTED_IP=$(curl -s -m 3 https://api.ipify.org 2>/dev/null || echo "127.0.0.1")
    export SERVER_URL="http://$DETECTED_IP:7771"
fi

# Auto-generate websocket URL from server url if not set
if [ -z "$SERVER_WS_URL" ]; then
    TEMP_URL=${SERVER_URL#http://}
    TEMP_URL=${TEMP_URL#https://}
    IP_ONLY=$(echo "$TEMP_URL" | cut -d':' -f1)
    export SERVER_WS_URL="ws://$IP_ONLY:7771/ws"
fi

echo "[3/4] Build frontend (web-dist)..."
if [ -d "web-app" ]; then
    cd web-app || exit 1
    if [ ! -d "node_modules" ]; then
        npm install
    fi
    npm run build
    if [ $? -ne 0 ]; then
        echo "[AVISO] npm run build falhou ou npm não está instalado."
        echo "Tentando continuar utilizando a pasta dist pré-existente..."
    fi
    cd ..
fi

echo "[4/4] Iniciando servidor..."
echo "   Porta: 7771 | Workers: 4 | DB: PostgreSQL"
echo "   Painel: $SERVER_URL"
echo "   WS URL: $SERVER_WS_URL"
echo ""

echo "[INFO] Garantindo dependências do Bypass..."
python3 -m pip install flask werkzeug --quiet

echo "[INFO] Iniciando o servidor Bypass na porta 8080..."
(cd "$SCRIPT_DIR/projeto_bypass" && nohup python3 launch_8080.py > server_8080.log 2>&1 &)
echo "[OK] Servidor Bypass iniciado em segundo plano na porta 8080."
echo ""

# Tenta rodar com uvicorn
python3 -m uvicorn main:app \
    --host 0.0.0.0 \
    --port 7771 \
    --workers $GANGSTAR_UVICORN_WORKERS \
    --ws websockets \
    --ws-max-size 16777216 \
    --ws-ping-interval 30 \
    --ws-ping-timeout 60 \
    --timeout-keep-alive 120 \
    --limit-concurrency 2000 \
    --backlog 2048
