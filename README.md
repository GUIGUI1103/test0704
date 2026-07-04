# 心灵测评 - Mind Quiz

一个极简风格的心理测评网站，支持移动端答题，包含用户端和管理后台。

## 功能

### 用户端
- 🏠 开屏页：展示可用测评
- 📝 答题页：进度条 + 题目 + 选项高亮 + 上下题切换
- 📊 结果页：测评结果 + 结果解释

### 管理端
- 🔐 账号密码登录（默认 admin / admin123）
- 📋 问卷增删查改
- 🔗 生成一次性分享链接（用户访问后自动失效）

## 技术栈

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **localStorage** (MVP数据存储)

## 本地开发

```bash
npm install
npm run dev
```

访问 http://localhost:3000

## 部署

### Vercel 部署

1. 将代码推送到 GitHub
2. 在 [Vercel](https://vercel.com) 导入项目
3. 点击 Deploy 即可

### 阿里云部署

```bash
# 构建 Docker 镜像
docker build -t mind-quiz .

# 运行
docker run -d -p 3000:3000 --name mind-quiz mind-quiz

# 或使用 docker-compose
docker-compose up -d
```

## 页面路由

| 路由 | 说明 |
|------|------|
| `/` | 用户端首页（开屏） |
| `/quiz/[id]` | 答题页面 |
| `/result` | 测评结果 |
| `/share?token=xxx` | 分享链接入口 |
| `/admin` | 管理端登录 |
| `/admin/dashboard` | 管理端仪表盘 |

## 注意事项

> ⚠️ MVP版本使用 localStorage 存储数据，仅适合小规模使用。如需生产环境使用，建议接入数据库（如 PostgreSQL + Prisma）并使用服务端 Session 替代 localStorage 认证。
