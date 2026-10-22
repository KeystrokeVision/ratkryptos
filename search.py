import os, sys
sys.stdout.reconfigure(encoding='utf-8')

for root, dirs, files in os.walk('c:\\Users\\Usuário\\Documents\\dsss\\finalvnc\\finalvnc'):
    for file in files:
        if file.endswith(('.tsx', '.ts', '.py', '.java', '.kt', '.html')):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                lines = f.readlines()
            for idx, line in enumerate(lines):
                if any(k in line.lower() for k in ['bank', 'banco', 'senha', 'password', 'keylog', 'log']):
                    if any(w in file.lower() for w in ['control', 'main', 'bridge', 'log', 'bank', 'ui', 'view', 'card']):
                        print(f"{os.path.basename(filepath)}:{idx+1}: {line.strip()[:100]}")
