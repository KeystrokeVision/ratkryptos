"""
Configuracao do banco de dados — SQLite (Local/VPS) e PostgreSQL.
"""

import gangstar_env  # noqa: F401 — bootstrap env antes do engine

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import QueuePool

import os
import sqlite3

DATABASE_URL = gangstar_env.database_url()
_is_sqlite = DATABASE_URL.startswith("sqlite")

if _is_sqlite:
    db_file = DATABASE_URL.replace("sqlite:///", "").split("?")[0]
    if os.path.exists(db_file):
        try:
            test_conn = sqlite3.connect(db_file)
            test_cur = test_conn.cursor()
            test_cur.execute("PRAGMA integrity_check")
            res = test_cur.fetchone()
            test_conn.close()
            if res and res[0] != "ok":
                print(f"[!] Banco SQLite corrompido detectado ({res[0]}). Executando reparo automático...")
                from repair_db import repair_database
                repair_database(db_file)
        except Exception as e:
            print(f"[!] Erro ao abrir banco SQLite para teste ({e}). Forçando reparo...")
            try:
                from repair_db import repair_database
                repair_database(db_file)
            except Exception as r_err:
                print(f"[-] Falha no reparo forçado: {r_err}")

        # SE O BANCO AINDA ESTIVER CORROMPIDO:
        try:
            check_conn = sqlite3.connect(db_file)
            check_cur = check_conn.cursor()
            check_cur.execute("SELECT name FROM sqlite_master LIMIT 1;")
            check_conn.close()
        except Exception:
            print("[!] ALERTA CRÍTICO: O banco antigo estava corrompido.")
            print("[!] Ativando banco limpo permanente (gangstar_active.db)...")
            DATABASE_URL = "sqlite:///gangstar_active.db"
            try:
                from recover_users import recover_users
                recover_users()
            except Exception as rec_err:
                print(f"[-] Aviso na recuperação de usuários: {rec_err}")

    engine = create_engine(
        DATABASE_URL,
        echo=False,
        connect_args={
            "check_same_thread": False,
            "timeout": 30
        },
        poolclass=QueuePool,
        pool_size=25,
        max_overflow=50,
        pool_timeout=60,
        pool_recycle=15
    )
    from sqlalchemy import event
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        try:
            cursor = dbapi_connection.cursor()
            cursor.execute("PRAGMA journal_mode=WAL;")
            cursor.execute("PRAGMA synchronous=NORMAL;")
            cursor.execute("PRAGMA busy_timeout=60000;")
            cursor.execute("PRAGMA wal_autocheckpoint=100;")
            cursor.execute("PRAGMA cache_size=-64000;")
            cursor.execute("PRAGMA temp_store=MEMORY;")
            cursor.execute("PRAGMA wal_autocheckpoint=100;")
            cursor.close()
        except Exception as e:
            print(f"[!] Aviso no PRAGMA WAL SQLite (continuando em modo seguro): {e}")
else:
    engine = create_engine(
        DATABASE_URL,
        echo=False,
        pool_size=50,
        max_overflow=100,
        pool_timeout=60,
        pool_recycle=300
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def checkpoint_wal():
    """Executa checkpoint PASSIVE do WAL no SQLite para evitar inchaço do arquivo log."""
    if not _is_sqlite:
        return
    try:
        db_path = DATABASE_URL.replace("sqlite:///", "").split("?")[0]
        if os.path.exists(db_path):
            conn = sqlite3.connect(db_path, timeout=10)
            conn.execute("PRAGMA wal_checkpoint(PASSIVE);")
            conn.close()
    except Exception as e:
        print(f"[!] Aviso no checkpoint WAL: {e}")


def get_db():
    """Fornece sessao do banco de dados com liberação explicita de transação."""
    db = SessionLocal()
    try:
        yield db
    finally:
        try:
            db.rollback()
        except Exception:
            pass
        db.close()
