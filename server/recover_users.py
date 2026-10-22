import os
import sqlite3
import glob

def recover_users():
    server_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Encontra o banco ativo (gangstar_active.db ou gangstar_local.db)
    active_db = os.path.join(server_dir, "gangstar_active.db")
    if not os.path.exists(active_db):
        active_db = os.path.join(server_dir, "gangstar_local.db")
        
    print(f"[+] Banco ativo identificado: {active_db}")
    
    # Procura arquivos de backup ou bancos antigos na pasta
    candidates = glob.glob(os.path.join(server_dir, "gangstar_local*.db*"))
    
    operators_found = []
    
    for cand in candidates:
        if cand == active_db or cand.endswith("-wal") or cand.endswith("-shm"):
            continue
            
        print(f"🔍 Verificando candidatos a backup: {os.path.basename(cand)}...")
        try:
            conn = sqlite3.connect(cand)
            cur = conn.cursor()
            cur.execute("SELECT id, username, email, hashed_password, role, hwid, created_at, is_active, is_banned, is_approved, approval_notes, permissions, updated_at FROM operators;")
            rows = cur.fetchall()
            conn.close()
            
            if rows:
                print(f"[+] Encontrados {len(rows)} usuários no arquivo {os.path.basename(cand)}!")
                for r in rows:
                    if r[1] != "admin": # Evita duplicar admin se já existir
                        operators_found.append(r)
        except Exception as e:
            # Tenta pegar tabelas brutas se a query estrita falhar
            try:
                conn = sqlite3.connect(cand)
                cur = conn.cursor()
                cur.execute("SELECT * FROM operators;")
                cols = [description[0] for description in cur.description]
                rows = cur.fetchall()
                conn.close()
                if rows:
                    print(f"[+] Encontrados {len(rows)} usuários (formato genérico) em {os.path.basename(cand)}")
            except Exception:
                pass

    if not operators_found:
        print("[-] Nenhum operador secundário antigo encontrado nos backups locais.")
        return

    # Insere os usuários encontrados no banco ativo
    try:
        conn_act = sqlite3.connect(active_db)
        cur_act = conn_act.cursor()
        
        restored = 0
        for op in operators_found:
            try:
                # op: (id, username, email, hashed_password, role, hwid, created_at, is_active, is_banned, is_approved, approval_notes, permissions, updated_at)
                cur_act.execute("""
                    INSERT OR IGNORE INTO operators 
                    (username, email, hashed_password, role, hwid, created_at, is_active, is_banned, is_approved, approval_notes, permissions, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (op[1], op[2], op[3], op[4], op[5], op[6], op[7], op[8], op[9], op[10], op[11], op[12] if len(op)>12 else None))
                restored += 1
            except Exception as ins_err:
                print(f"[-] Erro ao inserir usuário {op[1]}: {ins_err}")

        conn_act.commit()
        conn_act.close()
        print(f"🎉 SUCESSO! {restored} logins/usuários foram RECUPERADOS e inseridos no banco ativo com sucesso!")
        
    except Exception as e:
        print(f"[-] Erro ao gravar no banco ativo: {e}")

if __name__ == "__main__":
    recover_users()
