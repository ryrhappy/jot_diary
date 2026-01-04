# Jot Diary - AI 驱动的极简流式日记

Jot Diary 是一个基于 **Append-Only** 模式的实验性日记应用。它消除了所有分类负担，利用 AI (RAG) 实现自然语言检索与生命洞察。

## 🚀 技术栈 (Modern AI Stack)

- **框架**: [Next.js 15+](https://nextjs.org/) (App Router)
- **UI**: [Tailwind CSS](https://tailwindcss.com/) + [Shadcn/UI](https://ui.shadcn.com/)
- **图标**: [Lucide React](https://lucide.dev/)
- **数据库**: [Supabase](https://supabase.com/) (PostgreSQL + pgvector)
- **AI 引擎**: [Vercel AI SDK](https://sdk.vercel.ai/) + [OpenAI GPT-4o-mini](https://openai.com/)
- **状态管理**: [Zustand](https://zustand-demo.pmnd.rs/) + [TanStack Query](https://tanstack.com/query/latest)
- **部署**: [Vercel](https://vercel.com/) (CI/CD)

## 📁 目录结构设计

```text
jot-diary/
├── src/
│   ├── app/                # Next.js App Router (页面与路由)
│   │   ├── api/            # 后端 API 接口 (AI, STT, 导出)
│   │   ├── (auth)/         # 用户认证模块
│   │   └── layout.tsx      # 全局布局 (包含毛玻璃 Header/Footer)
│   ├── components/         # 核心 UI 组件
│   │   ├── diary/          # 日记流相关组件 (Timeline, Entry)
│   │   ├── ai/             # AI 助手相关组件 (InsightDrawer, Chat)
│   │   └── ui/             # Shadcn 通用原子组件
│   ├── hooks/              # 自定义 Hooks (useStt, useDiary)
│   ├── lib/                # 外部库配置 (supabase, openai, utils)
│   ├── services/           # 业务逻辑层 (向量检索, 实体提取逻辑)
│   ├── store/              # Zustand 全局状态 (User, UI State)
│   └── types/              # TypeScript 接口定义
├── prisma/                 # 数据库 Schema 定义
├── public/                 # 静态资源 (Logo, PWA 资源)
├── .env.example            # 环境变量模板
└── tailwind.config.ts      # 极简主题配置
```

## 🛠️ 项目初始化与运行

### 1. 环境准备
确保您的电脑已安装 [Node.js](https://nodejs.org/) (建议 v18.0.0 或以上版本)。

### 2. 获取代码与安装依赖
如果您是首次获取本项目，请执行以下命令安装依赖：

```bash
# 进入项目目录
cd jot-diary

# 安装所有依赖
npm install
```

### 3. 配置环境变量
在项目根目录创建 `.env.local` 文件，并参考以下内容配置 Supabase 信息：

```env
NEXT_PUBLIC_SUPABASE_URL=您的Supabase项目URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=您的Supabase匿名Key
```

### 4. 启动开发服务器
执行以下命令启动项目：

```bash
npm run dev
```

启动后，在浏览器访问 [http://localhost:3000](http://localhost:3000) 即可预览应用。

### 5. 其他常用命令
- `npm run build`: 构建生产版本
- `npm run start`: 启动生产服务器
- `npm run lint`: 执行代码检查

## 🌟 核心功能开发路线

1. **Phase 1 (MVP)**: 实现 Append-only 时间轴流与 Supabase 数据同步。
2. **Phase 2 (Voice)**: 集成 Whisper API 实现“语音确认-保存”逻辑。
3. **Phase 3 (Intelligence)**: 实现日记内容的 Embedding 存储，并开启语义搜索与 AI 洞察抽屉。
4. **Phase 4 (Offline)**: 实现离线记录与 PWA 支持。

---
"记录，让生命不再只是消逝。"

