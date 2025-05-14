# Travel Note Server

## 项目简介

本项目是一个旅游游记分享应用的后端服务，基于 NestJS 框架开发，提供了完整的用户认证、游记管理和审核系统。

## 访问

https://hh.zvluz.cn
https://moruka.top (备案暂未通过，可能存在访问问题)

接口：域名/api
静态文件：域名/{file_path}

## 技术栈

- NestJS
- Prisma ORM
- TypeScript
- bcryptjs密码加密
- pm2部署

## 已实现功能

### 1. 用户认证系统
- 用户注册
- 用户登录
- 用户登出
- JWT认证机制
- 三种用户角色：USER, REVIEWER, ADMIN

### 2. 游记管理
- 创建游记
- 更新游记
- 删除游记（物理删除）
- 游记状态管理（PENDING, APPROVED, REJECTED）
- 游记列表查询
- 支持日期范围和关键词搜索
- 媒体文件（图片/视频）上传
- 用户对游记的浏览，点赞，收藏功能

### 3. 审核系统
- 审核员和管理员可审核游记
- 批准或拒绝游记
- 管理员可删除游记（逻辑删除）

### 4. 文件上传
- 图片和视频上传
- 视频上传时生成缩略图

### 5. 安全特性
- JWT认证
- 密码bcrypt加密
- 请求限流
- 详细的输入校验
- 数据验证拦截器
- 角色权限控制
- HTTPS安全加密

## 待完成功能

- [ ] 微信分享功能（API_KEY暂无）
- [ ] 更详细的用户统计和分析

## 本地开发

### 前置条件

- Node.js 18+
- pnpm
- MySQL 8.0+

### 1. 克隆项目

```bash
git clone https://github.com/MinerNobo/travel-note-server.git
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


## 部署

### 生产构建

```bash
pnpm run build
pm2 restart your_app_name
```


## 联系方式

项目负责人: [戴亮(MinerNobo)](https://github.com/MinerNobo/travel-note-server)

电子邮箱：3313976380@qq.com
