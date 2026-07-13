# 🚀 DS Market Kit — 数字产品商店启动套件

> 一套代码，三条收入管道。上线即盈利的 Next.js 全栈电商模板。

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyour-org%2Fds-market-kit)

---

## ✨ 你买到的是一套完整的数字产品商店

不需要从零搭建认证、支付、订单管理、管理后台。

**克隆 → 改配置 → 部署 → 开始卖。** 三天内上线你自己的数字产品商店。

### 内置五大核心系统

| 系统 | 功能 |
|------|------|
| 🔐 **用户系统** | 注册、登录、JWT 鉴权、角色管理（用户/管理员）|
| 💰 **支付系统** | Stripe（国际信用卡）+ 支付宝（大陆）+ 微信支付，Webhook 自动同步 |
| 📦 **商品系统** | 无限商品、分类筛选、SEO 元数据、库存管理 |
| 📋 **订单系统** | 自动状态流转、订单详情、管理后台审核 |
| 📊 **数据面板** | 收入趋势图、订单分布饼图、热销商品排名 |

### 你只需要做三件事

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│ 改 .env   │ ──▶ │ 上架商品  │ ──▶ │ 部署上线  │
│ 填密钥    │     │ 改种子数据 │     │ Vercel   │
└──────────┘     └──────────┘     └──────────┘
```

---

## 🎯 这套模板最适合谁？

- **独立开发者** — 想卖自己的 SaaS 工具、代码模板、API 服务
- **内容创作者** — 卖付费教程、模板包、数字资产
- **设计师** — 卖 UI 套件、图标包、品牌素材
- **任何有数字产品的人** — 需要自动收钱 + 自动发货 + 无需客服

---

## 🛠 技术栈

| 层级 | 技术 |
|------|------|
| **框架** | Next.js 14 (App Router) |
| **语言** | TypeScript |
| **样式** | Tailwind CSS |
| **数据库** | SQLite (dev) / PostgreSQL (prod) |
| **ORM** | Prisma |
| **支付** | Stripe + 支付宝 + 微信支付 |
| **认证** | JWT + bcryptjs |
| **图表** | Canvas API (零依赖) |
| **部署** | Vercel (自动 HTTPS) |

---

## ⚡ 3 分钟快速开始

```bash
# 1. 克隆项目
git clone https://github.com/Diago2013/ds-market-kit.git
cd ds-market-kit

# 2. 一键安装 + 初始化数据库
npm run setup

# 3. 启动开发服务器
npm run dev

# 4. 打开浏览器
open http://localhost:3000
```

### 预设账号

| 角色 | 邮箱 | 密码 |
|------|------|------|
| 管理员 | admin@example.com | admin123 |
| 注册新用户 | 在 /register 页面注册即可 |

---

## 📚 完整文档

| 文档 | 内容 |
|------|------|
| [快速开始](docs/quickstart.md) | 从零到上线的完整步骤 |
| [环境变量说明](docs/env.md) | 每个配置项的详细说明 |
| [支付配置](docs/payments.md) | Stripe / 支付宝 / 微信的申请与接入 |
| [品牌定制](docs/customization.md) | 换 Logo、改颜色、改文案 |
| [Vercel 部署](docs/deploy.md) | 一键部署到公网 |
| [API 参考](docs/api.md) | 全部 API 端点说明 |

---

## 📊 项目结构

```
ds-market-kit/
├── prisma/
│   ├── schema.prisma      # 数据库模型
│   └── seed.js            # 初始数据（替换成你的商品）
├── src/
│   ├── app/
│   │   ├── (site)/        # 前台页面（首页、商品列表、商品详情）
│   │   ├── (auth)/        # 登录/注册
│   │   ├── (dashboard)/   # 用户面板 + 管理后台
│   │   └── api/           # 12 个 RESTful API 端点
│   ├── components/        # 可复用 UI 组件
│   └── lib/               # 工具库（auth, payments, crypto）
├── scripts/               # 运维脚本（健康检查、监控）
├── .github/workflows/     # CI/CD 自动部署
├── docs/                  # 详细文档
└── vercel.json            # Vercel 部署配置
```

---

## 🛡️ 安全特性

- JWT 令牌 + bcrypt（12 轮）密码加密
- AES-256 敏感数据加密
- CSP / X-Frame-Options / X-XSS-Protection 安全头
- Stripe Webhook 签名验证
- Zod 输入验证防注入
- 速率限制中间件（100 请求/分钟/IP）

---

## 🚀 上线后流量估算下的表现

| 指标 | 免费版 Vercel | Pro 版 ($20/月) |
|------|:------------:|:--------------:|
| 月访问量 | 10 万 | 200 万+ |
| 并发支付 | 稳定 | 稳定 |
| 页面速度 | < 1.5s | < 0.8s |
| 自动扩容 | ✅ | ✅ |

---

## ❓ 常见问题

**Q: 需要会写代码吗？**  
A: 部署只需改环境变量。上架商品需改 `prisma/seed.js`，极其简单。深度定制需要 React/Next.js 基础。

**Q: 支持支付宝和微信的哪些模式？**  
A: 支付宝→电脑网站支付，微信→Native 扫码支付。详见 [支付配置文档](docs/payments.md)。

**Q: SQLite 够用吗？**  
A: 开发和小流量完全够。日订单 > 100 建议切换到 PostgreSQL（改一行配置即可）。

**Q: 可以去掉我不需要的支付方式吗？**  
A: 不配置对应的环境变量就不会加载，不影响其他功能。

---

## 📄 License

购买后获得**个人/商业使用授权**。可用于你自己的项目、客户项目。不可转售源码。

---

**Made with ❤️ by DS Market Kit Team**
