# pan-share Constitution

## Core Principles

### I. TypeScript Strict Mode

- 所有代码必须使用 TypeScript 并启用 strict 模式
- 代码类型必须明确，不允许使用 any 类型
- 明确的类型定义优于类型断言
- Server Actions 和 API 接口必须有完整的类型定义

**Rationale**: TypeScript 的类型安全是代码质量的基础，强制 strict 模式可以在编译时捕获大部分潜在错误，减少运行时异常。

### II. Component-Based Architecture

- 使用 React 组件进行 UI 复用，遵循单一职责原则
- 组件应具有清晰的 props 接口和类型定义
- 优先使用 Server Components，减少不必要的客户端 hydration
- UI 样式遵循 Tailwind CSS 规范，保持一致性
- 使用 Shadcn UI 组件库时，需遵循其设计模式和定制方式

**Rationale**: 清晰的组件架构提高代码可维护性和可测试性，Server Components 优化首屏加载性能。

### III. Test-Driven Development

- 核心业务逻辑必须先编写测试，再进行实现
- 单元测试覆盖率不低于 80%
- 关键用户流程需要 E2E 测试覆盖
- 所有测试通过后才能提交代码

**Rationale**: 测试驱动开发确保代码质量和功能正确性，同时为重构提供安全网。测试即文档，帮助理解代码行为。

### IV. Database Schema Design

- 使用 Drizzle ORM 定义数据库 schema
- Schema 变更必须创建 migration 文件
- 所有数据库操作必须有类型安全的接口
- 遵循 Drizzle 的最佳实践，避免 N+1 查询问题

**Rationale**: Drizzle 提供了类型安全的数据库操作，migration 文件确保 schema 变更可追溯和可回滚。

### V. Performance-First Rendering

- 优先使用 React Server Components
- 客户端组件仅在需要交互时使用
- 数据获取遵循 Next.js 的数据获取模式
- 合理使用 caching 和 revalidation 策略

**Rationale**: 性能是用户体验的核心，Server Components 减少客户端 JavaScript 体积，提升首屏加载速度。

## Additional Constraints

### 技术栈规范

- **框架**: Next.js 16 App Router
- **样式**: Tailwind CSS
- **组件库**: Shadcn UI（可定制化）
- **数据库**: Drizzle ORM + PostgreSQL/MySQL
- **代码质量**: ESLint + Prettier
- **TypeScript**: strict 模式

### 目录结构

- 遵循 Next.js App Router 约定，使用 app/ 目录
- 组件统一放置在 components/ 目录
- Drizzle schema 放置在 db/ 目录
- API 路由使用 Route Handlers

### 依赖管理

- 优先使用 shadcn/ui 和 Drizzle 官方包
- 引入新依赖需说明必要性
- 避免功能重叠的依赖

### 代码规范

- ESLint 检查不通过禁止提交
- Prettier 格式化必须通过
- 遵循项目现有代码风格

## Development Workflow

### 项目初始化流程

1. 初始化 Next.js 项目，安装 ESLint、Prettier、Tailwind CSS
2. 配置 TypeScript strict 模式
3. 集成 Shadcn UI 组件库
4. 配置 Drizzle ORM 和数据库连接
5. 设置环境变量和类型定义
6. 配置 lint-staged 或 husky 提交前检查

### 开发流程

1. 从主分支创建功能分支
2. 编写功能测试（红）
3. 实现功能代码（绿）
4. 重构优化
5. 提交代码（需通过所有检查）
6. 创建 Pull Request
7. 代码审查通过后合并

### 提交规范

- 提交信息遵循 Conventional Commits 格式
- 每次提交应包含完整、可工作的代码
- 避免大块提交，小步提交更易于追踪和回滚
- 所有测试必须通过后才能提交

### 文档要求

- README.md 保持更新
- 复杂逻辑需要代码注释
- API 接口需要文档说明

## Governance

### 原则优先级

1. 类型安全优先
2. 测试覆盖率保证
3. 性能优化意识
4. 代码一致性

### 宪法修订

- 修订提案需说明原因和预期收益
- 重大变更需要团队讨论通过
- 版本号遵循语义化版本规范

### 合规检查

- 所有 PR 必须通过 ESLint 检查
- 所有 PR 必须通过测试
- 遵循本宪法原则的开发实践

**Version**: 1.0.0 | **Ratified**: 2026-02-03 | **Last Amended**: 2026-02-03
