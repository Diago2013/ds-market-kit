# 📦 Vercel 部署指南

从代码到公网的完整流程。

---

## 方式一：一键部署（最快，推荐 🚀）

1. 确保代码已推送到 GitHub

2. 点击下方按钮：

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone)

3. 按提示授权 Vercel 访问 GitHub

4. 配置环境变量（从你的 `.env` 复制）：

```
NEXT_PUBLIC_APP_URL       = https://你的项目名.vercel.app
JWT_SECRET                = 你的随机 64 位十六进制字符串
STRIPE_SECRET_KEY         = sk_live_xxx（或 sk_test_xxx）
STRIPE_WEBHOOK_SECRET     = whsec_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_live_xxx
```

5. 点击 **Deploy**，2 分钟后上线。

---

## 方式二：导入已有仓库

1. 访问 [vercel.com/new](https://vercel.com/new)
2. 选择你的 GitHub 仓库 `Diago2013/ds-market-kit`（或你自己的 fork）
3. 配置环境变量
4. Deploy

---

## 部署后必做事项

### 1. 初始化数据库

部署完成后，Vercel 默认不会自动初始化 SQLite。推荐切换到 PostgreSQL：

```bash
# 1. 修改 prisma/schema.prisma，将 datasource 改为：
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

# 2. 在 Vercel → Storage → Create Database → Postgres

# 3. 运行数据库初始化
npx prisma db push
node prisma/seed.js

# 4. 重新部署
git push origin main
```

或者使用 Vercel 免费 Postgres 方案：
- Vercel Postgres（免费 256MB）
- Supabase（免费 500MB）
- Neon（免费 500MB）

### 2. 设置自定义域名

Vercel → 你的项目 → Settings → Domains → 添加域名。

按提示在你的域名服务商处添加 DNS 记录。

### 3. 配置 Stripe Webhook

更新 Stripe Dashboard 中 Webhook 的 Endpoint URL 为：
```
https://你的域名/api/webhooks/stripe
```

---

## 环境变量清单（生产环境）

| 变量名 | 必填 | 说明 |
|--------|:--:|------|
| `NEXT_PUBLIC_APP_URL` | ✅ | 你的网站 URL |
| `JWT_SECRET` | ✅ | 64 位随机十六进制 |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ✅ | Stripe 公钥 |
| `STRIPE_SECRET_KEY` | ✅ | Stripe 密钥 |
| `STRIPE_WEBHOOK_SECRET` | ✅ | Stripe Webhook 签名 |
| `ALIPAY_APP_ID` | ❌ | 支付宝 AppID |
| `ALIPAY_PRIVATE_KEY` | ❌ | 支付宝私钥 |
| `ALIPAY_PUBLIC_KEY` | ❌ | 支付宝公钥 |
| `WECHAT_APP_ID` | ❌ | 微信 AppID |
| `WECHAT_MCH_ID` | ❌ | 微信商户号 |
| `WECHAT_API_KEY` | ❌ | 微信 API 密钥 |
| `DATABASE_URL` | ✅ | 数据库连接串 |

---

## 自动部署

项目已内置 GitHub Actions 工作流（`.github/workflows/deploy.yml`）：

```
git push → GitHub Actions 触发 → 构建检查 → 部署到 Vercel → 健康检查
```

你只需 `git push`，剩下的全自动。

---

## 常见问题

**Q: 部署后样式乱了？**  
A: 确认 `tailwind.config.ts` 中 `content` 路径正确。

**Q: 数据库连接失败？**  
A: 检查 `DATABASE_URL` 格式是否正确。Vercel Postgres 会自动注入连接串。

**Q: 如何查看日志？**  
A: Vercel Dashboard → 项目 → Logs 或 `vercel logs`。

**Q: 可以部署到其他平台吗？**  
A: 可以。本项目是标准 Next.js 应用，支持 Railway、Netlify、Docker、自建 VPS。
