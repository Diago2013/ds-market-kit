# 🚀 快速开始指南

从零到公网可访问的数字产品商店，只需 6 步。

---

## 前提条件

- [Node.js](https://nodejs.org) 18+ 已安装
- [Git](https://git-scm.com) 已安装
- 一个 [GitHub](https://github.com) 账号
- 一个 [Vercel](https://vercel.com) 账号（用 GitHub 登录即可）

---

## Step 1: 克隆项目

```bash
git clone https://github.com/Diago2013/ds-market-kit.git my-store
cd my-store
```

---

## Step 2: 一键初始化

```bash
npm run setup
```

这一步会自动：
- 安装所有依赖包
- 生成 Prisma 数据库客户端
- 创建 SQLite 数据库
- 写入种子数据（管理员账号 + 示例商品）

---

## Step 3: 本地预览

```bash
npm run dev
```

打开 http://localhost:3000 查看你的商店。

### 试试这些页面：

| 页面 | 地址 |
|------|------|
| 首页 | http://localhost:3000 |
| 商品列表 | http://localhost:3000/products |
| 商品详情 | http://localhost:3000/products/starter-template |
| 登录 | http://localhost:3000/login |
| 管理后台 | http://localhost:3000/dashboard/admin |
| 用户订单 | http://localhost:3000/dashboard/orders |

---

## Step 4: 上架你的商品

编辑 `prisma/seed.js`，替换示例商品为你自己的：

```js
await prisma.product.create({
  data: {
    name: '你的产品名称',
    slug: 'your-product-slug',          // URL 友好名称
    description: '产品描述文案...',
    price: 4999,                        // ¥49.99（单位：分）
    currency: 'cny',                    // 'cny' 或 'usd'
    category: 'software',              // 自定义分类
    imageUrl: 'https://你的图片地址.jpg',
    stock: 9999,                        // 数字产品设大一点
    isPublished: true,
  },
});
```

然后重新导入数据：

```bash
npx prisma db push --force-reset && node prisma/seed.js
```

---

## Step 5: 配置支付

### 如果你只想测试（无需真实密钥）

Stripe 测试模式**开箱即用**。直接跳到 Step 6，在 Vercel 上部署即可。

### 如果你想收真钱

参考以下文档：
- [Stripe 配置](payments.md#stripe)
- [支付宝配置](payments.md#支付宝)
- [微信支付配置](payments.md#微信支付)

拿到密钥后，创建 `.env` 文件（从 `.env.example` 复制），填入真实值。

---

## Step 6: 部署上线

### 一键部署（推荐）

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone)

1. 点击上方按钮
2. 授权 Vercel 访问你的 GitHub
3. 在 Environment Variables 里填入你的密钥
4. 点击 Deploy — 2 分钟后你的网站就上线了 ✅

Vercel 自动提供 `https://你的项目名.vercel.app` 域名和 HTTPS 证书。

### 绑定自定义域名

1. 在 Vercel 项目设置 → Domains
2. 添加你自己的域名
3. 按提示修改 DNS 记录
4. 自动签发 SSL 证书

---

## 🎉 恭喜！你的数字商店已上线

现在你可以：
- 在管理后台 `/dashboard/admin` 查看订单和收入
- 继续上架更多商品
- 修改品牌配色和文案（见 [品牌定制指南](customization.md)）
- 配置 CI/CD 自动部署（见 GitHub Actions 工作流 `.github/workflows/deploy.yml`）
