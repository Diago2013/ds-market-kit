'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  category: string;
  published: boolean;
  stock: number;
  createdAt: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/products')
      .then((r) => r.json())
      .then((data) => setProducts(data.products || []))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">商品管理</h1>
        <Link href="/dashboard/admin/products/new" className="premium-button text-sm px-4 py-2">
          + 添加商品
        </Link>
      </div>

      <div className="premium-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <th className="text-left px-4 py-3 font-medium text-slate-500">名称</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">分类</th>
                <th className="text-right px-4 py-3 font-medium text-slate-500">价格</th>
                <th className="text-center px-4 py-3 font-medium text-slate-500">库存</th>
                <th className="text-center px-4 py-3 font-medium text-slate-500">发布状态</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="text-center py-12">
                  <div className="animate-spin w-6 h-6 border-2 border-premium-500 border-t-transparent rounded-full mx-auto" />
                </td></tr>
              ) : products.map((p) => (
                <tr key={p.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                  <td className="px-4 py-3"><p className="font-medium">{p.name}</p><p className="text-xs text-slate-400">/{p.slug}</p></td>
                  <td className="px-4 py-3 text-slate-500">{p.category}</td>
                  <td className="px-4 py-3 text-right font-semibold">¥{(p.price / 100).toFixed(2)}</td>
                  <td className="px-4 py-3 text-center">{p.stock}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs px-2 py-1 rounded-full ${p.published ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}>
                      {p.published ? '已发布' : '草稿'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
