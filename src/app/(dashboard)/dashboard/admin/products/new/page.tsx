'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewProductPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '', slug: '', description: '', price: '',
    category: '订阅', imageUrl: '', stock: '0',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const priceCents = Math.round(parseFloat(form.price) * 100);
    if (isNaN(priceCents) || priceCents <= 0) {
      setError('请输入有效的价格');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          price: priceCents,
          stock: parseInt(form.stock) || 0,
          imageUrl: form.imageUrl || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || data.details?.name?.[0] || '创建失败');
        return;
      }

      router.push('/dashboard/admin/products');
    } catch {
      setError('网络错误');
    } finally {
      setIsLoading(false);
    }
  };

  const autoFillSlug = (name: string) => {
    setForm((f) => ({ ...f, name, slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') }));
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-8">添加新商品</h1>

      <form onSubmit={handleSubmit} className="premium-card p-6 space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">{error}</div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1.5">商品名称</label>
          <input value={form.name} onChange={(e) => autoFillSlug(e.target.value)}
            className="input-field" placeholder="例如：专业版订阅" required />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Slug (URL 标识)</label>
          <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })}
            className="input-field font-mono text-sm" placeholder="pro-monthly" required />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">描述</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="input-field h-24 resize-none" placeholder="商品详细介绍..." required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">价格 (元)</label>
            <input type="number" step="0.01" min="0.01" value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="input-field" placeholder="29.99" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">库存</label>
            <input type="number" min="0" value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              className="input-field" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">分类</label>
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="input-field">
            <option>订阅</option>
            <option>插件</option>
            <option>服务</option>
            <option>资源</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">图片 URL (可选)</label>
          <input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
            className="input-field" placeholder="https://example.com/image.jpg" />
        </div>

        <button type="submit" disabled={isLoading} className="premium-button w-full">
          {isLoading ? '创建中...' : '创建商品'}
        </button>
      </form>
    </div>
  );
}
