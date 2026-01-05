# Supabase 数据库对接工作总结

## 用户输入要求
1. 不需要科大讯飞。
2. 需要将数据存在数据库中，请完成数据库的对接工作，并告知用户需要准备什么。

## 工作过程
1. **清理科大讯飞残留**：
   - 删除了 `src/app/api/xfyun/` 整个目录及其下属的鉴权接口。
   - 确认了前端已完全切换为 Web Speech API，不再依赖讯飞。
2. **实现数据库持久化**：
   - 修改了 `src/store/useDiaryStore.ts`：
     - 引入了 `supabase` 客户端。
     - 将原本的同步方法（`addEntry`, `updateEntry`, `deleteEntry`）重构为异步方法，并加入了 **乐观更新 (Optimistic UI)** 机制，确保用户体验流畅。
     - 增加了 `fetchEntries` 方法，用于从数据库获取数据。
     - 增加了 `loading` 状态处理。
   - 修改了 `src/app/[locale]/page.tsx`：
     - 在组件挂载时自动调用 `fetchEntries` 初始化数据。
3. **安全与规范**：
   - 确保所有数据库操作都通过环境变量进行配置，避免泄露密钥。

## 用户准备事项
为了让项目正常运行，请您在 Supabase 后台完成以下操作：

### 1. 创建数据库表
在 Supabase 的 **SQL Editor** 中运行以下 SQL 语句来创建 `diaries` 表：

```sql
create table diaries (
  id text primary key,
  content text not null,
  time text not null,
  date date not null,
  category text not null,
  completed boolean default null,
  created_at timestamp with time zone default now()
);

-- 允许匿名访问（仅用于测试，建议后续开启 RLS）
alter table diaries enable row level security;
create policy "Allow public read and write" on diaries for all using (true);
```

### 2. 获取 API 密钥
在 Supabase 项目设置中获取以下信息并配置到 Vercel 或本地 `.env` 文件中：
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

