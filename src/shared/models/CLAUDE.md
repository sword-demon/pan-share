[根目录](../../) > **shared/models**

## 模块职责

数据模型层 (Data Access Layer)

封装所有数据库表的 CRUD 操作，遵循：
- 每个表对应一个模型文件
- 导出类型定义 (Type, NewType, UpdateType)
- 导出标准 CRUD 函数

## 模型列表

| 文件 | 表名 | 职责 |
|------|------|------|
| `ai_task.ts` | ai_task | AI 任务记录 |
| `apikey.ts` | apikey | API 密钥 |
| `chat.ts` | chat | 对话会话 |
| `chat_message.ts` | chat_message | 对话消息 |
| `config.ts` | config | 系统配置 |
| `credit.ts` | credit | 积分交易 |
| `order.ts` | order | 订单记录 |
| `subscription.ts` | subscription | 订阅记录 |
| `taxonomy.ts` | taxonomy | 分类标签 |
| `user.ts` | user | 用户信息 |
| `pan_share.ts` | pan_share | 网盘分享 |

## 通用模式

### 类型导出

```typescript
export type PanShare = typeof panShare.$inferSelect;
export type NewPanShare = typeof panShare.$inferInsert;
export type UpdatePanShare = Partial<Omit<NewPanShare, 'id' | 'createdAt'>>;
```

### 状态枚举

```typescript
export enum PanShareStatus {
  PENDING = 'pending',
  PUBLISHED = 'published',
  REJECTED = 'rejected',
  ARCHIVED = 'archived',
}
```

### 通用查询函数

- `getXxxs(params)` - 分页列表
- `getXxxsCount(params)` - 数量统计
- `findXxxById(id)` - 按 ID 查询
- `addXxx(data)` - 创建
- `updateXxx(id, data)` - 更新
- `deleteXxx(id)` - 软删除

## 依赖

- `drizzle-orm` - ORM 框架
- `@/core/db` - 数据库实例
- `@/config/db/schema` - Schema 定义

## 变更记录

- **2026-02-04**: 模块文档创建
