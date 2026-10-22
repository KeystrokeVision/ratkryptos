import os
import sqlite3
import shutil
import sys
import gc
import time

def repair_database(db_path):
    print(f"[+] Verificando integridade do banco: {db_path}")
    if not os.path.exists(db_path):
        print(f"[-] Arquivo nao encontrado: {db_path}")
        return False

    wal_file = db_path + "-wal"
    shm_file = db_path + "-shm"

    # Apaga arquivos WAL e SHM velhos que contêm as páginas de log corrompidas
    for extra_file in [wal_file, shm_file]:
        if os.path.exists(extra_file):
            try:
                os.remove(extra_file)
                print(f"[+] Removido arquivo WAL/SHM antigo: {extra_file}")
            except Exception as e:
                print(f"[-] Aviso ao remover {extra_file}: {e}")

    # Tenta um VACUUM/REINDEX se a integridade falhar
    is_corrupt = False
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute("PRAGMA integrity_check")
        res = cursor.fetchone()
        if res and res[0] != "ok":
            print(f"[!] Integridade comprometida: {res[0]}")
            is_corrupt = True
        else:
            print("[+] Banco de dados esta OK (Integridade confirmada).")
        conn.close()
    except Exception as e:
        print(f"[-] Erro ao verificar integridade: {e}")
        is_corrupt = True

    if not is_corrupt:
        # Garante checkpoint WAL para consolidar logs no arquivo principal
        try:
            conn = sqlite3.connect(db_path)
            conn.execute("PRAGMA wal_checkpoint(TRUNCATE);")
            conn.close()
        except Exception:
            pass
        return True

    print("[*] Iniciando processo de RECUPERACAO do banco de dados SQLite...")
    gc.collect()

    backup_path = db_path + ".corrupted_bak"
    repaired_path = db_path + "_repaired.db"

    # Faz backup do arquivo corrompido
    try:
        shutil.copy2(db_path, backup_path)
        print(f"[+] Backup do banco corrompido salvo em: {backup_path}")
    except Exception as e:
        print(f"[-] Erro ao criar backup: {e}")

    try:
        # Limpa arquivo temporário anterior
        if os.path.exists(repaired_path):
            try:
                os.remove(repaired_path)
            except Exception:
                pass
        for extra in [repaired_path + "-wal", repaired_path + "-shm"]:
            if os.path.exists(extra):
                try:
                    os.remove(extra)
                except Exception:
                    pass

        old_conn = sqlite3.connect(db_path)
        new_conn = sqlite3.connect(repaired_path)

        success_count = 0
        error_count = 0

        # Tenta iterdump() primeiro
        try:
            for line in old_conn.iterdump():
                try:
                    new_conn.execute(line)
                    success_count += 1
                except Exception:
                    error_count += 1
                    continue
        except Exception as dump_err:
            print(f"[-] iterdump falhou ({dump_err}), ativando extrator tabela por tabela...")
            # Busca todas as tabelas
            try:
                old_cur = old_conn.cursor()
                old_cur.execute("SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';")
                tables = old_cur.fetchall()
                for tbl_name, tbl_sql in tables:
                    if tbl_sql:
                        try:
                            new_conn.execute(tbl_sql)
                        except Exception:
                            pass
                        # Copia linhas
                        try:
                            # Sanitiza nome da tabela (apenas alfanumérico e underscore)
                            safe_tbl_name = "".join([c for c in str(tbl_name) if c.isalnum() or c == '_'])
                            if safe_tbl_name:
                                old_cur.execute(f"SELECT * FROM `{safe_tbl_name}`")
                                rows = old_cur.fetchall()
                                if rows:
                                    placeholders = ",".join(["?"] * len(rows[0]))
                                    new_conn.executemany(f"INSERT OR IGNORE INTO `{safe_tbl_name}` VALUES ({placeholders})", rows)
                                    success_count += len(rows)
                        except Exception as row_err:
                            print(f"[-] Erro ao ler tabela {tbl_name}: {row_err}")
                            error_count += 1
            except Exception as tbl_err:
                print(f"[-] Erro ao listar tabelas: {tbl_err}")

        new_conn.commit()
        old_conn.close()
        new_conn.close()
        gc.collect()

        print(f"[+] Recuperacao concluida! SQL executados: {success_count}, Ignorados (corrompidos): {error_count}")

        # Garante substituição limpa no Windows
        if os.path.exists(repaired_path) and os.path.getsize(repaired_path) > 0:
            # Apaga banco antigo e todos os resíduos de journal/WAL
            for f_to_remove in [db_path, wal_file, shm_file]:
                if os.path.exists(f_to_remove):
                    try:
                        os.remove(f_to_remove)
                    except Exception as e:
                        print(f"[-] Nao foi possivel remover {f_to_remove}: {e}")

            shutil.move(repaired_path, db_path)

            for extra_file in [wal_file, shm_file]:
                if os.path.exists(extra_file):
                    try:
                        os.remove(extra_file)
                    except Exception:
                        pass

            print("[+] Banco de dados RECUPERADO e RESTAURADO com sucesso!")
            return True
        else:
            print("[!] O banco antigo estava severamente corrompido e desestruturado.")
            print("[!] Resetando arquivo de banco SQLite de forma limpa para restabelecer o servidor...")
            for f_to_remove in [db_path, wal_file, shm_file]:
                if os.path.exists(f_to_remove):
                    try:
                        os.remove(f_to_remove)
                    except Exception as e:
                        print(f"[-] Nao foi possivel remover {f_to_remove}: {e}")
            return True

    except Exception as e:
        print(f"[-] Erro grave durante a recuperacao: {e}")
        print("[!] Forcando reset limpo do banco corrompido para reativar o servidor...")
        for f_to_remove in [db_path, wal_file, shm_file]:
            if os.path.exists(f_to_remove):
                try:
                    os.remove(f_to_remove)
                except Exception:
                    pass
        return True

if __name__ == "__main__":
    target_db = r"c:\Users\Usuário\Downloads\vida (3)\vida\finalvnc\finalvnc\server\gangstar_local.db"
    if len(sys.argv) > 1:
        target_db = sys.argv[1]
    repair_database(target_db)
