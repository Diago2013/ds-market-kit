'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/products/ProductCard';

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
}

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products?featured=true&limit=3')
      .then((r) => r.json())
      .then((data) => setFeaturedProducts(data.products || []))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="animated-gradient absolute inset-0 opacity-5 dark:opacity-10" />
        <div className="page-container py-20 sm:py-28 lg:py-36">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-premium-50 dark:bg-premium-900/20 text-premium-600 dark:text-premium-400 text-sm font-medium mb-6 animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-premium-500 animate-pulse" />
              全新上线，限时优惠中
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-balance mb-6 animate-slide-up">
              打造你的{' '}
              <span className="premium-gradient">数字事业</span>
              <br />
              从 PremiumMarket 开始
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 text-balance animate-slide-up" style={{ animationDelay: '0.1s' }}>
              高品质数字产品、订阅服务和专业工具，一站式赋能个人创作者和企业高效成长。
              安全支付、即时交付、专业支持。
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Link href="/products" className="premium-button text-lg px-8 py-4">
                浏览全部商品
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link href="/register" className="premium-button-secondary text-lg px-8 py-4">
                免费注册
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-1/4 left-10 w-72 h-72 bg-premium-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-10 w-72 h-72 bg-accent-500/10 rounded-full blur-3xl" />
      </section>

      {/* Trust Metrics */}
      <section className="border-y border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
        <div className="page-container py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: '5,000+', label: '活跃用户' },
              { number: '99.9%', label: '服务可用率' },
              { number: '10,000+', label: '订单完成' },
              { number: '7×24', label: '技术支持' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold premium-gradient mb-1">{stat.number}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="page-container py-20">
        <div className="text-center mb-12">
          <h2 className="section-title mb-4">精选产品</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            从订阅方案到专业工具，找到适合你的解决方案
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="premium-card p-6 animate-pulse">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-4" />
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full mb-2" />
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3 mb-6" />
                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <div className="text-center mt-10">
          <Link href="/products" className="premium-button-secondary">
            查看全部商品 &rarr;
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white dark:bg-slate-800/50 border-y border-slate-200 dark:border-slate-700">
        <div className="page-container py-20">
          <div className="text-center mb-12">
            <h2 className="section-title mb-4">为什么选择我们</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              安全、高效、可靠的数字服务平台
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                ),
                title: '安全支付',
                desc: '采用 Stripe 国际标准支付流程，256 位 SSL 加密，保障每一笔交易安全。',
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
                title: '即时交付',
                desc: '支付完成后自动处理，数字产品即时可用，无需等待。',
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ),
                title: '专业支持',
                desc: '7×24 小时技术支持，资深工程师团队随时为你解决技术难题。',
              },
            ].map((feature) => (
              <div key={feature.title} className="premium-card p-8 text-center magnetic-hover">
                <div className="w-12 h-12 rounded-xl bg-premium-50 dark:bg-premium-900/20 text-premium-600 dark:text-premium-400 flex items-center justify-center mx-auto mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="page-container py-20">
        <div className="premium-card p-12 text-center relative overflow-hidden">
          <div className="animated-gradient absolute inset-0 opacity-5" />
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">准备好开始了吗？</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-lg mx-auto mb-8">
              注册即享免费体验，无需绑定信用卡。
            </p>
            <Link href="/register" className="premium-button text-lg px-10 py-4">
              立即免费注册
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
