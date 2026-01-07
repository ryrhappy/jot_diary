# 20260107 历史归档视图与日历功能实现

## 用户要求
1. 点击右上角日历图标，展示一个新的归档页面。
2. 页面顶部显示日历，点击具体日期可查看当天的日记内容。
3. 检查数据存储结构是否需要修改。

## 工作过程
1. **数据结构评估**：
   - 现有的 `diaries` 表已包含 `date` (YYYY-MM-DD) 字段，能够支持按日筛选。
   - 现有的 `fetchEntries` 已经获取了用户的所有记录，因此前端可以通过 Store 直接过滤，无需修改数据库结构。

2. **Store 扩展**：
   - 在 `useDiaryStore` 中新增了 `view: 'archive'` 视图类型。
   - 新增了 `archiveDate` 状态，用于记录当前正在查看的历史日期，默认为今天。

3. **Header 更新**：
   - 为日历图标绑定了点击事件，支持在 `timeline` 和 `archive` 视图间切换。
   - 优化了标题点击，点击标题可快速返回 `timeline`（首页时间轴）。

4. **ArchiveView 组件开发**：
   - **自定义日历**：实现了基于当前月份的日历组件，支持切换月份。
   - **动态标记**：日历中包含日记的日期下方会有蓝色小点提示。
   - **实时展示**：点击日期后，下方列表会立即显示该日期的所有日记，并带有时间戳和精致的卡片样式。

5. **页面集成**：
   - 在 `page.tsx` 中注册并集成了 `ArchiveView` 组件。

## 涉及文件
- `src/store/useDiaryStore.ts`
- `src/components/diary/Header.tsx`
- `src/components/diary/ArchiveView.tsx` (新文件)
- `src/app/[locale]/page.tsx`

