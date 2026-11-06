import { useEffect, useRef } from 'react';

interface LatencyBadgeProps {
  lastActivityAt?: string;
  isOnline: boolean;
}



function formatLatency(ms: number): { text: string; className: string } {
  if (ms <= 60) {
    return {
      text: `⚡ ${ms}ms`,
      className: 'text-[#ef4444] bg-[#121214]/80 border-[#2a2a31]/50 shadow-[0_0_10px_rgba(239,68,68,0.3)] font-bold',
    };
  }
  if (ms <= 180) {
    return {
      text: `📶 ${ms}ms`,
      className: 'text-[#ef4444] bg-[#121214]/80 border-[#2a2a31]/50 shadow-[0_0_10px_rgba(239,68,68,0.3)] font-bold',
    };
  }
  if (ms <= 400) {
    return {
      text: `⚠️ ${ms}ms`,
      className: 'text-amber-300 bg-amber-950/80 border-amber-500/60 shadow-[0_0_12px_rgba(245,158,11,0.4)] animate-pulse font-bold',
    };
  }
  return {
    text: `🚨 ${ms}ms`,
    className: 'text-[#ef4444] bg-[#121214]/90 border-[#2a2a31]/80 shadow-[0_0_15px_rgba(239,68,68,0.6)] animate-bounce font-black',
  };
}

export default function LatencyBadge({ lastActivityAt, isOnline }: LatencyBadgeProps) {
  const spanRef = useRef<HTMLSpanElement>(null);
  const lastActivityRef = useRef(lastActivityAt);
  const isOnlineRef = useRef(isOnline);
  const seedRef = useRef<number>(Math.random() * 10);

  lastActivityRef.current = lastActivityAt;
  isOnlineRef.current = isOnline;

  useEffect(() => {
    const update = () => {
      const el = spanRef.current;
      if (!el) return;

      if (!isOnlineRef.current || !lastActivityRef.current) {
        el.textContent = '—';
        el.className =
          'font-mono text-[10px] px-2 py-0.5 rounded-md border border-[#24242a] text-[#8b8b94] bg-[#121214]/60';
        return;
      }

      const ts = new Date(lastActivityRef.current).getTime();
      if (Number.isNaN(ts)) {
        el.textContent = '—';
        return;
      }

      const elapsedSec = Math.max(0, (Date.now() - ts) / 1000);
      let calculatedMs: number;

      if (elapsedSec < 5) {
        // Conexão ao vivo excelente: simula ping realista com variação micro-flutuante
        const timeFactor = Date.now() / 1200;
        const wave = Math.sin(timeFactor + seedRef.current) * 8 + Math.cos(timeFactor * 0.7) * 4;
        calculatedMs = Math.floor(14 + Math.abs(wave));
      } else if (elapsedSec < 15) {
        // Oscilação leve (Rede 4G/Wi-Fi com pequena variação)
        calculatedMs = Math.floor(60 + (elapsedSec - 5) * 18);
      } else if (elapsedSec < 35) {
        // Conexão Lenta / Ruim
        calculatedMs = Math.floor(220 + (elapsedSec - 15) * 12);
      } else {
        // Conexão Crítica / Instável
        calculatedMs = Math.floor(480 + (elapsedSec - 35) * 8);
      }

      const { text, className } = formatLatency(calculatedMs);
      el.textContent = text;
      el.className = `font-mono text-[10px] px-2 py-0.5 rounded-md border ${className}`;
    };

    update();
    const id = window.setInterval(update, 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const el = spanRef.current;
    if (!el) return;

    if (!isOnline || !lastActivityAt) {
      el.textContent = '—';
      el.className =
        'font-mono text-[10px] px-2 py-0.5 rounded-md border border-[#24242a] text-[#8b8b94] bg-[#121214]/60';
      return;
    }

    const ts = new Date(lastActivityAt).getTime();
    if (Number.isNaN(ts)) return;

    const elapsedSec = Math.max(0, (Date.now() - ts) / 1000);
    let calculatedMs: number;

    if (elapsedSec < 5) {
      const timeFactor = Date.now() / 1200;
      const wave = Math.sin(timeFactor + seedRef.current) * 8 + Math.cos(timeFactor * 0.7) * 4;
      calculatedMs = Math.floor(14 + Math.abs(wave));
    } else if (elapsedSec < 15) {
      calculatedMs = Math.floor(60 + (elapsedSec - 5) * 18);
    } else if (elapsedSec < 35) {
      calculatedMs = Math.floor(220 + (elapsedSec - 15) * 12);
    } else {
      calculatedMs = Math.floor(480 + (elapsedSec - 35) * 8);
    }

    const { text, className } = formatLatency(calculatedMs);
    el.textContent = text;
    el.className = `font-mono text-[10px] px-2 py-0.5 rounded-md border ${className}`;
  }, [isOnline, lastActivityAt]);

  if (!isOnline) {
    return (
      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded border border-[#2a2a31]/20 text-[#8b8b94] bg-[#121214]/40">
        —
      </span>
    );
  }

  return (
    <span
      ref={spanRef}
      className="font-mono text-[10px] px-1.5 py-0.5 rounded border border-[#2a2a31]/20 text-slate-400 bg-[#121214]/40"
    />
  );
}
