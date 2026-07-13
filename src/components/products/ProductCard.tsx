'use client';

import Link from 'next/link';

interface ProductCardProps {
  product: {
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
  };
}

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    '订阅': 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    '插件': 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
    '服务': 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
    '资源': 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
  };
  return colors[category] || 'bg-slate-50 text-slate-600 dark:bg-slate-700 dark:text-slate-400';
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/products/${product.slug}`} className="block group">
      <div className="premium-card p-6 h-full flex flex-col magnetic-hover">
        {/* Category badge */}
        <div className="flex items-center justify-between mb-4">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getCategoryColor(product.category)}`}>
            {product.category}
          </span>
          {product.featured && (
            <span className="text-xs font-medium text-premium-600 dark:text-premium-400">
              ★ 精选
            </span>
          )}
        </div>

        {/* Product image placeholder */}
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-40 object-cover rounded-xl mb-4"
          />
        ) : (
          <div className="w-full h-40 rounded-xl bg-gradient-to-br from-premium-100 to-accent-100 dark:from-premium-900/30 dark:to-accent-900/30 flex items-center justify-center mb-4">
            <svg className="w-12 h-12 text-premium-300 dark:text-premium-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        )}

        {/* Content */}
        <h3 className="text-lg font-semibold mb-2 group-hover:text-premium-600 dark:group-hover:text-premium-400 transition-colors">
          {product.name}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 flex-1">
          {product.description}
        </p>

        {/* Price */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
          <span className="text-2xl font-bold premium-gradient">
            {product.priceFormatted}
          </span>
          <span className="text-sm text-slate-400 group-hover:text-premium-500 transition-colors">
            了解详情 →
          </span>
        </div>
      </div>
    </Link>
  );
}
