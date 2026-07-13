import { Metadata } from 'next';
import ProductsPageClient from './ProductsPageClient';

export const metadata: Metadata = {
  title: '全部商品',
  description: '浏览 PremiumMarket 全部数字产品和订阅服务，找到最适合你的解决方案。',
};

export default function ProductsPage() {
  return <ProductsPageClient />;
}
