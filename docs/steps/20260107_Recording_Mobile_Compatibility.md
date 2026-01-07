# 录音功能手机端兼容性优化

## 用户问题
在手机上无法进行语音录音。

## 调查与发现
1. **HTTPS 限制**：移动端浏览器（特别是 iOS Safari 和 Chrome）要求必须在 HTTPS 安全连接下才能使用 `getUserMedia` 和 Web Speech API。如果在局域网内通过 HTTP 访问，录音功能会被禁用。
2. **AudioContext 状态**：iOS Safari 要求 `AudioContext` 必须在用户交互（如点击）后才能启动或恢复。目前的 `AudioVisualizer` 在 `useEffect` 中初始化，可能导致其处于 `suspended` 状态。
3. **Web Speech API 限制**：部分移动端浏览器对 `SpeechRecognition.continuous` 支持不佳，且对麦克风权限的触发时机有严格要求。

## 解决过程
1. **优化 AudioVisualizer**：
   - 在 `AudioVisualizer` 组件中增加了对 `audioContext.state` 的检查。
   - 如果状态为 `suspended`（iOS 常见情况），显式调用 `audioContext.resume()`。

2. **增强安全环境检查**：
   - 在 `InputArea` 的 `startSTT` 方法中增加了对安全上下文（HTTPS）的检查。
   - 如果检测到是非安全环境（非 localhost 的 HTTP 访问），会弹出明确的提示告知用户移动端需要 HTTPS。

3. **改进代码注释**：
   - 为关键逻辑添加了关于移动端兼容性的中文注释。

## 建议
- **使用 HTTPS**：部署到线上或使用 ngrok 等工具提供 HTTPS 隧道进行测试。
- **权限授予**：首次使用时，请务必点击浏览器弹出的麦克风权限确认框。
- **浏览器推荐**：在 Android 上建议使用 Chrome/Edge；在 iOS 上建议使用原生 Safari。

