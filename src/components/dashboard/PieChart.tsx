'use client';

import { useEffect, useRef } from 'react';

interface PieChartProps {
  data: Array<{ name: string; value: number }>;
}

const COLORS = ['#0c8ee7', '#d946ef', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function PieChart({ data }: PieChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !data.length) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const canvas = canvasRef.current;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const isDark = document.documentElement.classList.contains('dark');
    const w = rect.width;
    const h = rect.height;
    const cx = w * 0.35;
    const cy = h / 2;
    const radius = Math.min(cx, cy) - 20;

    ctx.clearRect(0, 0, w, h);

    const total = data.reduce((sum, d) => sum + d.value, 0);
    if (total === 0) {
      ctx.fillStyle = isDark ? '#475569' : '#cbd5e1';
      ctx.font = '14px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('暂无数据', cx, cy + 5);
      return;
    }

    let startAngle = -Math.PI / 2;

    data.forEach((d, i) => {
      const sliceAngle = (d.value / total) * Math.PI * 2;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, startAngle, startAngle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = COLORS[i % COLORS.length];
      ctx.fill();

      // Label
      const midAngle = startAngle + sliceAngle / 2;
      const labelR = radius * 0.65;
      const lx = cx + Math.cos(midAngle) * labelR;
      const ly = cy + Math.sin(midAngle) * labelR;
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (d.value / total > 0.05) {
        ctx.fillText(`${Math.round((d.value / total) * 100)}%`, lx, ly);
      }

      startAngle += sliceAngle;
    });

    // Legend
    const legendX = w * 0.6;
    const legendY = h * 0.2;
    ctx.font = '12px Inter, sans-serif';
    ctx.textBaseline = 'middle';

    data.forEach((d, i) => {
      const y = legendY + i * 24;
      ctx.fillStyle = COLORS[i % COLORS.length];
      ctx.fillRect(legendX, y - 4, 12, 12);
      ctx.fillStyle = isDark ? '#e2e8f0' : '#334155';
      ctx.textAlign = 'left';
      ctx.fillText(`${d.name} (${d.value})`, legendX + 20, y + 2);
    });

  }, [data]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-52"
    />
  );
}
