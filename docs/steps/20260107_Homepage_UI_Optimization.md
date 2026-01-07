# 20260107 首页 UI 布局深度优化总结

## 用户要求
1. 去掉主页顶部的搜索框。
2. 将底部输入框位置放在顶部，且不主动触发键盘。
3. 实现内容滚动时日期吸顶（Sticky Date）。
4. 首页分类精简为：待办事情、美好事情、值得反思，并置于日期右侧。
5. 右上角移除分类入口，添加查看过往日期的日历功能。

## 工作过程
1. **Header 优化**：
   - 移除了顶部的搜索框和 AI 搜索模式切换。
   - 移除了右上角的分类概览（Grid）按钮。
   - 新增了 `Calendar` 图标按钮，用于未来扩展查看过往日期功能。
   - 增加了半透明毛玻璃效果和底部边框，使顶部更加精致。

2. **输入区域（InputArea）调整**：
   - 将 `footer` 定位改为普通的 `div` 布局。
   - 移除了 `useEffect` 中的 `inputRef.current.focus()` 逻辑，确保页面加载或状态切换时不会自动弹出软键盘。
   - 缩小了圆角和边距，使其更适合放在页面顶部位置。

3. **首页布局（page.tsx）重构**：
   - 将 `InputArea` 从页面底部移至 `main` 容器的最上方。
   - 调整了 `main` 的 `mt`（上边距）以适应更简洁的 Header。
   - 增加了 `flex flex-col gap-6` 布局，使输入框与时间轴之间有合理的间距。

4. **时间轴（Timeline）增强**：
   - **日期吸顶**：为日期显示区域添加了 `sticky top-20` 类，结合毛玻璃背景，确保用户滚动查看长日记时，日期始终可见。
   - **分类模块**：在日期右侧新增了三个分类切换按钮（待办、美好、反思），支持点击过滤当前显示的日记内容。
   - **交互优化**：美化了分类按钮的选中状态，使用不同的主题颜色（橙、黄、紫）进行区分。

5. **多语言支持**：
   - 在 `zh.json` 和 `en.json` 中同步更新了新增分类和功能的翻译文案。

## 涉及文件
- `src/components/diary/Header.tsx`
- `src/components/diary/InputArea.tsx`
- `src/app/[locale]/page.tsx`
- `src/components/diary/Timeline.tsx`
- `messages/zh.json`
- `messages/en.json`
- `src/store/useDiaryStore.ts` (参考)

