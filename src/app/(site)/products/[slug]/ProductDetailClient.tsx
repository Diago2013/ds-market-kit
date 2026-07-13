'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { trackEvent } from '@/components/AnalyticsProvider';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  currency: string;
  priceFormatted: string;
  imageUrl: string | null;
  category: string;
  featured: boolean;
  stock: number;
}

export default function ProductDetailClient({ slug }: { slug: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [authCheck, setAuthCheck] = useState<boolean | null>(null);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/products/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setProduct(null);
        } else {
          setProduct(data);
        }
      })
      .finally(() => setIsLoading(false));

    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => setAuthCheck(!!data.user));
  }, [slug]);

  const handlePurchase = async () => {
    if (!authCheck) {
      router.push(`/login?redirect=/products/${slug}`);
      return;
    }

    if (!product) return;

    setIsPurchasing(true);
    setError('');

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || '创建订单失败');
        return;
      }

      trackEvent('initiate_purchase', { productId: product.id, productName: product.name });

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch {
      setError('网络错误，请稍后重试');
    } finally {
      setIsPurchasing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="page-container py-12">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-4" />
            <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-xl mb-8" />
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full mb-2" />
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-8" />
            <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded w-48" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="page-container py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">商品未找到</h1>
        <p className="text-slate-500 mb-8">该商品不存在或已下架</p>
        <Link href="/products" className="premium-button">返回商品列表</Link>
      </div>
    );
  }

  return (
    <div className="page-container py-12">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-8">
          <Link href="/" className="hover:text-premium-500 transition-colors">首页</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-premium-500 transition-colors">商品</Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-slate-200">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div>
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full rounded-2xl shadow-lg"
              />
            ) : (
              <div className="w-full aspect-square rounded-2xl bg-gradient-to-br from-premium-100 to-accent-100 dark:from-premium-900/30 dark:to-accent-900/30 flex items-center justify-center">
                <svg className="w-24 h-24 text-premium-300 dark:text-premium-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-premium-50 text-premium-600 dark:bg-premium-900/20 dark:text-premium-400 self-start mb-4">
              {product.category}
            </span>

            <h1 className="text-3xl sm:text-4xl font-bold mb-4">{product.name}</h1>

            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-8">
              {product.description}
            </p>

            {/* Price */}
            <div className="mb-8">
              <span className="text-4xl font-bold premium-gradient">{product.priceFormatted}</span>
              <div className="flex items-center gap-2 mt-2">
                {product.stock > 0 ? (
                  <span className="text-sm text-green-600 dark:text-green-400">
                    ✓ 库存充足
                  </span>
                ) : (
                  <span className="text-sm text-red-500">暂时缺货</span>
                )}
              </div>
            </div>

            {/* Purchase button */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handlePurchase}
              disabled={isPurchasing || product.stock <= 0}
              className="premium-button text-lg px-8 py-4 w-full sm:w-auto"
            >
              {isPurchasing ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  处理中...
                </span>
              ) : authCheck ? (
                '立即购买'
              ) : (
                '登录后购买'
              )}
            </button>

            {!authCheck && (
              <p className="text-sm text-slate-400 mt-3">
                已有账号？<Link href="/login" className="text-premium-500 hover:underline">立即登录</Link>
              </p>
            )}

            {/* Features */}
            <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold mb-4">服务保障</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { text: '安全支付', icon: '🔒' },
                  { text: '即时交付', icon: '⚡' },
                  { text: '7天退款保障', icon: '🛡️' },
                  { text: '专业支持', icon: '💬' },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <span>{item.icon}</span>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
