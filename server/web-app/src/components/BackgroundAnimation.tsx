import React, { useEffect, useRef } from 'react';
import bannerImgUrl from '../assets/restrito.jpg';

interface Particle {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  alpha: number;
  pulseSpeed: number;
  color: string;
  glowColor: string;
}

interface TrailSpark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
  decay: number;
}

interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
}

interface FloatingHex {
  x: number;
  y: number;
  size: number;
  angle: number;
  rotSpeed: number;
  alpha: number;
  vx: number;
  vy: number;
}

const BackgroundAnimation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Preload RESTRITO Remote Banner Logo
    const bannerImg = new Image();
    let bannerLoaded = false;
    bannerImg.onload = () => {
      if (bannerImg.naturalWidth > 0 && bannerImg.naturalHeight > 0) {
        bannerLoaded = true;
      }
    };
    bannerImg.src = bannerImgUrl;
    if (bannerImg.complete && bannerImg.naturalWidth > 0 && bannerImg.naturalHeight > 0) {
      bannerLoaded = true;
    }

    // Mouse state & physics
    const mouse = {
      x: width / 2,
      y: height / 2,
      targetX: width / 2,
      targetY: height / 2,
      speed: 0,
      radius: 260,
      active: true,
      lastMoveTime: Date.now(),
    };

    const shockwaves: Shockwave[] = [];
    const trailSparks: TrailSpark[] = [];
    const floatingHexes: FloatingHex[] = [];

    // Initialize floating tech hexagons
    for (let i = 0; i < 14; i++) {
      floatingHexes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 24 + 14,
        angle: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.015,
        alpha: Math.random() * 0.18 + 0.08,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
      });
    }

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - mouse.targetX;
      const dy = e.clientY - mouse.targetY;
      mouse.speed = Math.sqrt(dx * dx + dy * dy);
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.active = true;
      mouse.lastMoveTime = Date.now();

      // Emit luminous sparks along mouse trajectory
      const sparkCount = Math.min(Math.floor(mouse.speed / 8) + 1, 4);
      for (let i = 0; i < sparkCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const spd = Math.random() * 2.5 + 0.8;
        trailSparks.push({
          x: e.clientX + (Math.random() - 0.5) * 14,
          y: e.clientY + (Math.random() - 0.5) * 14,
          vx: Math.cos(angle) * spd + (Math.random() - 0.5) * 1.2,
          vy: Math.sin(angle) * spd - Math.random() * 1.0,
          size: Math.random() * 3.5 + 1.5,
          alpha: 1,
          color: Math.random() > 0.4 ? '#ff1e4d' : '#ff3b6b',
          decay: Math.random() * 0.03 + 0.02,
        });
      }
    };

    const handleMouseLeave = () => {
      mouse.active = false;
    };

    const handleClick = (e: MouseEvent) => {
      shockwaves.push({
        x: e.clientX,
        y: e.clientY,
        radius: 10,
        maxRadius: 340,
        alpha: 1,
        color: '#ff1e4d',
      });

      shockwaves.push({
        x: e.clientX,
        y: e.clientY,
        radius: 5,
        maxRadius: 200,
        alpha: 0.8,
        color: '#ff3b6b',
      });

      // Explosion of stardust sparks on click
      for (let i = 0; i < 24; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 6.5 + 2.5;
        trailSparks.push({
          x: e.clientX,
          y: e.clientY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 4.5 + 2,
          alpha: 1,
          color: i % 3 === 0 ? '#ff1e4d' : i % 3 === 1 ? '#ff3b6b' : '#ff0055',
          decay: Math.random() * 0.025 + 0.015,
        });
      }
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('click', handleClick);
    window.addEventListener('resize', handleResize);

    const colors = [
      { fill: '#ff1e4d', glow: 'rgba(255, 30, 77, 0.9)' },
      { fill: '#ff3b6b', glow: 'rgba(255, 59, 107, 0.8)' },
      { fill: '#ff0055', glow: 'rgba(255, 0, 85, 0.85)' },
      { fill: '#ff4d6d', glow: 'rgba(255, 77, 109, 0.8)' },
      { fill: '#ff2e5d', glow: 'rgba(255, 46, 93, 0.9)' },
      { fill: '#ff1a40', glow: 'rgba(255, 26, 64, 0.8)' },
    ];

    const particleCount = Math.min(Math.floor((width * height) / 9000), 130);
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      const col = colors[Math.floor(Math.random() * colors.length)];
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2.6 + 1.4,
        vx: (Math.random() - 0.5) * 0.85,
        vy: (Math.random() - 0.5) * 0.85,
        alpha: Math.random() * 0.5 + 0.45,
        pulseSpeed: Math.random() * 0.025 + 0.01,
        color: col.fill,
        glowColor: col.glow,
      });
    }

    let time = 0;

    // Helper: draw polygon / hexagon
    const drawHexagon = (cx: number, cy: number, r: number, angle: number, strokeColor: string, fillAlpha: number) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3;
        const hx = Math.cos(a) * r;
        const hy = Math.sin(a) * r;
        if (i === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      if (fillAlpha > 0) {
        ctx.fillStyle = `rgba(255, 30, 77, ${fillAlpha})`;
        ctx.fill();
      }
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.restore();
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth lerp mouse tracking for fluid organic feel
      mouse.x += (mouse.targetX - mouse.x) * 0.14;
      mouse.y += (mouse.targetY - mouse.y) * 0.14;
      time += 0.02;

      const isMouseIdle = Date.now() - mouse.lastMoveTime > 3500;
      const effectiveMouseRadius = isMouseIdle ? mouse.radius * 0.75 : mouse.radius;

      // 1. Deep Space Dark Base with Cyber Ambient Gradients
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, '#0a0206');
      bgGrad.addColorStop(0.5, '#1a0408');
      bgGrad.addColorStop(1, '#050206');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Render RESTRITO Logo Background Banner with Parallax Shift & Holographic Pulse
      if (bannerLoaded && bannerImg.naturalWidth > 0 && bannerImg.naturalHeight > 0) {
        try {
          ctx.save();
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          const scale = Math.max(width / bannerImg.naturalWidth, height / bannerImg.naturalHeight);
          if (isFinite(scale) && scale > 0) {
            const imgW = bannerImg.naturalWidth * scale;
            const imgH = bannerImg.naturalHeight * scale;

            // Subtle Parallax shift based on mouse position
            const parallaxX = (mouse.x - width / 2) * 0.025;
            const parallaxY = (mouse.y - height / 2) * 0.025;

            const imgX = (width - imgW) / 2 + parallaxX;
            const imgY = (height - imgH) / 2 + parallaxY;

            // Dynamic holographic pulse
            const breath = Math.sin(time * 1.5) * 6;

            const isMobileScreen = width <= 640;
            ctx.globalAlpha = isMobileScreen ? 0.75 : 0.95;
            ctx.drawImage(bannerImg, imgX - breath / 2, imgY - breath / 2, imgW + breath, imgH + breath);

            // Vinheta suave nas bordas para integraÃ§Ã£o perfeita com o painel escuro
            const vignette = ctx.createRadialGradient(
              width / 2,
              height / 2,
              Math.min(width, height) * (isMobileScreen ? 0.35 : 0.5),
              width / 2,
              height / 2,
              Math.max(width, height) * 0.92
            );
            vignette.addColorStop(0, 'rgba(2, 5, 14, 0.02)');
            vignette.addColorStop(0.55, 'rgba(2, 6, 17, 0.22)');
            vignette.addColorStop(1, 'rgba(1, 3, 10, 0.78)');

            ctx.globalAlpha = 1;
            ctx.fillStyle = vignette;
            ctx.fillRect(0, 0, width, height);
          }
          ctx.restore();
        } catch (e) {
          console.warn('Banner draw error:', e);
        }
      }

      // 3. Cyber Grid Mesh reacting with magnetic illumination to Cursor
      const gridSize = 56;
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += gridSize) {
        const dx = Math.abs(x - mouse.x);
        const intensity = mouse.active && dx < effectiveMouseRadius ? (1 - dx / effectiveMouseRadius) * 0.22 : 0.035;
        ctx.strokeStyle = `rgba(255, 30, 77, ${intensity})`;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      for (let y = 0; y < height; y += gridSize) {
        const dy = Math.abs(y - mouse.y);
        const intensity = mouse.active && dy < effectiveMouseRadius ? (1 - dy / effectiveMouseRadius) * 0.22 : 0.035;
        ctx.strokeStyle = `rgba(255, 30, 77, ${intensity})`;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 4. Floating Tech Hexagons Reacting to Cursor Distance
      floatingHexes.forEach((hex) => {
        hex.x += hex.vx;
        hex.y += hex.vy;
        hex.angle += hex.rotSpeed;

        if (hex.x < -40) hex.x = width + 40;
        if (hex.x > width + 40) hex.x = -40;
        if (hex.y < -40) hex.y = height + 40;
        if (hex.y > height + 40) hex.y = -40;

        const hdx = mouse.x - hex.x;
        const hdy = mouse.y - hex.y;
        const hdist = Math.sqrt(hdx * hdx + hdy * hdy);

        let curAlpha = hex.alpha;
        let fillA = 0.02;
        if (mouse.active && hdist < effectiveMouseRadius) {
          const factor = 1 - hdist / effectiveMouseRadius;
          curAlpha = hex.alpha + factor * 0.55;
          fillA = factor * 0.15;
          hex.x -= (hdx / hdist) * factor * 1.5;
          hex.y -= (hdy / hdist) * factor * 1.5;
        }

        drawHexagon(hex.x, hex.y, hex.size, hex.angle, `rgba(255, 30, 77, ${curAlpha})`, fillA);
      });

      // 5. Dynamic Cursor Spotlight Aureole (Glow que segue o mouse)
      if (mouse.active) {
        const spotGrad = ctx.createRadialGradient(
          mouse.x,
          mouse.y,
          0,
          mouse.x,
          mouse.y,
          effectiveMouseRadius * 1.4
        );
        spotGrad.addColorStop(0, 'rgba(255, 30, 77, 0.28)');
        spotGrad.addColorStop(0.25, 'rgba(0, 150, 255, 0.18)');
        spotGrad.addColorStop(0.6, 'rgba(37, 99, 235, 0.06)');
        spotGrad.addColorStop(1, 'transparent');

        ctx.fillStyle = spotGrad;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, effectiveMouseRadius * 1.4, 0, Math.PI * 2);
        ctx.fill();

        // Inner bright cyber cursor center
        const innerGrad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 45);
        innerGrad.addColorStop(0, 'rgba(255, 30, 77, 0.45)');
        innerGrad.addColorStop(0.7, 'rgba(255, 30, 77, 0.12)');
        innerGrad.addColorStop(1, 'transparent');

        ctx.fillStyle = innerGrad;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 45, 0, Math.PI * 2);
        ctx.fill();
      }

      // 6. Update and render Click Shockwaves
      for (let i = shockwaves.length - 1; i >= 0; i--) {
        const sw = shockwaves[i];
        sw.radius += 8;
        sw.alpha *= 0.94;

        ctx.save();
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 30, 77, ${sw.alpha})`;
        ctx.lineWidth = 3.5;
        ctx.shadowBlur = 24;
        ctx.shadowColor = sw.color;
        ctx.stroke();
        ctx.restore();

        if (sw.radius > sw.maxRadius || sw.alpha < 0.02) {
          shockwaves.splice(i, 1);
        }
      }

      // 7. Update and render Mouse Trail Sparks
      for (let i = trailSparks.length - 1; i >= 0; i--) {
        const sp = trailSparks[i];
        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.alpha -= sp.decay;
        sp.size *= 0.97;

        if (sp.alpha > 0 && sp.size > 0.3) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
          ctx.fillStyle = sp.color;
          ctx.globalAlpha = Math.max(0, sp.alpha);
          ctx.shadowBlur = 14;
          ctx.shadowColor = sp.color;
          ctx.fill();
          ctx.restore();
        } else {
          trailSparks.splice(i, 1);
        }
      }

      // 8. Update and render Particles & Laser Beam Connections to Mouse
      particles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        p.alpha += p.pulseSpeed;
        if (p.alpha > 0.9 || p.alpha < 0.35) {
          p.pulseSpeed = -p.pulseSpeed;
        }

        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Magnetic Attraction / Repulsion & Direct Laser Beam to Cursor
        if (mouse.active && dist < effectiveMouseRadius) {
          const force = (effectiveMouseRadius - dist) / effectiveMouseRadius;
          const angle = Math.atan2(dy, dx);

          p.x -= Math.cos(angle) * force * 4.2;
          p.y -= Math.sin(angle) * force * 4.2;

          ctx.save();
          ctx.beginPath();
          ctx.moveTo(mouse.x, mouse.y);
          ctx.lineTo(p.x, p.y);
          ctx.strokeStyle = `rgba(255, 30, 77, ${force * 0.85})`;
          ctx.lineWidth = force * 2.4;
          ctx.shadowBlur = 18;
          ctx.shadowColor = '#ff1e4d';
          ctx.stroke();
          ctx.restore();
        }

        // Constellation Lines between nearby Particles
        for (let j = idx + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const pdx = p2.x - p.x;
          const pdy = p2.y - p.y;
          const pdist = Math.sqrt(pdx * pdx + pdy * pdy);

          if (pdist < 135) {
            const lineAlpha = (1 - pdist / 135) * 0.42;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(56, 189, 248, ${lineAlpha})`;
            ctx.lineWidth = 1.0;
            ctx.stroke();
          }
        }

        // Draw Particle Node
        ctx.save();
        ctx.beginPath();
        const isNear = dist < effectiveMouseRadius;
        const curRadius = isNear ? p.radius * 1.9 : p.radius;
        ctx.arc(p.x, p.y, curRadius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowBlur = isNear ? 26 : 10;
        ctx.shadowColor = p.glowColor;
        ctx.fill();
        ctx.restore();
      });

      // 9. Bottom Oscillating Cyber Laser Waves
      ctx.save();
      ctx.beginPath();
      ctx.lineWidth = 2.4;
      const waveGrad = ctx.createLinearGradient(0, 0, width, 0);
      waveGrad.addColorStop(0, 'rgba(255, 30, 77, 0.18)');
      waveGrad.addColorStop(0.5, 'rgba(37, 99, 235, 0.55)');
      waveGrad.addColorStop(1, 'rgba(255, 30, 77, 0.18)');
      ctx.strokeStyle = waveGrad;
      ctx.shadowBlur = 16;
      ctx.shadowColor = '#ff1e4d';

      for (let x = 0; x < width; x += 12) {
        const mouseEffect = mouse.active ? Math.sin((x - mouse.x) * 0.01) * 15 : 0;
        const y = Math.sin(x * 0.0035 + time) * 38 + mouseEffect + height * 0.85;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 1 }}
    />
  );
};

export default BackgroundAnimation;

