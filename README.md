# Travel Note Server

## 项目简介

Travel Note Server 是一个旅游游记分享应用的后端服务，基于 NestJS 框架开发，提供了完整的用户认证、游记管理和审核系统。

## 技术栈

- NestJS
- Prisma ORM
- TypeScript
- JWT 认证
- bcrypt 密码加密

## 已实现功能

### 1. 用户认证系统
- 用户注册
- 用户登录
- 用户登出
- 三种用户角色：USER, REVIEWER, ADMIN
- JWT 认证机制

### 2. 游记管理
- 创建游记
- 更新游记
- 删除游记
- 游记状态管理（PENDING, APPROVED, REJECTED）
- 游记列表查询
- 支持日期范围和关键词搜索
- 媒体文件（图片/视频）上传

### 3. 审核系统
- 审核员和管理员可审核游记
- 批准或拒绝游记
- 添加拒绝原因

### 4. 安全特性
- JWT 认证
- 密码 bcrypt 加密
- 请求限流
- 数据验证拦截器
- 角色权限控制

## 待完成功能

- [ ] 微信分享功能
- [ ] 性能优化
- [ ] 更详细的用户统计和分析

## 运行环境要求

- Node.js 18+
- pnpm

## 本地开发

### 1. 克隆项目

```bash
git clone https://github.com/your-username/travel-note-server.git
cd travel-note-server
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 配置环境变量

复制 `.env.example` 到 `.env` 并配置相关参数

### 4. 数据库迁移

```bash
pnpm prisma migrate dev
```

### 5. 启动开发服务器

```bash
pnpm run start:dev
```

## 测试

### 运行单元测试

```bash
pnpm run test
```

### 运行测试覆盖率

```bash
pnpm run test:cov
```

## 部署

### 生产构建

```bash
pnpm run build
pnpm run start:prod
```

## 贡献指南

1. Fork 仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交代码 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 联系方式

项目负责人 - [MinerNobo]
项目链接: [https://github.com/MinerNobo/travel-note-server]
