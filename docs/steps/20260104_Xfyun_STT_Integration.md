# 操作总结 - 集成科大讯飞实时语音转写大模型

## 最后接收的提示词
图片中有3个密钥，操作文档是https://www.xfyun.cn/doc/spark/asr_llm/rtasr_llm.html ，请实现功能

## 用户输入的要求
1. 使用科大讯飞提供的 `APPID`, `APIKey`, `APISecret`。
2. 按照官方“实时语音转写大模型”版本的文档要求，集成真实的 WebSocket 语音识别功能。

## 本次修改的工作过程
1. **鉴权与配置**:
   - 在 `src/app/api/xfyun/auth/route.ts` 中实现了后端签名逻辑，使用 `crypto` 模块计算 HMAC-SHA1 签名，安全地生成 WebSocket 鉴权 URL。
   - 配置了 16k 采样率、16bit PCM 格式、中英混合识别（`autodialect`）等核心参数。
2. **音频处理工具**:
   - 创建了 `src/lib/audio-utils.ts`，提供了采样率转换（Resampling）和 Float32 到 16-bit PCM 编码的转换工具，满足讯飞接口对二进制音频流的要求。
3. **前端实时转写**:
   - 更新了 `InputArea.tsx` 组件，引入了真实的麦克风采集逻辑（`AudioContext` + `getUserMedia`）。
   - 实现了 WebSocket 通信：前端实时发送 16k PCM 音频片段，并接收讯飞返回的 JSON 结果。
   - 优化了结果展示逻辑，支持中间结果的实时回显和最终结果的累加。
4. **安全保护**:
   - 密钥（AppID 等）目前存放在后端 API Route 中，避免了前端代码泄露密钥的风险。

