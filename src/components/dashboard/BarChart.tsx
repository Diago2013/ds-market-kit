'use client';

import { useEffect, useRef } from 'react';

interface BarChartProps {
  data: Array<{ date: string; revenue: number; orders: number }>;
}

export default function BarChart({ data }: BarChartProps) {
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
    const padding = { top: 20, right: 20, bottom: 30, left: 50 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;

    const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);
    const barWidth = Math.max(4, Math.min(20, chartW / data.length - 4));
    const gap = (chartW - barWidth * data.length) / (data.length + 1);

    // Clear
    ctx.clearRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = isDark ? 'rgba(148,163,184,0.1)' : 'rgba(148,163,184,0.2)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(w - padding.right, y);
      ctx.stroke();

      // Labels
      ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`¥${Math.round(maxRevenue - (maxRevenue / 4) * i)}`, padding.left - 8, y + 4);
    }

    // Bars
    data.forEach((d, i) => {
      const x = padding.left + gap + i * (barWidth + gap);
      const barH = (d.revenue / maxRevenue) * chartH;
      const y = padding.top + chartH - barH;

      const gradient = ctx.createLinearGradient(x, y, x, padding.top + chartH);
      gradient.addColorStop(0, '#0c8ee7');
      gradient.addColorStop(1, '#7cc8fb');
      ctx.fillStyle = gradient;

      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barH, [3, 3, 0, 0]);
      ctx.fill();
    });

    // X-axis labels (show every nth label)
    const labelInterval = Math.max(1, Math.floor(data.length / 8));
    data.forEach((d, i) => {
      if (i % labelInterval !== 0 && i !== data.length - 1) return;
      const x = padding.left + gap + i * (barWidth + gap) + barWidth / 2;
      ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
      ctx.font = '9px Inter, sans-serif';
      ctx.textAlign = 'center';
      const label = d.date.slice(5); // MM-DD
      ctx.fillText(label, x, h - padding.bottom + 16);
    });

  }, [data]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-52"
    />
  );
}
