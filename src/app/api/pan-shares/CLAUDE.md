[根目录](../../../) > [pan-shares](../) > **api**

## 模块职责

网盘分享 API 路由层

提供公开和受保护的 REST API 端点：
- `GET /api/pan-shares` - 获取已发布分享列表
- `POST /api/pan-shares` - 提交新分享 (需登录)

## 入口文件

`/Volumes/MOVESPEED/ai-coding/pan-share/src/app/api/pan-shares/route.ts`

## API 接口

### GET /api/pan-shares

公开接口，返回已审核通过的分享列表。

**查询参数**:
- `page` - 页码 (默认 1)
- `limit` - 每页数量 (默认 20)
- `search` - 搜索关键词
- `diskType` - 网盘类型筛选

**响应**:
```json
{
  "shares": [...],
  "total": 100,
  "page": 1,
  "limit": 20,
  "totalPages": 5
}
```

### POST /api/pan-shares

受保护接口，提交新的网盘分享。

**请求体**:
```json
{
  "title": "分享标题",
  "description": "描述",
  "coverImage": "封面图URL",
  "diskType": "baidu",
  "shareUrl": "链接",
  "shareCode": "提取码",
  "expiredAt": "2026-12-31"
}
```

**响应**:
```json
{
  "id": "uuid",
  "message": "Pan share submitted successfully. Waiting for review."
}
```

## 依赖模块

- `@/shared/models/pan_share` - 数据模型
- `@/shared/lib/resp` - 统一响应
- `@/shared/models/user` - 用户认证

## 变更记录

- **2026-02-04**: API 路由文档创建
