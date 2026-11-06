import React, { useEffect, useRef } from 'react';
import bannerImgUrl from '../assets/gangstar-banner-bg.jpg';

interface Particle {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  alpha: number;
  pulseSpeed: number;
  color: string;
}

interface TrailSpark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
}

interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
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

    // Preload Kryptos Remote Banner Logo
    const bannerImg = new Image();
    let bannerLoaded = false;
    bannerImg.onload = () => {
      bannerLoaded = true;
    };
    bannerImg.src = bannerImgUrl;
    if (bannerImg.complete) {
      bannerLoaded = true;
    }

    // Mouse state & physics
    const mouse = {
      x: width / 2,
      y: height / 2,
      targetX: width / 2,
      targetY: height / 2,
      radius: 220,
      active: true,
    };

    const shockwaves: Shockwave[] = [];
    const trailSparks: TrailSpark[] = [];

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.active = true;

      // Mouse interactive sparks
      for (let i = 0; i < 2; i++) {
        trailSparks.push({
          x: e.clientX + (Math.random() - 0.5) * 12,
          y: e.clientY + (Math.random() - 0.5) * 12,
          vx: (Math.random() - 0.5) * 1.8,
          vy: (Math.random() - 0.5) * 1.8 - 0.5,
          size: Math.random() * 3.5 + 1.5,
          alpha: 1,
          color: Math.random() > 0.4 ? '#ff2b2b' : '#ff6b6b',
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
        radius: 8,
        maxRadius: 280,
        alpha: 0.95,
      });

      for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 5 + 2;
        trailSparks.push({
          x: e.clientX,
          y: e.clientY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 4.5 + 2,
          alpha: 1,
          color: Math.random() > 0.5 ? '#ff2b2b' : '#ff6b6b',
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

    const colors = ['#ff2b2b', '#ff6b6b', '#ef4444', '#ff6b6b', '#ffd400'];
    const particleCount = Math.min(Math.floor((width * height) / 11000), 90);
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2.5 + 1.2,
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.7,
        alpha: Math.random() * 0.55 + 0.35,
        pulseSpeed: Math.random() * 0.02 + 0.008,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      mouse.x += (mouse.targetX - mouse.x) * 0.12;
      mouse.y += (mouse.targetY - mouse.y) * 0.12;
      time += 0.018;

      // 1. Deep Space Dark Base
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, '#0e0203');
      bgGrad.addColorStop(0.5, '#1a0503');
      bgGrad.addColorStop(1, '#01030a');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Render Kryptos Logo Background Banner with Pulse & Vignette
      if (bannerLoaded) {
        ctx.save();
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Full screen cover scaling covering entire viewport
        const scale = Math.max(width / bannerImg.width, height / bannerImg.height);
        const imgW = bannerImg.width * scale;
        const imgH = bannerImg.height * scale;
        const imgX = (width - imgW) / 2;
        const imgY = (height - imgH) / 2;

        // Dynamic breathing scale effect
        const breath = Math.sin(time * 1.5) * 5;

        // Opacidade vibrante e cristalina para exibir a logo de fundo da Kryptos em todo o painel
        const isMobileScreen = width <= 640;
        ctx.globalAlpha = isMobileScreen ? 0.70 : 0.95;
        ctx.drawImage(bannerImg, imgX - breath / 2, imgY - breath / 2, imgW + breath, imgH + breath);

        // Vinheta suave nas bordas para integração perfeita
        const vignette = ctx.createRadialGradient(
          width / 2,
          height / 2,
          Math.min(width, height) * (isMobileScreen ? 0.35 : 0.50),
          width / 2,
          height / 2,
          Math.max(width, height) * 0.90
        );
        vignette.addColorStop(0, 'rgba(14, 2, 3, 0.05)');
        vignette.addColorStop(0.6, 'rgba(17, 3, 3, 0.25)');
        vignette.addColorStop(1, 'rgba(1, 3, 10, 0.75)');

        ctx.globalAlpha = 1;
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
      }

      // 3. Cyber Grid Line Mesh with interactive cursor flare
      const gridSize = 50;
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += gridSize) {
        const dx = Math.abs(x - mouse.x);
        const intensity = mouse.active && dx < 220 ? (1 - dx / 220) * 0.16 : 0.035;
        ctx.strokeStyle = `rgba(255, 43, 43, ${intensity})`;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      for (let y = 0; y < height; y += gridSize) {
        const dy = Math.abs(y - mouse.y);
        const intensity = mouse.active && dy < 220 ? (1 - dy / 220) * 0.16 : 0.035;
        ctx.strokeStyle = `rgba(255, 43, 43, ${intensity})`;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 4. Interactive Cursor Radial Spotlight Glow
      if (mouse.active) {
        const spotGrad = ctx.createRadialGradient(
          mouse.x,
          mouse.y,
          0,
          mouse.x,
          mouse.y,
          mouse.radius * 1.6
        );
        spotGrad.addColorStop(0, 'rgba(255, 43, 43, 0.25)');
        spotGrad.addColorStop(0.35, 'rgba(220, 38, 38, 0.14)');
        spotGrad.addColorStop(0.75, 'rgba(239, 68, 68, 0.04)');
        spotGrad.addColorStop(1, 'transparent');

        ctx.fillStyle = spotGrad;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, mouse.radius * 1.6, 0, Math.PI * 2);
        ctx.fill();
      }

      // 5. Update and render Click Shockwaves
      for (let i = shockwaves.length - 1; i >= 0; i--) {
        const sw = shockwaves[i];
        sw.radius += 7.5;
        sw.alpha *= 0.93;

        ctx.save();
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 43, 43, ${sw.alpha})`;
        ctx.lineWidth = 3;
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#ff2b2b';
        ctx.stroke();
        ctx.restore();

        if (sw.radius > sw.maxRadius || sw.alpha < 0.02) {
          shockwaves.splice(i, 1);
        }
      }

      // 6. Update and render Mouse Trail Sparks
      for (let i = trailSparks.length - 1; i >= 0; i--) {
        const sp = trailSparks[i];
        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.alpha *= 0.92;
        sp.size *= 0.96;

        ctx.save();
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
        ctx.fillStyle = sp.color;
        ctx.globalAlpha = sp.alpha;
        ctx.shadowBlur = 12;
        ctx.shadowColor = sp.color;
        ctx.fill();
        ctx.restore();

        if (sp.alpha < 0.05 || sp.size < 0.4) {
          trailSparks.splice(i, 1);
        }
      }

      // 7. Update and render Particles & Laser Connections
      particles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        p.alpha += p.pulseSpeed;
        if (p.alpha > 0.85 || p.alpha < 0.3) {
          p.pulseSpeed = -p.pulseSpeed;
        }

        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Repulsion physics & Cursor Laser Beam Connection
        if (mouse.active && dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          const angle = Math.atan2(dy, dx);

          p.x -= Math.cos(angle) * force * 5;
          p.y -= Math.sin(angle) * force * 5;

          ctx.save();
          ctx.beginPath();
          ctx.moveTo(mouse.x, mouse.y);
          ctx.lineTo(p.x, p.y);
          ctx.strokeStyle = `rgba(255, 43, 43, ${force * 0.8})`;
          ctx.lineWidth = force * 2.2;
          ctx.shadowBlur = 15;
          ctx.shadowColor = '#ff2b2b';
          ctx.stroke();
          ctx.restore();
        }

        // Constellation lines between particles
        for (let j = idx + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const pdx = p2.x - p.x;
          const pdy = p2.y - p.y;
          const pdist = Math.sqrt(pdx * pdx + pdy * pdy);

          if (pdist < 120) {
            const lineAlpha = (1 - pdist / 120) * 0.35;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(255, 107, 107, ${lineAlpha})`;
            ctx.lineWidth = 0.9;
            ctx.stroke();
          }
        }

        // Draw Particle Node
        ctx.save();
        ctx.beginPath();
        const curRadius = dist < mouse.radius ? p.radius * 1.8 : p.radius;
        ctx.arc(p.x, p.y, curRadius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowBlur = dist < mouse.radius ? 22 : 8;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.restore();
      });

      // 8. Bottom Cyber Wave
      ctx.save();
      ctx.beginPath();
      ctx.lineWidth = 2.2;
      const waveGrad = ctx.createLinearGradient(0, 0, width, 0);
      waveGrad.addColorStop(0, 'rgba(255, 43, 43, 0.15)');
      waveGrad.addColorStop(0.5, 'rgba(220, 38, 38, 0.4)');
      waveGrad.addColorStop(1, 'rgba(255, 43, 43, 0.15)');
      ctx.strokeStyle = waveGrad;
      ctx.shadowBlur = 14;
      ctx.shadowColor = '#ff2b2b';

      for (let x = 0; x < width; x += 10) {
        const y = Math.sin(x * 0.0035 + time) * 40 + height * 0.82;
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
