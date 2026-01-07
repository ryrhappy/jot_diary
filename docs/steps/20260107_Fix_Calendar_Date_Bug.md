# 20260107 修复日历点击日期偏差 bug

## 问题描述
用户反馈在日历页面点击 5 号时，下方内容显示的是 4 号的内容。

## 根本原因
由于使用了 JavaScript 的 `date.toISOString()` 方法，该方法会将本地时间转换为 **UTC（协调世界时）**。
- 例如在东八区（中国），1 月 5 日凌晨 00:00 的本地时间，转换为 UTC 后是 1 月 4 日 16:00。
- `split('T')[0]` 截取后的日期字符串就变成了 "2026-01-04"，导致日期偏差。

## 解决方案
1. **统一日期工具**：新建了 `src/lib/date-utils.ts`，提供了 `formatLocalDate` 和 `formatLocalTime` 方法，确保所有日期处理都基于**本地时间**。
2. **重构日历逻辑**：在 `ArchiveView.tsx` 中，使用新的工具函数替代 `toISOString`，确保点击的日期与过滤的日期字符串完全匹配。
3. **全局修复**：同步修复了 `InputArea.tsx` 和 `useDiaryStore.ts` 中可能导致新记录日期偏差的隐患。

## 涉及文件
- `src/lib/date-utils.ts` (新增)
- `src/components/diary/ArchiveView.tsx`
- `src/components/diary/InputArea.tsx`
- `src/store/useDiaryStore.ts`

