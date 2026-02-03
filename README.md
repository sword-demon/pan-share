# panShare

一个专注于网盘资源信息分享的平台。发现、分享和管理来自各大主流网盘平台的资源链接。

## 功能特点

- **多网盘支持** - 支持百度网盘、阿里云盘、夸克网盘、迅雷网盘、115网盘等主流平台
- **便捷分享** - 一键提交分享链接和提取码
- **智能搜索** - 通过关键词快速搜索需要的资源
- **分类筛选** - 按网盘类型筛选，精准定位目标资源
- **一键复制** - 登录后可一键复制分享链接和提取码
- **审核机制** - 用户提交的分享需经管理员审核后展示

## 用户角色

| 角色 | 权限 |
|------|------|
| 访客 | 浏览资源、搜索筛选 |
| 注册用户 | 复制分享信息、提交新分享 |
| 管理员 | 管理所有分享、审核用户提交 |

## 技术栈

- **框架**: Next.js 15 (App Router)
- **数据库**: PostgreSQL / MySQL / SQLite (Drizzle ORM)
- **样式**: Tailwind CSS + shadcn/ui
- **认证**: NextAuth.js
- **国际化**: next-intl

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

复制环境变量示例文件并填写配置：

```bash
cp .env.example .env.development
```

### 3. 初始化数据库

```bash
pnpm db:push
```

### 4. 启动开发服务器

```bash
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 项目结构

```
src/
├── app/                    # Next.js App Router
│   ├── [locale]/          # 国际化路由
│   │   ├── (admin)/       # 管理后台
│   │   └── (landing)/     # 前台页面
│   └── api/               # API 路由
├── config/                # 配置文件
│   ├── db/               # 数据库 schema
│   └── locale/           # 国际化配置
├── core/                  # 核心模块
│   ├── db/               # 数据库连接
│   └── rbac/             # 权限控制
└── shared/               # 共享模块
    ├── blocks/           # 业务组件
    ├── components/       # UI 组件
    ├── models/           # 数据模型
    └── types/            # 类型定义
```

## 主要页面

| 页面 | 路径 | 说明 |
|------|------|------|
| 首页 | `/` | 浏览网盘分享列表 |
| 提交分享 | `/submit` | 用户提交新的分享 |
| 分享管理 | `/admin/pan-shares` | 管理员管理分享 |

## License

[LICENSE](./LICENSE)
