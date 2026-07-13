import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  name: z.string().min(2, '姓名至少2个字符').max(50, '姓名最多50个字符'),
  password: z.string().min(8, '密码至少8个字符').max(100),
});

export const loginSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(1, '请输入密码'),
});

export const productSchema = z.object({
  name: z.string().min(1, '商品名称不能为空'),
  slug: z.string().min(1, 'Slug 不能为空').regex(/^[a-z0-9-]+$/, 'Slug 只能包含小写字母、数字和连字符'),
  description: z.string().min(1, '商品描述不能为空'),
  price: z.number().int().positive('价格必须大于0'),
  currency: z.string().default('cny'),
  imageUrl: z.string().url('请输入有效的图片 URL').optional().or(z.literal('')),
  category: z.string().min(1, '分类不能为空'),
  stock: z.number().int().min(0, '库存不能为负数').default(0),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ProductInput = z.infer<typeof productSchema>;
