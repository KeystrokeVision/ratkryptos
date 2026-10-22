"""Cria tabelas + usuario admin local (SQLite ou PostgreSQL via DATABASE_URL)."""
import os
import sys

if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

from database import engine, Base, SessionLocal
from init_database import create_default_admin


def ensure_local_admin() -> None:
    """Idempotente: tabelas + admin para SQLite local."""
    from database import DATABASE_URL
    import models

    if not DATABASE_URL.startswith("sqlite"):
        return

    try:
        Base.metadata.create_all(bind=engine)
        create_default_admin()

        db = SessionLocal()
        try:
            from models import Operator

            admin = db.query(Operator).filter(Operator.username == "admin").first()
            if admin and admin.hwid is None:
                admin.hwid = "LOCAL-DEV-HWID"
                db.commit()
        finally:
            db.close()
    except Exception as e:
        print(f"[!] Erro ao inicializar tabelas/admin local: {e}")


def main() -> int:
    from database import DATABASE_URL

    print(f"Banco: {DATABASE_URL}")
    ensure_local_admin()
    print("")
    print("Login local:")
    print("  Usuario: admin")
    print("  Senha:   admin")
    return 0


if __name__ == "__main__":
    sys.exit(main())
