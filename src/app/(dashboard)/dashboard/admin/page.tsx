'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const BarChart = dynamic(() => import('@/components/dashboard/BarChart'), { ssr: false });
const PieChart = dynamic(() => import('@/components/dashboard/PieChart'), { ssr: false });

interface AdminStats {
  overview: {
    totalUsers: number;
    totalOrders: number;
    totalRevenue: number;
    recentSignups: number;
    conversionRate: string;
  };
  ordersByStatus: Array<{ status: string; count: number }>;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    amount: number;
    status: string;
    createdAt: string;
    user: { name: string; email: string };
    product: { name: string };
  }>;
  topProducts: Array<{ id: string; name: string; sales: number; revenue: number }>;
  dailyRevenue: Array<{ date: string; revenue: number; orders: number }>;
}

const statusLabels: Record<string, string> = {
  PENDING: '待支付', PAID: '已支付', PROCESSING: '处理中',
  COMPLETED: '已完成', CANCELLED: '已取消', REFUNDED: '已退款',
};

const statusColors: Record<string, string> = {
  PENDING: 'text-yellow-500', PAID: 'text-green-500', PROCESSING: 'text-blue-500',
  COMPLETED: 'text-emerald-500', CANCELLED: 'text-red-500', REFUNDED: 'text-slate-500',
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then(setStats)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">管理后台</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="premium-card p-6 animate-pulse">
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-3" />
              <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">管理后台</h1>
        <span className="text-xs text-slate-400">实时数据</span>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="premium-card p-6">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">总用户</p>
          <p className="text-3xl font-bold">{stats.overview.totalUsers}</p>
          <p className="text-xs text-green-500 mt-1">近30天 +{stats.overview.recentSignups}</p>
        </div>
        <div className="premium-card p-6">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">总订单</p>
          <p className="text-3xl font-bold">{stats.overview.totalOrders}</p>
          <p className="text-xs text-slate-400 mt-1">转化率 {stats.overview.conversionRate}%</p>
        </div>
        <div className="premium-card p-6">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">总收入</p>
          <p className="text-3xl font-bold premium-gradient">
            ¥{stats.overview.totalRevenue.toFixed(2)}
          </p>
        </div>
        <div className="premium-card p-6">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">订单状态</p>
          <div className="space-y-1">
            {stats.ordersByStatus.slice(0, 3).map((s) => (
              <div key={s.status} className="flex items-center justify-between text-sm">
                <span className="text-slate-500">{statusLabels[s.status] || s.status}</span>
                <span className="font-medium">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="premium-card p-6">
          <h2 className="text-lg font-semibold mb-4">近30天收入趋势</h2>
          <BarChart data={stats.dailyRevenue} />
        </div>
        <div className="premium-card p-6">
          <h2 className="text-lg font-semibold mb-4">畅销商品 Top 5</h2>
          <div className="space-y-3">
            {stats.topProducts.slice(0, 5).map((product, i) => (
              <div key={product.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-sm font-medium text-slate-400 w-6">{i + 1}</span>
                  <span className="text-sm font-medium truncate">{product.name}</span>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-sm font-semibold">¥{product.revenue.toFixed(2)}</span>
                  <span className="text-xs text-slate-400 ml-2">({product.sales}笔)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Order Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="premium-card p-6">
          <h2 className="text-lg font-semibold mb-4">订单状态分布</h2>
          <PieChart data={stats.ordersByStatus.map((s) => ({
            name: statusLabels[s.status] || s.status,
            value: s.count,
          }))} />
        </div>

        {/* Recent Orders */}
        <div className="premium-card p-6">
          <h2 className="text-lg font-semibold mb-4">最新订单</h2>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {stats.recentOrders.slice(0, 8).map((order) => (
              <div key={order.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{order.product.name}</p>
                  <p className="text-xs text-slate-400 truncate">{order.user.name || order.user.email}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold">¥{order.amount.toFixed(2)}</p>
                  <span className={`text-xs ${statusColors[order.status] || ''}`}>
                    {statusLabels[order.status] || order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
