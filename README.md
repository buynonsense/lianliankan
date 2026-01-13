# 连连看游戏

基于 Next.js 开发的连连看游戏，包含完整的用户系统、积分系统和排行榜功能。

## 技术栈

- **前端框架**: Next.js 14 (App Router)
- **后端**: Next.js API Routes
- **数据库**: SQLite + Prisma ORM
- **UI**: Tailwind CSS
- **认证**: JWT + Cookie
- **密码加密**: bcrypt

## 功能特性

### ✅ 已实现
- [x] 用户注册/登录系统
- [x] JWT 认证和会话管理
- [x] 连连看游戏核心逻辑
- [x] 三种难度级别 (6x6, 8x8, 10x10)
- [x] 路径检测算法 (直线、1拐点、2拐点)
- [x] 计时和步数统计
- [x] 积分计算系统
- [x] 总积分排行榜
- [x] 日榜和周榜
- [x] 游戏暂停/继续
- [x] 自动重新洗牌
- [x] Docker 支持

### 🚀 即将开发
- [ ] 用户个人中心
- [ ] 游戏历史记录
- [ ] 成就系统
- [ ] 多语言支持
- [ ] WebSocket 实时排行榜
- [ ] 移动端优化

## 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn

### 本地开发

1. **克隆项目**
```bash
git clone <repository-url>
cd lianliankan
```

2. **安装依赖**
```bash
npm install
```

3. **配置环境变量**
```bash
cp .env.example .env.local
# 编辑 .env.local 设置你的密钥
```

4. **初始化数据库**
```bash
npx prisma db push
```

5. **启动开发服务器**
```bash
npm run dev
```

访问 http://localhost:3000

### Docker 部署

1. **构建和运行**
```bash
# 复制环境变量
cp .env.example .env
# 编辑 .env 文件配置密钥

# 启动服务
docker-compose up -d
```

2. **查看日志**
```bash
docker-compose logs -f app
```

3. **停止服务**
```bash
docker-compose down
```

## 项目结构

```
lianliankan/
├── src/
│   ├── app/
│   │   ├── api/              # API 路由
│   │   │   ├── auth/         # 认证相关
│   │   │   ├── game/         # 游戏相关
│   │   │   ├── leaderboard/  # 排行榜
│   │   │   └── health/       # 健康检查
│   │   ├── (auth)/           # 认证页面
│   │   ├── game/             # 游戏页面
│   │   ├── leaderboard/      # 排行榜页面
│   │   ├── page.tsx          # 首页
│   │   └── layout.tsx        # 根布局
│   ├── components/
│   │   ├── auth/             # 认证组件
│   │   ├── game/             # 游戏组件
│   │   └── ui/               # 通用UI组件
│   ├── lib/
│   │   ├── auth/             # 认证工具
│   │   ├── database/         # 数据库客户端
│   │   └── game/             # 游戏逻辑
│   └── middleware.ts         # 路由中间件
├── prisma/
│   ├── schema.prisma         # 数据库模型
│   └── migrations/           # 数据库迁移
├── public/                   # 静态资源
├── Dockerfile
├── docker-compose.yml
├── package.json
└── README.md
```

## API 文档

### 认证

- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/session` - 获取会话信息
- `DELETE /api/auth/session` - 登出

### 游戏

- `POST /api/game/start` - 开始新游戏
- `POST /api/game/validate` - 验证消除
- `POST /api/game/submit` - 提交成绩

### 排行榜

- `GET /api/leaderboard?type=total&limit=10` - 获取排行榜
  - `type`: total(总榜), daily(日榜), weekly(周榜)
  - `limit`: 返回条数

### 健康检查

- `GET /api/health` - 服务健康状态

## 数据库模型

### User (用户)
- id, username, email, passwordHash
- totalScore, gamesPlayed
- createdAt, updatedAt

### GameRecord (游戏记录)
- userId, score, timeSeconds, moves
- boardSize, difficulty, completed
- createdAt

### ScoreRecord (积分记录)
- userId, gameRecordId, scoreChange
- reason, createdAt

## 游戏规则

1. **消除规则**: 点击两个相同图案的方块进行消除
2. **连接路径**: 直线、1个拐点、2个拐点
3. **胜利条件**: 消除所有方块
4. **积分计算**:
   - 基础分 = 棋盘大小² × 10
   - 时间奖励 = (180 - 用时) × 2
   - 步数奖励 = (最佳步数 - 实际步数) × 5
   - 难度系数: 简单×1, 中等×1.5, 困难×2

## 开发指南

### 添加新功能

1. 创建数据库模型 (prisma/schema.prisma)
2. 生成客户端: `npx prisma generate`
3. 创建 API 路由 (src/app/api/)
4. 创建 React 组件 (src/components/)
5. 添加页面 (src/app/)

### 测试

```bash
# 运行开发服务器
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start
```

## 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `DATABASE_URL` | 数据库连接字符串 | `file:./lianliankan.db` |
| `JWT_SECRET` | JWT 密钥 | 必须设置 |
| `NEXTAUTH_SECRET` | NextAuth 密钥 | 必须设置 |
| `NODE_ENV` | 运行环境 | `development` |

## 部署建议

### Vercel (推荐)
```bash
# 连接 Git 仓库
# 设置环境变量
# 自动部署
```

### 自建服务器
```bash
# 1. 安装依赖
npm install --production

# 2. 构建
npm run build

# 3. 启动
npm start

# 4. 使用 PM2 管理
npm install -g pm2
pm2 start npm --name "lianliankan" -- start
```

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 许可证

MIT License

---

**开发时间**: 2026年1月
**版本**: 1.0.0
