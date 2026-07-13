# 📡 API 参考

所有 RESTful API 端点完整说明。

---

## 认证端点

### POST /api/auth/register

注册新用户。

```
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "用户名"
}
```

响应 `201`：
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": "...", "email": "user@example.com", "name": "用户名" }
}
```

---

### POST /api/auth/login

用户登录。

```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

响应 `200`：
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": "...", "email": "user@example.com", "name": "用户名" }
}
```

---

### GET /api/auth/me

获取当前登录用户信息。

```
GET /api/auth/me
Authorization: Bearer <token>
```

响应 `200`：
```json
{
  "user": { "id": "...", "email": "user@example.com", "name": "用户名", "role": "USER" }
}
```

---

### DELETE /api/auth/me

退出登录（使令牌失效）。

```
DELETE /api/auth/me
Authorization: Bearer <token>
```

响应 `200`：`{}`

---

## 商品端点

### GET /api/products

获取商品列表。支持分页和分类筛选。

```
GET /api/products?page=1&limit=12&category=software
```

响应 `200`：
```json
{
  "products": [
    {
      "id": "...",
      "name": "商品名称",
      "slug": "product-slug",
      "description": "商品描述",
      "price": 4999,
      "currency": "cny",
      "category": "software",
      "imageUrl": "https://...",
      "isPublished": true,
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "total": 42,
  "page": 1,
  "limit": 12
}
```

---

### GET /api/products/:slug

获取单个商品详情。

```
GET /api/products/product-slug
```

响应 `200`：商品对象（同上）。

---

## 支付端点

### POST /api/checkout

创建 Stripe Checkout 会话。需要认证。

```
POST /api/checkout
Authorization: Bearer <token>
Content-Type: application/json

{
  "productSlug": "product-slug"
}
```

响应 `200`：
```json
{
  "url": "https://checkout.stripe.com/c/pay/cs_test_xxx"
}
```

前端拿到 `url` 后跳转即可。

---

### POST /api/checkout/alipay

创建支付宝支付订单。

```
POST /api/checkout/alipay
Authorization: Bearer <token>
Content-Type: application/json

{
  "productSlug": "product-slug"
}
```

响应 `200`：
```json
{
  "payUrl": "https://openapi.alipay.com/gateway.do?..." 
}
```

---

### POST /api/checkout/wechat

创建微信支付 Native 订单（返回扫码链接）。

```
POST /api/checkout/wechat
Authorization: Bearer <token>
Content-Type: application/json

{
  "productSlug": "product-slug"
}
```

响应 `200`：
```json
{
  "codeUrl": "weixin://wxpay/bizpayurl?pr=xxx"
}
```

前端用此 URL 生成二维码。

---

## 订单端点

### GET /api/orders

获取当前用户的订单列表。需要认证。

```
GET /api/orders?page=1&limit=10
Authorization: Bearer <token>
```

响应 `200`：
```json
{
  "orders": [
    {
      "id": "...",
      "userId": "...",
      "product": { "name": "...", "price": 4999 },
      "status": "PAID",
      "amount": 4999,
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "total": 15,
  "page": 1,
  "limit": 10
}
```

---

### GET /api/orders/summary

获取用户订单统计概览。

```
GET /api/orders/summary
Authorization: Bearer <token>
```

响应 `200`：
```json
{
  "totalOrders": 15,
  "totalSpent": 74985,
  "pendingOrders": 1,
  "paidOrders": 14
}
```

---

## 管理端点（需要 ADMIN 角色）

### GET /api/admin/stats

获取管理统计数据。

```
GET /api/admin/stats
Authorization: Bearer <token>  (需要 ADMIN 角色)
```

响应 `200`：
```json
{
  "totalRevenue": 1499800,
  "totalOrders": 423,
  "totalUsers": 156,
  "topProducts": [
    { "name": "热销商品", "sales": 89, "revenue": 444110 }
  ],
  "recentOrders": [ ... ],
  "dailyRevenue": [
    { "date": "2025-01-01", "revenue": 50000, "orders": 12 }
  ]
}
```

---

### GET /api/admin/orders

获取所有订单（管理视图）。

```
GET /api/admin/orders?page=1&limit=20
Authorization: Bearer <token>  (需要 ADMIN 角色)
```

---

### PATCH /api/admin/orders

更新订单状态。

```
PATCH /api/admin/orders
Authorization: Bearer <token>  (需要 ADMIN 角色)
Content-Type: application/json

{
  "orderId": "...",
  "status": "COMPLETED"
}
```

可用的状态值：`PENDING` | `PAID` | `COMPLETED` | `CANCELLED` | `REFUNDED`

---

### GET /api/admin/products

获取所有商品（管理视图）。

```
GET /api/admin/products
Authorization: Bearer <token>  (需要 ADMIN 角色)
```

---

### POST /api/admin/products

创建新商品。

```
POST /api/admin/products
Authorization: Bearer <token>  (需要 ADMIN 角色)
Content-Type: application/json

{
  "name": "新商品",
  "slug": "new-product",
  "description": "商品描述...",
  "price": 2999,
  "currency": "cny",
  "category": "software",
  "imageUrl": "https://...",
  "stock": 9999
}
```

---

## 健康检查

### GET /api/health

系统健康状态检查。

```
GET /api/health
```

响应 `200`：
```json
{
  "status": "healthy",
  "uptime": 86400,
  "timestamp": "2025-01-02T00:00:00.000Z",
  "checks": {
    "database": true,
    "memory": { "used": 128, "total": 512, "unit": "MB" }
  }
}
```

---

## 分析端点

### POST /api/analytics

记录用户行为事件。

```
POST /api/analytics
Content-Type: application/json

{
  "event": "page_view",
  "page": "/products/product-slug",
  "referrer": "https://google.com"
}
```

### GET /api/analytics

获取分析统计数据。需要 ADMIN 角色。

---

## 通用说明

### 错误响应格式

```json
{
  "error": "错误描述"
}
```

### HTTP 状态码

| 状态码 | 含义 |
|:-----:|------|
| 200 | 成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未认证 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 429 | 请求频率超限 |
| 500 | 服务器错误 |

### 请求频率限制

所有端点：100 次/分钟/IP。超限返回 429。
