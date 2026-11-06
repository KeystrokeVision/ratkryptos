import io
p = r"C:\Users\user\kryptos\server\web-app\src\pages\DeviceControl.tsx"
s = io.open(p, encoding="utf-8", newline="").read()
old = """  const radius = Math.min(7, w / 5, h / 5);
  const drawBox = interactive || !!text;
  if (drawBox) {
    ctx.fillStyle = box;
    ctx.beginPath();
    safeRoundRect(ctx, x, y, w, h, radius);
    ctx.fill();

    ctx.strokeStyle = border;"""
new = """  const radius = Math.min(7, w / 5, h / 5);
  const drawBox = interactive || !!text;
  const boxAlpha = Math.min(1, Math.max(0.15, opacity + 0.12));
  if (drawBox) {
    ctx.globalAlpha = boxAlpha;
    ctx.fillStyle = box;
    ctx.beginPath();
    safeRoundRect(ctx, x, y, w, h, radius);
    ctx.fill();
    ctx.globalAlpha = 1;

    ctx.strokeStyle = border;"""
assert old in s, "bloque no encontrado"
s = s.replace(old, new, 1)
io.open(p, "w", encoding="utf-8", newline="").write(s)
print("OK alpha")