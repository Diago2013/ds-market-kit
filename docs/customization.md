# 🎨 品牌定制指南

想让商店看起来像是你自己从头做的？按这份指南操作，20 分钟完成全站品牌定制。

---

## 一、替换品牌标识

### 1. 改网站标题和描述

编辑 `src/app/layout.tsx`：

```tsx
export const metadata: Metadata = {
  title: {
    default: '你的品牌名',                    // ← 改这里
    template: '%s | 你的品牌名',              // ← 改这里
  },
  description: '你的网站描述文案...',         // ← 改这里
};
```

### 2. 换 Logo

编辑 `src/components/layout/Navbar.tsx`，找到 Logo 文字：

```tsx
<span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 
  bg-clip-text text-transparent">
  你的品牌                    // ← 改这里
</span>
```

---

## 二、改配色方案

编辑 `tailwind.config.ts`，替换主题色：

```ts
theme: {
  extend: {
    colors: {
      primary: {
        50: '#f0f9ff',   // 最浅
        500: '#3b82f6',  // 主色
        900: '#1e3a5f',  // 最深
      },
    },
  },
},
```

然后全局搜索替换 `indigo-` 为 `primary-`：
- `src/app/globals.css`
- `src/components/layout/Navbar.tsx`
- `src/app/page.tsx`

---

## 三、修改首页内容

### Hero 区域

编辑 `src/app/page.tsx`，找到 Hero section：

```tsx
<h1>你的主标题</h1>              // ← 改这里
<p>你的副标题/价值主张</p>        // ← 改这里
```

### 特性展示

```tsx
const features = [
  { title: '特性 1', desc: '...' },   // ← 替换成你的卖点
  { title: '特性 2', desc: '...' },
  { title: '特性 3', desc: '...' },
];
```

---

## 四、修改页脚

编辑 `src/components/layout/Footer.tsx`：

```tsx
<p>你的公司名 / 品牌名</p>        // ← 改这里
```

---

## 五、修改默认 SEO 图片

在 `public/` 目录下放一张 `og-image.jpg`（1200×630px），作为社交媒体分享时的预览图。

---

## 六、修改数据库种子数据

编辑 `prisma/seed.js`，替换管理员账号和示例商品为你自己的。

---

## 七、部署新品牌

```bash
git add .
git commit -m "chore: 完成品牌定制"
git push origin main
```

Vercel 检测到新提交会自动重新部署。

---

## 进阶定制

| 你想改的 | 改哪个文件 |
|---------|-----------|
| 网站 Favicon | 替换 `public/favicon.ico` |
| 登录/注册页文案 | `src/app/(auth)/login/page.tsx` |
| 仪表盘侧边栏 | `src/app/(dashboard)/dashboard/layout.tsx` |
| 管理后台文案 | `src/app/(dashboard)/dashboard/admin/page.tsx` |
| 新增自定义页面 | 在 `src/app/(site)/` 下创建新目录 |
| 添加 ChatGPT 客服 | 在 `src/components/` 下新建组件 |
