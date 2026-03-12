# Flow — Next.js (Web + API 一体化)

Flow 是一款轻盈、极简的生活记录 App：用 “Flow Pulse（今日节奏建议）” 帮助用户在记录中获得松弛感与自我觉察。

本仓库已经整理为 **标准 Next.js App Router** 结构，Vercel 直接识别根目录的 `package.json`，访问根路径不会再 404。

## 新目录结构（可直接部署）

```text
1234/
  app/
    api/
      v1/
        today/
          advice/
            route.ts          # 一体化 API：/api/v1/today/advice
    globals.css
    layout.tsx
    page.tsx                 # Web 首页（Today + Flow Pulse）
    page.module.css
  components/
    FlowPulse.tsx
    FlowPulse.module.css
  lib/
    buildLifeAdvicePrompt.ts # “五行能量分析 → 生活建议” Prompt
    energy.ts                # 类型定义（EnergyContextInput/LifeAdvice）
    ganzhi.ts                # 干支（占位/可替换为真实历法）
  prisma/
    schema.prisma            # Users / Records / Channels / EnergyContext
  .env.example
  next.config.ts
  next-env.d.ts
  package.json
  tsconfig.json
```

## 原本代码如何迁移到 Next.js（你要找的对应关系）

- **原 `apps/mobile/src/screens/TodayScreen.tsx`** → 现在是 `app/page.tsx`
- **原 `apps/mobile/src/components/FlowPulse.tsx`（RN Animated）** → 现在是 `components/FlowPulse.tsx`（Web CSS breathing + 文案淡入）
- **原 `apps/api/src/routes/todayAdvice.ts`** → 现在是 `app/api/v1/today/advice/route.ts`（Next Route Handler）
- **原 `apps/api/src/ai/buildLifeAdvicePrompt.ts`** → 现在是 `lib/buildLifeAdvicePrompt.ts`
- **原 `apps/api/src/types/energy.ts`** → 现在是 `lib/energy.ts`
- **原 Prisma schema `packages/schema/prisma/schema.prisma`** → 现在是 `prisma/schema.prisma`

> 旧目录 `apps/`、`packages/` 仍保留作为历史参考；Vercel 会以根目录 Next.js 为准。

## Vercel 部署要点

- **Root Directory**：选仓库根目录（`1234/`）
- **Build Command**：`npm run build`
- **Output Directory**：留空（Next.js 自动）

## 环境变量

见 `.env.example`：
- **可选**：`AI_ENDPOINT` / `AI_API_KEY` / `AI_MODEL`（不配也能跑，API 会回退到本地温和建议）
- **可选（持久化时需要）**：`DATABASE_URL`

# flow123
# flow123
# flow123
