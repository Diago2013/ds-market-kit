'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface DashboardData {
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    amountFormatted: string;
    status: string;
    createdAt: string;
    product: { name: string; slug: string };
  }>;
  stats: {
    totalOrders: number;
    totalSpent: number;
  };
}

const statusLabels: Record<string, string> = {
  PENDING: '待支付',
  PAID: '已支付',
  PROCESSING: '处理中',
  COMPLETED: '已完成',
  CANCELLED: '已取消',
  REFUNDED: '已退款',
};

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
  PAID: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
  PROCESSING: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
  COMPLETED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
  CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
  REFUNDED: 'bg-slate-100 text-slate-700 dark:bg-slate-900/20 dark:text-slate-400',
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/orders/summary')
      .then((r) => r.json())
      .then(setData)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">我的面板</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {isLoading ? (
          <>
            {[1, 2, 3].map((i) => (
              <div key={i} className="premium-card p-6 animate-pulse">
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-2" />
                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
              </div>
            ))}
          </>
        ) : (
          <>
            <div className="premium-card p-6">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">累计订单</p>
              <p className="text-3xl font-bold">{data?.stats.totalOrders || 0}</p>
            </div>
            <div className="premium-card p-6">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">累计消费</p>
              <p className="text-3xl font-bold premium-gradient">
                ¥{(data?.stats.totalSpent || 0).toFixed(2)}
              </p>
            </div>
            <div className="premium-card p-6">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">快捷操作</p>
              <Link href="/products" className="text-premium-500 hover:underline font-medium text-sm">
                浏览商品 →
              </Link>
            </div>
          </>
        )}
      </div>

      {/* Recent orders */}
      <div className="premium-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">最近订单</h2>
          <Link href="/dashboard/orders" className="text-sm text-premium-500 hover:underline">
            查看全部
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex items-center gap-4">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4" />
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4" />
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/6" />
              </div>
            ))}
          </div>
        ) : data?.recentOrders.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <p>暂无订单</p>
            <Link href="/products" className="text-premium-500 hover:underline text-sm mt-2 inline-block">
              去逛逛 →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {data?.recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{order.product.name}</p>
                  <p className="text-xs text-slate-400">{order.orderNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{order.amountFormatted}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[order.status] || ''}`}>
                    {statusLabels[order.status] || order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
