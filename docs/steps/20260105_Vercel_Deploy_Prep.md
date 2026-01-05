# Vercel 部署准备工作总结

## 用户输入要求
想给当前项目在 Vercel 部署，请给出操作流程。

## 工作过程
1. **项目分析**：
   - 确认项目为 Next.js 15 (App Router) 架构。
   - 依赖项包括 Supabase, DeepSeek AI 和科大讯飞 (Xfyun) 语音转文字。
2. **安全性优化**：
   - 发现 `src/app/api/xfyun/auth/route.ts` 中存在硬编码的 API 密钥。
   - 将硬编码的 `appId`, `apiKey`, `apiSecret` 替换为环境变量（`XFYUN_APP_ID`, `XFYUN_API_KEY`, `XFYUN_API_SECRET`），以符合生产部署的安全要求。
3. **环境配置整理**：
   - 梳理了部署所需的全部环境变量：
     - Supabase 相关：`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - AI 相关：`DEEPSEEK_API_KEY`
     - 语音识别相关：`XFYUN_APP_ID`, `XFYUN_API_KEY`, `XFYUN_API_SECRET`
4. **部署流程制定**：
   - 编写了详细的 Vercel 部署步骤指南。

## 最后系统接收的提示词
（此处略，为本次对话的完整上下文环境及用户的部署请求）

