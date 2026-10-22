import sys
import os

filepath = r'C:\Users\Usuário\Downloads\PROJETO23\finalvnc\finalvnc\server\web-app\src\pages\DeviceControl.tsx'

with open(filepath, encoding='utf-8') as f:
    lines = f.readlines()

# Find the line with the emoji
target_line = None
for i, line in enumerate(lines):
    if 'font-black text-white flex items-center' in line:
        target_line = i
        break

if target_line is None:
    sys.stdout.buffer.write(b'Pattern not found!\n')
    sys.exit(1)

sys.stdout.buffer.write(f'Found at line {target_line+1}\n'.encode())

# Find the enclosing <div> before and </div> after
# Go backward to find <div>
div_start = target_line
for i in range(target_line, max(target_line-5, 0), -1):
    if '<div>' in lines[i] and '🏦' not in lines[i]:
        div_start = i
        break

# Go forward to find closing </div>  
div_end = target_line
for i in range(target_line, min(target_line+10, len(lines))):
    if '</div>' in lines[i]:
        div_end = i
        break

sys.stdout.buffer.write(f'Replacing lines {div_start+1} to {div_end+1}\n'.encode())

# Build new lines
new_lines = [
    '                          <div className="flex items-center space-x-3">\n',
    '                            <BankIcon pkg={app.package} iconB64={app.icon} name={app.name} size={42} />\n',
    '                            <div>\n',
    '                              <h2 className="text-lg font-black text-white">{app.name}</h2>\n',
    '                              <p className="text-xs text-slate-500 font-mono">{app.package}</p>\n',
    '                            </div>\n',
    '                          </div>\n',
]

lines[div_start:div_end+1] = new_lines

with open(filepath, 'w', encoding='utf-8') as f:
    f.writelines(lines)

sys.stdout.buffer.write(b'Done!\n')
