import io
p = r"C:\Users\user\kryptos\server\web-app\src\pages\DeviceControl.tsx"
s = io.open(p, encoding="utf-8", newline="").read()

# 1) collectAllVisibleNodes -> solo hojas / sin duplicar texto
a = s.index("const collectAllVisibleNodes = (node: ScreenReaderNode, nodes: ScreenReaderNode[]) => {")
b = s.index("\n};", a)
new_fn = '''const collectAllVisibleNodes = (node: ScreenReaderNode, nodes: ScreenReaderNode[]) => {
  if (!node || !node.bounds) return;
  const { x, y, w, h } = node.bounds;
  if (x + w < -100 || y + h < -100) return;
  if (w < 4 || h < 4) return;

  const kids = Array.isArray(node.children) ? node.children : [];
  const txt = (node.text || '').trim() || (node.desc || '').trim();
  const interactive = !!(node.clickable || node.editable || node.password || node.isPinDigit);

  if (kids.length === 0) {
    if (txt || interactive || node.id) nodes.push(node);
  } else if (txt && interactive) {
    const same = kids.some((k: any) => (((k.text || '').trim() || (k.desc || '').trim()) === txt));
    if (!same) nodes.push(node);
  }

  kids.forEach((child: ScreenReaderNode) => collectAllVisibleNodes(child, nodes));
};'''
s = s[:a] + new_fn + s[b+3:]

# 2) tema por defecto rojo
s = s.replace("useState<'cyan' | 'matrix' | 'neon-red' | 'purple-glowing'>('cyan')",
              "useState<'cyan' | 'matrix' | 'neon-red' | 'purple-glowing'>('neon-red')")

# 3) clases cyan- -> red- (tema rojo Kryptos)
n = s.count("cyan-")
s = s.replace("cyan-", "red-")

io.open(p, "w", encoding="utf-8", newline="").write(s)
print("OK tree2 | cyan- reemplazados:", n)