# 💳 支付配置指南

DS Market Kit 支持三种支付方式。你只需要配置你想用的 — 不需要的留空即可。

---

## Stripe（推荐 — 支持全球信用卡）

### 申请 Stripe 账号

1. 访问 [dashboard.stripe.com/register](https://dashboard.stripe.com/register)
2. 用邮箱注册（支持中国大陆、香港）
3. 完成身份验证（护照/身份证）
4. 在 Dashboard → Developers → API keys 获取密钥

### 获取密钥

```
Publishable key:  pk_live_xxxxxxxx    → NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
Secret key:       sk_live_xxxxxxxx    → STRIPE_SECRET_KEY
```

### 配置 Webhook

1. Dashboard → Developers → Webhooks → Add endpoint
2. Endpoint URL: `https://你的域名/api/webhooks/stripe`
3. Events to send: `checkout.session.completed`, `payment_intent.payment_failed`
4. 创建后获取 Signing secret → `STRIPE_WEBHOOK_SECRET`

### 测试与上线

```bash
# 测试密钥（可无限测试）: pk_test_xxx / sk_test_xxx
# 生产密钥（真钱）:        pk_live_xxx / sk_live_xxx
```

> ⚠️ **部署到 Vercel 时**，密钥填在 Settings → Environment Variables。

---

## 支付宝（中国大陆用户）

### 申请流程

1. 访问 [open.alipay.com](https://open.alipay.com)
2. 注册开发者账号，完成企业/个体户认证
3. 创建应用 → 电脑网站支付 → 签约
4. 生成密钥：用 [支付宝密钥生成器](https://opendocs.alipay.com/common/02kipk)

### 需要的密钥

```
ALIPAY_APP_ID=2021xxxxxxxxxxxx           # 应用 APPID
ALIPAY_PRIVATE_KEY=你的应用私钥           # 从密钥工具生成
ALIPAY_PUBLIC_KEY=支付宝公钥               # 从支付宝后台下载
ALIPAY_NOTIFY_URL=https://你的域名/api/webhooks/alipay
```

> 支付宝 RSA 密钥文件应包含 `-----BEGIN RSA PRIVATE KEY-----` 头尾。

---

## 微信支付（需要营业执照）

### 申请流程

1. 访问 [pay.weixin.qq.com](https://pay.weixin.qq.com)
2. 注册商户号（需营业执照 + 对公账户）
3. 开通 Native 支付产品
4. 设置 APIv3 密钥

### 需要的密钥

```
WECHAT_APP_ID=wx1234567890abcdef     # 已绑定支付的公众号/小程序 AppID
WECHAT_MCH_ID=1234567890             # 商户号
WECHAT_API_KEY=32位密钥              # APIv3 密钥
WECHAT_NOTIFY_URL=https://你的域名/api/webhooks/wechat
```

---

## 支付方式对比

| | Stripe | 支付宝 | 微信支付 |
|---|:---:|:---:|:---:|
| **支持地区** | 全球 135+ 国 | 中国 | 中国 |
| **买家支付方式** | 信用卡/借记卡 | 支付宝扫码/跳转 | 微信扫码 |
| **到账周期** | 7 天 | T+1 | T+1 |
| **手续费** | 2.9% + $0.30 | 0.6% | 0.6% |
| **申请门槛** | 低（护照即可） | 中（需个体户） | 高（需营业执照） |
| **测试模式** | ✅ 自带 | ❌ 需沙箱 | ❌ 需沙箱 |

---

## 常见问题

**Q: 还没申请支付，能先部署看效果吗？**  
A: 可以。不配置支付密钥，网站其他功能（浏览、注册、后台）完全正常。只是点击"购买"会提示支付未配置。

**Q: 我只做国内市场，只用支付宝够吗？**  
A: 够。配置 Stripe 不是强制的。

**Q: Stripe 支持支付宝吗？**  
A: Stripe 支持。海外用户在 Stripe Checkout 可以选择 Alipay。但国内用户直接对接支付宝 API 体验更好。
