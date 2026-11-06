import io
p = r"C:\Users\user\kryptos\server\web-app\src\pages\DeviceControl.tsx"
s = io.open(p, encoding="utf-8", newline="").read()
a = s.index("const allNodes: ScreenReaderNode[] = [];")
i2 = s.index("allNodes.sort((a, b) => {", a)
b = s.index("});", i2) + 3
new = '''const raw: ScreenReaderNode[] = [];
        collectAllVisibleNodes(hierarchy, raw);

        raw.sort((a, b) => {
          const areaA = (a.bounds?.w || 0) * (a.bounds?.h || 0);
          const areaB = (b.bounds?.w || 0) * (b.bounds?.h || 0);
          return areaB - areaA;
        });

        const allNodes: ScreenReaderNode[] = [];
        for (const n of raw) {
          const t = ((n.text || '').trim() || (n.desc || '').trim()).toLowerCase();
          if (t && n.bounds) {
            const cx = n.bounds.x + n.bounds.w / 2;
            const cy = n.bounds.y + n.bounds.h / 2;
            let dup = false;
            for (const k of allNodes) {
              const kt = ((k.text || '').trim() || (k.desc || '').trim()).toLowerCase();
              if (kt !== t || !k.bounds) continue;
              if (Math.abs(cx - (k.bounds.x + k.bounds.w / 2)) < 110 && Math.abs(cy - (k.bounds.y + k.bounds.h / 2)) < 130) { dup = true; break; }
            }
            if (dup) continue;
          }
          allNodes.push(n);
        }'''
s = s[:a] + new + s[b:]
io.open(p, "w", encoding="utf-8", newline="").write(s)
print("OK dedupe")