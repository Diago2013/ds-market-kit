'use client';

import { useEffect, useState } from 'react';

interface Order {
  id: string;
  orderNumber: string;
  amount: number;
  amountFormatted: string;
  status: string;
  paymentMethod: string | null;
  createdAt: string;
  user: { name: string; email: string };
  product: { name: string };
}

interface Pagination {
  page: number; limit: number; total: number; totalPages: number;
}

const statusLabels: Record<string, string> = {
  PENDING: '待支付', PAID: '已支付', PROCESSING: '处理中',
  COMPLETED: '已完成', CANCELLED: '已取消', REFUNDED: '已退款',
};

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
  PAID: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
  PROCESSING: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
  COMPLETED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
  CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
  REFUNDED: 'bg-slate-100 text-slate-700 dark:bg-slate-900/20 dark:text-slate-400',
};

const statusOptions = ['', 'PENDING', 'PAID', 'PROCESSING', 'COMPLETED', 'CANCELLED', 'REFUNDED'];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchOrders = () => {
    setIsLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '15' });
    if (statusFilter) params.set('status', statusFilter);

    fetch(`/api/admin/orders?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setOrders(data.orders || []);
        setPagination(data.pagination);
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => { fetchOrders(); }, [page, statusFilter]);

  const updateStatus = async (id: string, newStatus: string) => {
    await fetch(`/api/admin/orders?id=${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    fetchOrders();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">订单管理</h1>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="input-field w-40 text-sm"
        >
          <option value="">全部状态</option>
          {statusOptions.filter(Boolean).map((s) => (
            <option key={s} value={s}>{statusLabels[s] || s}</option>
          ))}
        </select>
      </div>

      <div className="premium-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <th className="text-left px-4 py-3 font-medium text-slate-500">订单号</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">用户</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">商品</th>
                <th className="text-right px-4 py-3 font-medium text-slate-500">金额</th>
                <th className="text-center px-4 py-3 font-medium text-slate-500">状态</th>
                <th className="text-center px-4 py-3 font-medium text-slate-500">操作</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <div className="animate-spin w-6 h-6 border-2 border-premium-500 border-t-transparent rounded-full mx-auto" />
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">暂无订单</td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-mono text-xs">{order.orderNumber}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{new Date(order.createdAt).toLocaleDateString('zh-CN')}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm">{order.user.name || '-'}</p>
                      <p className="text-xs text-slate-400">{order.user.email}</p>
                    </td>
                    <td className="px-4 py-3 text-sm">{order.product.name}</td>
                    <td className="px-4 py-3 text-right font-semibold">{order.amountFormatted}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs px-2 py-1 rounded-full ${statusColors[order.status] || ''}`}>
                        {statusLabels[order.status] || order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <select
                        defaultValue=""
                        onChange={(e) => {
                          if (e.target.value) updateStatus(order.id, e.target.value);
                        }}
                        className="text-xs bg-transparent border border-slate-300 dark:border-slate-600 rounded-lg px-2 py-1 focus:ring-1 focus:ring-premium-500"
                      >
                        <option value="" disabled>修改状态</option>
                        {statusOptions.filter(Boolean).map((s) => (
                          <option key={s} value={s}>{statusLabels[s] || s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1}
            className="px-3 py-1.5 rounded-lg text-sm bg-slate-100 dark:bg-slate-800 disabled:opacity-50">上一页</button>
          <span className="text-sm text-slate-500 px-3">{page} / {pagination.totalPages}</span>
          <button onClick={() => setPage(Math.min(pagination.totalPages, page + 1))} disabled={page >= pagination.totalPages}
            className="px-3 py-1.5 rounded-lg text-sm bg-slate-100 dark:bg-slate-800 disabled:opacity-50">下一页</button>
        </div>
      )}
    </div>
  );
}
