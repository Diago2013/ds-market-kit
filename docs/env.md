# 🔧 环境变量完整说明

所有可用环境变量的详细解释。

---

## 基础配置

### NEXT_PUBLIC_APP_URL

网站的公网访问地址。

```bash
# 本地开发
NEXT_PUBLIC_APP_URL=http://localhost:3000

# 生产环境
NEXT_PUBLIC_APP_URL=https://yourshop.vercel.app
```

**用途**：生成支付回调 URL、Stripe Webhook 地址、邮件链接。

---

### JWT_SECRET

JSON Web Token 签名密钥。**上线前务必改成你自己的！**

```bash
# 生成随机密钥
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# 复制输出的 128 位字符串
JWT_SECRET=a1b2c3d4e5f6...
```

**用途**：用户登录态签名和验证。泄露会导致用户可以伪造任意身份。

---

## Stripe 支付

### NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

前端使用的 Stripe 公钥。可以公开。

```bash
# 测试环境
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51xxx

# 生产环境
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51xxx
```

### STRIPE_SECRET_KEY

后端使用的 Stripe 私钥。**绝对不能公开或提交到 Git！**

```bash
STRIPE_SECRET_KEY=sk_live_51xxx
```

### STRIPE_WEBHOOK_SECRET

Stripe 回调签名密钥。用于验证 Webhook 请求来自 Stripe。

```bash
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

**如何获取**：Stripe Dashboard → Developers → Webhooks → 添加 Endpoint → Signing secret。

---

## 支付宝

### ALIPAY_APP_ID

支付宝开放平台应用的 APPID。

```bash
ALIPAY_APP_ID=202100xxxxxxxxxx
```

### ALIPAY_PRIVATE_KEY

你的应用私钥（PEM 格式）。

```bash
ALIPAY_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA...
-----END RSA PRIVATE KEY-----"
```

> 在 `.env` 中写多行值需要用双引号包裹。

### ALIPAY_PUBLIC_KEY

支付宝公钥（从支付宝后台下载）。

```bash
ALIPAY_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8A...
-----END PUBLIC KEY-----"
```

### ALIPAY_NOTIFY_URL

支付回调地址。支付宝支付完成后会向这个地址发送通知。

```bash
ALIPAY_NOTIFY_URL=https://yourshop.com/api/webhooks/alipay
```

---

## 微信支付

### WECHAT_APP_ID

微信支付的 AppID（通常是已绑定支付功能的公众号或小程序）。

```bash
WECHAT_APP_ID=wx1234567890abcdef
```

### WECHAT_MCH_ID

微信支付商户号。

```bash
WECHAT_MCH_ID=1234567890
```

### WECHAT_API_KEY

微信支付 APIv3 密钥（32 位）。

```bash
WECHAT_API_KEY=your32charapikey1234567890ab
```

### WECHAT_NOTIFY_URL

```bash
WECHAT_NOTIFY_URL=https://yourshop.com/api/webhooks/wechat
```

---

## 数据库

### DATABASE_URL

Prisma 数据库连接字符串。

```bash
# SQLite（开发环境，默认）
DATABASE_URL="file:./dev.db"

# PostgreSQL
DATABASE_URL="postgresql://user:pass@host:5432/mydb"
```

> 需要同时修改 `prisma/schema.prisma` 中的 `provider` 字段。

---

## 安全提示

1. **永远不要**将 `.env` 提交到 Git（已在 `.gitignore` 中排除）
2. **务必修改** `JWT_SECRET` 为你自己的随机值
3. **生产环境**使用真实支付密钥（`pk_live_`、`sk_live_`）
4. 在 Vercel 中通过 Settings → Environment Variables 配置
