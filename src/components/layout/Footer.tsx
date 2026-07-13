import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
      <div className="page-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-premium-500 to-accent-500 flex items-center justify-center text-white font-bold text-sm">
                P
              </div>
              <span className="font-display text-lg font-bold">PremiumMarket</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
              高品质数字产品与服务平台。我们致力于为个人创作者和企业提供最优质的工具和资源。
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold mb-4">快速链接</h3>
            <ul className="space-y-2">
              <li><Link href="/products" className="text-sm text-slate-500 hover:text-premium-600 dark:hover:text-premium-400 transition-colors">全部商品</Link></li>
              <li><Link href="/register" className="text-sm text-slate-500 hover:text-premium-600 dark:hover:text-premium-400 transition-colors">注册</Link></li>
              <li><Link href="/login" className="text-sm text-slate-500 hover:text-premium-600 dark:hover:text-premium-400 transition-colors">登录</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold mb-4">法律信息</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-slate-500 hover:text-premium-600 dark:hover:text-premium-400 transition-colors">隐私政策</a></li>
              <li><a href="#" className="text-sm text-slate-500 hover:text-premium-600 dark:hover:text-premium-400 transition-colors">服务条款</a></li>
              <li><a href="#" className="text-sm text-slate-500 hover:text-premium-600 dark:hover:text-premium-400 transition-colors">退款政策</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-400">
            &copy; {new Date().getFullYear()} PremiumMarket. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span>安全支付</span>
            <span>SSL 加密</span>
            <span>数据保护</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
