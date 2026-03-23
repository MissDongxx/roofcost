**Roof Cost Calculator**

AI Development Specification

Based on ShipAny Template Two · Version 1.0

# **0\. 给 AI 的阅读说明**

本文档是一份完整的开发执行规范，面向 Claude Code / Cursor / GitHub Copilot 等 AI 编程助手。请按以下方式使用本文档：

- 在开始任何编码之前，通读全文一遍，建立完整的上下文。
- 严格按照第 1 节的目录结构创建文件，不要自行调整路径。
- 每完成一个 Task，在该 Task 末尾添加注释 // ✅ DONE 并提交 git。
- 遇到需要环境变量的地方，先在 .env.example 中占位，不要硬编码任何密钥。
- 所有需要人工填写的外部配置（API Key、Webhook URL 等）用 \[PLACEHOLDER\] 标注，完成后整理到第 9 节的 Checklist。

_本项目基于 ShipAny Template Two，该模板已内置：Next.js App Router、Supabase（Auth + DB）、Stripe 支付、Google OAuth、Tailwind CSS、shadcn/ui、i18n（next-intl）、Vercel 部署。AI 不需要重新搭建这些基础设施，只需在其上开发计算器功能。_

# **1\. 项目概览**

## **1.1 产品定位**

产品名称：RoofCostCalc（暂定，可在配置中修改）

核心价值主张：全美最透明的屋顶换顶造价估算工具--无需留资，即时出价，本地化数据，帮房主在见承包商之前先摸清底价。

**目标用户：**

- 美国房主，计划换顶或评估换顶成本
- 已收到承包商报价，想验证价格是否合理

**本期范围（MVP）：**

- 换顶造价计算器（核心功能）
- 本地价格数据库（冷启动版本，基于静态数据）
- 结果页：价格区间 + 材料费/人工费拆解
- 变现：Google AdSense + PDF 报告导出（留邮件）+ Affiliate Lead 按钮
- SEO：结构化数据 Schema.org + sitemap + 城市/材料价格内容页（模板）

**本期不做（下期）：**

- 屋顶维修计算器
- 用户账户系统（ShipAny 的 Auth 模块暂不接入计算器主流程）
- 实时 API 数据（1build 等），MVP 用静态 JSON

## **1.2 技术栈（继承 ShipAny Two）**

| **层级** | **技术**                     | **用途**                      | **版本要求**  |
| -------- | ---------------------------- | ----------------------------- | ------------- |
| 框架     | Next.js                      | App Router + RSC + API Routes | ≥ 14.x        |
| 数据库   | Supabase PostgreSQL          | 价格数据库、用户提交报价      | latest        |
| 认证     | Supabase Auth + Google OAuth | 已内置，计算器无需登录        | 已配置        |
| 支付     | Stripe                       | 已内置，PDF 高级报告可接      | 已配置        |
| 样式     | Tailwind CSS + shadcn/ui     | UI 组件                       | 已配置        |
| 国际化   | next-intl                    | 英文为主，预留中文            | 已配置        |
| 部署     | Vercel                       | Edge Functions + ISR          | 已配置        |
| 缓存     | Upstash Redis（可选）        | 计算结果缓存，早期可跳过      | 按需接入      |
| 邮件     | Resend                       | PDF 报告发送                  | 接入见 Task 5 |
| 分析     | PostHog / Vercel Analytics   | 漏斗追踪                      | 接入见 Task 7 |

# **2\. 目录结构**

以下是需要新建或修改的文件列表。ShipAny Two 已有的文件用 \[EXISTS\] 标注，只需修改；需要新建的文件用 \[NEW\] 标注。

## **2.1 新增目录结构**

src/

├── app/

│ ├── \[locale\]/

│ │ ├── calculator/

│ │ │ └── page.tsx \[NEW\] 计算器主页面（SSR）

│ │ ├── calculator/result/

│ │ │ └── page.tsx \[NEW\] 结果展示页

│ │ ├── roof-cost/\[state\]/

│ │ │ └── page.tsx \[NEW\] 州价格 SEO 落地页（ISR）

│ │ ├── roof-cost/\[state\]/\[city\]/

│ │ │ └── page.tsx \[NEW\] 城市价格 SEO 落地页（ISR）

│ │ └── materials/\[slug\]/

│ │ └── page.tsx \[NEW\] 材料介绍 SEO 页（静态）

│ └── api/

│ ├── calculator/estimate/route.ts \[NEW\] 定价引擎 API

│ ├── calculator/submit-quote/route.ts\[NEW\] 用户提交报价 API

│ └── calculator/pdf/route.ts \[NEW\] PDF 生成 API

├── components/

│ └── calculator/

│ ├── CalculatorForm.tsx \[NEW\] 主表单组件（Client）

│ ├── MaterialSelector.tsx \[NEW\] 材料选择器

│ ├── ResultCard.tsx \[NEW\] 结果卡片

│ ├── PriceBreakdown.tsx \[NEW\] 价格拆解

│ ├── LocalPriceChart.tsx \[NEW\] 本地价格分布图

│ ├── LeadCTA.tsx \[NEW\] Affiliate 转化按钮

│ └── QuoteSubmitForm.tsx \[NEW\] 用户提交真实报价

├── lib/

│ └── calculator/

│ ├── pricing-engine.ts \[NEW\] 核心计算逻辑

│ ├── geo-lookup.ts \[NEW\] ZIP→地区系数查询

│ └── schema-markup.ts \[NEW\] Schema.org JSON-LD

└── data/

├── materials.json \[NEW\] 材料单价数据

├── geo-cost-index.json \[NEW\] 地区成本系数（50州）

└── cities.json \[NEW\] 城市列表（SEO用）

## **2.2 需要修改的现有文件**

| **文件路径**                         | **修改内容**                                |
| ------------------------------------ | ------------------------------------------- |
| src/app/\[locale\]/page.tsx          | 首页增加计算器入口 CTA 组件                 |
| src/app/\[locale\]/layout.tsx        | 增加 Schema.org WebSite 结构化数据          |
| public/sitemap.xml 或 app/sitemap.ts | 新增计算器页、州页、城市页 URL              |
| supabase/migrations/                 | 新增价格数据表 migration 文件               |
| .env.example                         | 新增 RESEND_API_KEY、POSTHOG_KEY 等占位变量 |
| messages/en.json                     | 新增计算器相关 i18n 文案                    |

# **3\. 数据库设计**

## **3.1 迁移文件**

在 supabase/migrations/ 下新建文件：20240101000001_calculator_tables.sql

\-- 材料单价表（从静态 JSON 同步，每月更新）

CREATE TABLE material_prices (

material_type TEXT PRIMARY KEY,

display_name TEXT NOT NULL,

price_low_sqft NUMERIC(6,2) NOT NULL,

price_mid_sqft NUMERIC(6,2) NOT NULL,

price_high_sqft NUMERIC(6,2) NOT NULL,

lifespan_years INT,

notes TEXT,

effective_date DATE NOT NULL DEFAULT CURRENT_DATE,

updated_at TIMESTAMPTZ DEFAULT NOW()

);

\-- 地区成本系数表

CREATE TABLE geo_cost_index (

zip_code TEXT PRIMARY KEY,

state_code TEXT NOT NULL,

metro_area TEXT,

labor_cost_index NUMERIC(4,3) NOT NULL DEFAULT 1.000,

material_index NUMERIC(4,3) NOT NULL DEFAULT 1.000,

updated_at TIMESTAMPTZ DEFAULT NOW()

);

CREATE INDEX idx_geo_state ON geo_cost_index(state_code);

\-- 计算记录表（匿名，用于分析）

CREATE TABLE calculations (

id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

zip_code TEXT,

state_code TEXT,

material_type TEXT,

area_sqft NUMERIC(8,1),

pitch_factor NUMERIC(4,3) DEFAULT 1.0,

complexity TEXT DEFAULT 'simple',

include_tearoff BOOLEAN DEFAULT true,

result_low INT,

result_mid INT,

result_high INT,

created_at TIMESTAMPTZ DEFAULT NOW()

);

\-- 用户提交的真实报价表

CREATE TABLE quote_submissions (

id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

city TEXT NOT NULL,

state_code TEXT NOT NULL,

zip_code TEXT,

material_type TEXT NOT NULL,

area_sqft NUMERIC(8,1),

actual_quote INT NOT NULL,

quote_date DATE NOT NULL,

data_source TEXT DEFAULT 'user_submit',

is_verified BOOLEAN DEFAULT false,

created_at TIMESTAMPTZ DEFAULT NOW()

);

CREATE INDEX idx_qs_city_material ON quote_submissions(city, state_code, material_type);

## **3.2 Row Level Security**

在同一 migration 文件末尾添加 RLS 策略：

ALTER TABLE calculations ENABLE ROW LEVEL SECURITY;

ALTER TABLE quote_submissions ENABLE ROW LEVEL SECURITY;

\-- 允许匿名用户 INSERT（计算器无需登录）

CREATE POLICY "anon insert calculations" ON calculations FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "anon insert quotes" ON quote_submissions FOR INSERT TO anon WITH CHECK (true);

\-- 只有 service_role 可以读取（管理后台用）

CREATE POLICY "service read all" ON calculations FOR SELECT TO service_role USING (true);

CREATE POLICY "service read quotes" ON quote_submissions FOR SELECT TO service_role USING (true);

# **4\. 静态数据文件**

## **4.1 src/data/materials.json**

创建以下 JSON 文件，包含 6 种主要材料的价格区间和属性：

{

"asphalt_3tab": {

"display_name": "Asphalt 3-Tab Shingles",

"price_low_sqft": 3.50,

"price_mid_sqft": 4.50,

"price_high_sqft": 5.50,

"lifespan_years": 20,

"description": "Budget-friendly option, widely available",

"icon": "asphalt"

},

"asphalt_architectural": {

"display_name": "Architectural Shingles",

"price_low_sqft": 4.50,

"price_mid_sqft": 6.00,

"price_high_sqft": 7.50,

"lifespan_years": 30,

"description": "Most popular choice, durable and attractive"

},

"metal_standing_seam": {

"display_name": "Metal (Standing Seam)",

"price_low_sqft": 10.00,

"price_mid_sqft": 14.00,

"price_high_sqft": 18.00,

"lifespan_years": 50,

"description": "Premium longevity, energy efficient"

},

"metal_corrugated": {

"display_name": "Metal (Corrugated / R-Panel)",

"price_low_sqft": 7.00,

"price_mid_sqft": 9.50,

"price_high_sqft": 12.00,

"lifespan_years": 40

},

"tile_concrete": {

"display_name": "Concrete Tile",

"price_low_sqft": 9.00,

"price_mid_sqft": 13.00,

"price_high_sqft": 18.00,

"lifespan_years": 50

},

"slate": {

"display_name": "Natural Slate",

"price_low_sqft": 15.00,

"price_mid_sqft": 22.00,

"price_high_sqft": 30.00,

"lifespan_years": 100

}

}

## **4.2 src/data/geo-cost-index.json（结构示例，需完整 50 州数据）**

文件格式如下，需要为全美 50 州的主要都会区填写 labor_cost_index（基准 1.00 = 全国平均）：

{

"10001": { "state_code": "NY", "metro_area": "New York City", "labor_cost_index": 1.42, "material_index": 1.18 },

"90001": { "state_code": "CA", "metro_area": "Los Angeles", "labor_cost_index": 1.35, "material_index": 1.15 },

"77001": { "state_code": "TX", "metro_area": "Houston", "labor_cost_index": 0.92, "material_index": 0.95 },

"60601": { "state_code": "IL", "metro_area": "Chicago", "labor_cost_index": 1.18, "material_index": 1.05 },

"33101": { "state_code": "FL", "metro_area": "Miami", "labor_cost_index": 0.98, "material_index": 1.02 },

"\__default_\_": { "labor_cost_index": 1.00, "material_index": 1.00 }

}

_AI 任务：使用 BLS Occupational Employment Statistics 2023 数据，填充至少 200 个主要 ZIP 对应的 labor_cost_index 值。数据来源：<https://www.bls.gov/oes/tables.htm，取建筑工人（SOC> 47-2000）时薪，计算相对全国中位数的比值。_

# **5\. 定价引擎**

## **5.1 src/lib/calculator/pricing-engine.ts**

完整实现以下文件，包含所有类型定义和计算逻辑：

// 类型定义

export interface CalculatorInput {

zipCode: string; // 5位 ZIP Code

areaSqft: number; // 屋顶面积（平方英尺）

materialType: string; // 材料类型 key

pitchFactor: number; // 坡度系数: 1.0=平/低, 1.15=中, 1.3=高, 1.5=陡

complexity: 'simple'|'moderate'|'complex'; // 屋顶复杂度

includeTearoff: boolean; // 是否包含拆除旧屋顶

}

export interface PriceResult {

low: number; // 低端估价（美元，取整）

mid: number; // 中端估价

high: number; // 高端估价

breakdown: {

materialCost: number; // 材料费（mid）

laborCost: number; // 人工费（mid）

tearoffCost: number; // 拆除费

disposalCost: number; // 废料处理费

permitCost: number; // 许可证费用估算

};

geoIndex: number; // 使用的地区系数

isDefaultGeo: boolean; // 是否使用了默认系数（无精确数据）

materialName: string;

}

// 核心计算函数

export async function calculateRoofCost(input: CalculatorInput): Promise&lt;PriceResult&gt; {

// 1. 获取地区系数

const geo = await getGeoIndex(input.zipCode);

// 2. 获取材料单价

const material = MATERIALS\[input.materialType\];

if (!material) throw new Error(\`Unknown material: \${input.materialType}\`);

// 3. 计算实际覆盖面积（加坡度系数）

const effectiveArea = input.areaSqft \* input.pitchFactor;

// 4. 复杂度附加系数

const complexityMultiplier = { simple: 1.0, moderate: 1.12, complex: 1.25 }\[input.complexity\];

// 5. 材料费（mid）

const materialCostMid = effectiveArea \* material.price_mid_sqft \* geo.material_index;

// 6. 人工费 = 面积 × 全国人工基准 × 地区人工系数 × 复杂度

// 全国人工基准约 \$2.00-3.50/sqft（取 \$2.75/sqft）

const LABOR_BASE_PER_SQFT = 2.75;

const laborCostMid = effectiveArea \* LABOR_BASE_PER_SQFT \* geo.labor_cost_index \* complexityMultiplier;

// 7. 拆除旧屋顶（约 \$1.00-1.50/sqft，用 \$1.20）

const tearoffCost = input.includeTearoff ? effectiveArea \* 1.20 \* geo.labor_cost_index : 0;

// 8. 废料处理（约 \$300-500 固定 + \$0.10/sqft）

const disposalCost = input.includeTearoff ? (400 + effectiveArea \* 0.10) : 0;

// 9. 许可证（通常 \$150-400，取 \$250 均值）

const permitCost = 250;

// 10. 汇总 mid

const midTotal = Math.round(materialCostMid + laborCostMid + tearoffCost + disposalCost + permitCost);

// 11. low/high 用材料价格低端/高端 + 浮动系数

const low = Math.round(midTotal \* (material.price_low_sqft / material.price_mid_sqft) \* 0.9);

const high = Math.round(midTotal \* (material.price_high_sqft / material.price_mid_sqft) \* 1.1);

return {

low, mid: midTotal, high,

breakdown: {

materialCost: Math.round(materialCostMid),

laborCost: Math.round(laborCostMid),

tearoffCost: Math.round(tearoffCost),

disposalCost: Math.round(disposalCost),

permitCost,

},

geoIndex: geo.labor_cost_index,

isDefaultGeo: geo.isDefault,

materialName: material.display_name,

};

}

# **6\. API Routes**

## **6.1 src/app/api/calculator/estimate/route.ts**

import { NextRequest, NextResponse } from 'next/server';

import { z } from 'zod';

import { calculateRoofCost } from '@/lib/calculator/pricing-engine';

import { createClient } from '@/utils/supabase/server';

const inputSchema = z.object({

zipCode: z.string().regex(/^\\d{5}\$/),

areaSqft: z.number().min(100).max(20000),

materialType: z.enum(\['asphalt_3tab','asphalt_architectural','metal_standing_seam',

'metal_corrugated','tile_concrete','slate'\]),

pitchFactor: z.number().min(1.0).max(1.6).default(1.0),

complexity: z.enum(\['simple','moderate','complex'\]).default('simple'),

includeTearoff: z.boolean().default(true),

});

export async function POST(req: NextRequest) {

try {

const body = await req.json();

const input = inputSchema.parse(body);

const result = await calculateRoofCost(input);

// 异步写入计算记录（不阻塞响应）

const supabase = createClient();

supabase.from('calculations').insert({

zip_code: input.zipCode,

material_type: input.materialType,

area_sqft: input.areaSqft,

pitch_factor: input.pitchFactor,

complexity: input.complexity,

include_tearoff: input.includeTearoff,

result_low: result.low,

result_mid: result.mid,

result_high: result.high,

}).then(() => {}).catch(console.error);

return NextResponse.json({ success: true, data: result });

} catch (err) {

if (err instanceof z.ZodError)

return NextResponse.json({ success: false, error: err.errors }, { status: 400 });

return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });

}

}

## **6.2 src/app/api/calculator/submit-quote/route.ts**

// 用户提交真实报价的 API

const quoteSchema = z.object({

city: z.string().min(2).max(100),

stateCode: z.string().length(2),

zipCode: z.string().regex(/^\\d{5}\$/).optional(),

materialType: z.enum(\['asphalt_3tab','asphalt_architectural','metal_standing_seam',

'metal_corrugated','tile_concrete','slate'\]),

areaSqft: z.number().min(100).max(20000).optional(),

actualQuote: z.number().min(500).max(500000),

quoteDate: z.string().regex(/^\\d{4}-\\d{2}-\\d{2}/),

});

export async function POST(req: NextRequest) {

const body = await req.json();

const data = quoteSchema.parse(body);

const supabase = createClient();

const { error } = await supabase.from('quote_submissions').insert({

city: data.city, state_code: data.stateCode, zip_code: data.zipCode,

material_type: data.materialType, area_sqft: data.areaSqft,

actual_quote: data.actualQuote, quote_date: data.quoteDate,

});

if (error) return NextResponse.json({ success: false }, { status: 500 });

return NextResponse.json({ success: true });

}

## **6.3 src/app/api/calculator/pdf/route.ts**

// 生成 PDF 估算报告并发送至用户邮箱

// 依赖：npm install @react-pdf/renderer resend

import { Resend } from 'resend';

const pdfSchema = z.object({

email: z.string().email(),

result: z.object({ low: z.number(), mid: z.number(), high: z.number(),

breakdown: z.object({...}), materialName: z.string() }),

input: z.object({ zipCode: z.string(), areaSqft: z.number(),

materialType: z.string() }),

});

export async function POST(req: NextRequest) {

const { email, result, input } = pdfSchema.parse(await req.json());

// 1. 用 @react-pdf/renderer 生成 PDF Buffer

// 2. 用 Resend 发送邮件，附件为 PDF

// 3. 将 email 存入 Supabase email_subscribers 表（用于回访序列）

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({

from: 'reports@\[PLACEHOLDER:YOUR_DOMAIN\]',

to: email,

subject: \`Your Roof Cost Estimate - \${input.zipCode}\`,

html: \`&lt;p&gt;Your estimate: \$\${result.low.toLocaleString()}-\$\${result.high.toLocaleString()}&lt;/p&gt;\`,

attachments: \[{ filename: 'roof-cost-estimate.pdf', content: pdfBuffer }\],

});

return NextResponse.json({ success: true });

}

# **7\. 前端组件**

## **7.1 CalculatorForm.tsx（主表单，Client Component）**

'use client'; 组件，包含完整表单状态管理和 API 调用：

**表单字段（顺序与 UX 流程一致）：**

- ZIP Code 输入框：5位数字，失焦时自动识别州名显示在旁边（调用 /api/calculator/estimate 时带入）
- House Area 滑动条+输入框：范围 200-8000 sqft，默认 2000，步长 100
- Material Selector：6张材料卡片，每张显示材料名、价格区间预览、使用年限；点选高亮
- Roof Pitch（坡度）：4个按钮选项 Flat(1.0) / Low(1.1) / Medium(1.2) / Steep(1.4)
- Complexity：3个按钮 Simple / Moderate / Complex，附带简短说明文字
- Include Tear-off？：Toggle，默认 ON
- Submit 按钮：「Calculate My Roof Cost →」，点击调用 API，显示 loading 状态

**状态管理：**

- 使用 React useState 管理所有表单字段
- 使用 useTransition 处理 API 调用
- API 返回成功后，将结果存入 sessionStorage 并 router.push('/calculator/result')

_不要使用 HTML &lt;form&gt; 标签。使用 &lt;div&gt; + onClick 处理所有交互。_

## **7.2 ResultCard.tsx**

展示价格区间的核心组件：

- 三列布局：Low / Mid / High，Mid 列突出显示（更大、有边框高亮）
- 每列显示：标签 + 美元金额（格式化为 \$X,XXX）+ 说明文字
- Low 说明："Basic materials & efficient contractor"
- Mid 说明："Mid-grade materials & typical pricing"
- High 说明："Premium materials & complex installation"
- 若 isDefaultGeo=true，在卡片下方显示黄色提示："Using national average - enter a ZIP for local pricing"

## **7.3 PriceBreakdown.tsx**

可展开的费用拆解组件：

- 默认折叠，点击「See price breakdown」展开
- 展示：Materials / Labor / Tear-off / Disposal / Permits 五行，各行显示中端金额和百分比
- 用水平进度条可视化各部分占比

## **7.4 LeadCTA.tsx（Affiliate 转化组件）**

放置在结果页底部，是主要变现组件：

// 显示文案：

// 「Get 3 Free Quotes from Local Contractors」

// 副文案：「Compare prices and save up to 30%」

// 按钮样式：大号、绿色、全宽

// 点击行为：

// 1. 记录 PostHog event: lead_cta_clicked

// 2. 在新标签打开 HomeAdvisor Affiliate URL（附带 UTM 参数）

// Affiliate URL 格式：

// <https://www.homeadvisor.com/task.html?\[PLACEHOLDER:AFFILIATE_ID\>]

// &utm_source=roofcostcalc&utm_medium=result_page&utm_campaign=lead_cta

## **7.5 QuoteSubmitForm.tsx**

结果页的「贡献你的真实报价」表单，用数据换数据：

- 触发方式：结果页底部显示「Help others - share your actual quote」折叠面板
- 字段：城市名 / 州（自动从 ZIP 填充）/ 材料类型（自动填充）/ 实际报价金额 / 报价时间
- 提交成功后：显示「Thank you! View local price data」按钮，解锁当地历史报价区间（从 DB 查询）

# **8\. SEO 落地页**

## **8.1 城市价格页（ISR）**

路由：/roof-cost/\[state\]/\[city\]，例如 /roof-cost/texas/houston

渲染方式：ISR，revalidate = 86400（每天重建）

**generateStaticParams 策略：**

- 从 src/data/cities.json 读取 top 200 个城市生成静态页
- cities.json 格式：\[{ slug: 'houston', state: 'texas', stateCode: 'TX', displayName: 'Houston', population: 2300000 }\]

**页面内容结构（按 SEO 权重排列）：**

- H1："Roof Replacement Cost in \[City\], \[State\] (2026)"
- 价格总结卡：该城市的 mid 估价区间（从 DB 查询，若无则用全国均值×geo_index）
- 城市调整说明：展示该城市的 labor_cost_index，解释为何与全国均值不同
- 材料价格对比表：6种材料在该城市的预估价格范围
- FAQ section（加 FAQPage Schema）：至少 5 个 Q&A，包含长尾关键词
- 计算器嵌入：本页底部嵌入完整计算器，ZIP Code 预填该城市 ZIP
- CTA：Affiliate Lead 按钮

**generateMetadata：**

title: \`Roof Replacement Cost in \${city}, \${state} | 2026 Local Prices\`

description: \`Average roof replacement cost in \${city} is \$\${lowPrice}-\$\${highPrice}.

Get instant estimate for your home. Free calculator, no signup required.\`

## **8.2 Schema.org 结构化数据**

在 src/lib/calculator/schema-markup.ts 中实现以下 JSON-LD 生成函数：

**1\. WebApplication Schema（计算器页）：**

{

"@type": "WebApplication",

"name": "Roof Cost Calculator",

"applicationCategory": "FinanceApplication",

"offers": { "price": "0", "priceCurrency": "USD" },

"description": "Free roof replacement cost calculator..."

}

**2\. FAQPage Schema（城市页）：**

{

"@type": "FAQPage",

"mainEntity": \[

{ "@type": "Question",

"name": "How much does a roof replacement cost in \[City\]?",

"acceptedAnswer": { "@type": "Answer",

"text": "In \[City\], the average roof replacement cost is \$X,XXX-\$X,XXX..." }

}

\]

}

3\. HowTo Schema（材料页）：带步骤的安装成本指南。

## **8.3 Sitemap（app/sitemap.ts）**

export default async function sitemap() {

const staticRoutes = \['/calculator', '/'\].map(url => ({

url: \`\${process.env.NEXT_PUBLIC_SITE_URL}\${url}\`,

lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0

}));

const cities = await import('@/data/cities.json');

const cityRoutes = cities.default.map(c => ({

url: \`\${process.env.NEXT_PUBLIC_SITE_URL}/roof-cost/\${c.state}/\${c.slug}\`,

lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8

}));

return \[...staticRoutes, ...cityRoutes\];

}

# **9\. 环境变量 & 分析追踪**

## **9.1 新增 .env.example 条目**

\# ── 已由 ShipAny Two 配置（不要修改）──

NEXT_PUBLIC_SUPABASE_URL=

NEXT_PUBLIC_SUPABASE_ANON_KEY=

SUPABASE_SERVICE_ROLE_KEY=

STRIPE_SECRET_KEY=

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

\# ── 需要新增 ──

NEXT_PUBLIC_SITE_URL=https://\[PLACEHOLDER:YOUR_DOMAIN\]

RESEND_API_KEY=\[PLACEHOLDER\] # <https://resend.com>

NEXT_PUBLIC_POSTHOG_KEY=\[PLACEHOLDER\] # <https://posthog.com>

NEXT_PUBLIC_POSTHOG_HOST=<https://app.posthog.com>

ADSENSE_PUBLISHER_ID=\[PLACEHOLDER\] # ca-pub-XXXXXXXXXXXXXXXX

HOMEADVISOR_AFFILIATE_ID=\[PLACEHOLDER\] # HomeAdvisor partner dashboard

\# ── 可选（规模化后接入）──

UPSTASH_REDIS_REST_URL=

UPSTASH_REDIS_REST_TOKEN=

## **9.2 PostHog 事件追踪**

在 src/lib/analytics.ts 中封装以下追踪事件，在对应组件中调用：

| **事件名**          | **触发时机**        | **附带属性**                         |
| ------------------- | ------------------- | ------------------------------------ |
| calc_started        | 用户开始填写计算器  | -                                    |
| calc_submitted      | 点击 Calculate 按钮 | material_type, area_sqft, zip_code   |
| result_viewed       | 结果页加载完成      | mid_price, material_type, state_code |
| breakdown_expanded  | 展开费用拆解        | -                                    |
| pdf_requested       | 点击 Download PDF   | -                                    |
| pdf_email_submitted | 提交邮件获取 PDF    | -                                    |
| lead_cta_clicked    | 点击 Affiliate 按钮 | source: result_page                  |
| quote_submitted     | 提交真实报价        | material_type, state_code            |

# **10\. UI 设计规范**

## **10.1 视觉风格**

整体风格：专业、可信赖，面向美国房主（35-65岁）。避免过于前卫或游戏化的设计。

| **元素** | **规格**                                  |
| -------- | ----------------------------------------- |
| 主色     | #1B4F8A（深蓝，代表专业/可靠）            |
| 强调色   | #2ECC71（绿，代表计算/钱/行动）           |
| 警告色   | #F39C12（橙，提示/注意事项）              |
| 背景     | #F8FAFC（浅灰白）                         |
| 卡片     | 白色背景 + border 1px #E2E8F0 + shadow-sm |
| 字体     | 系统字体栈（Tailwind font-sans）          |
| 圆角     | rounded-lg（卡片）/ rounded-md（按钮）    |
| 间距     | 基于 8px 倍数，主内容区 max-w-3xl         |

## **10.2 计算器页面布局**

桌面端（≥768px）：左右两栏，左侧 60% 表单，右侧 40% 实时预览价格范围（随用户填写动态更新）

移动端（<768px）：单列，表单在上，结果在下

**表单步骤进度指示：**

- 顶部显示进度条，3步：Location → Roof Details → Materials
- 每步完成后进度条更新，但允许用户自由跳转

## **10.3 结果页布局**

- 顶部："Your Roof Replacement Cost Estimate" + 地址确认（城市+州）
- 核心：ResultCard（Low/Mid/High 三列）
- 次要：PriceBreakdown（可折叠）
- 可选：LocalPriceChart（若有≥5条本地数据，显示箱线图）
- 行动：LeadCTA（Affiliate 按钮，全宽绿色）
- 补充：PDF 下载表单 + QuoteSubmit 表单（折叠）
- 底部：相关城市链接（SEO 内链）

# **11\. AI 执行任务清单**

按以下顺序执行，每完成一个 Task 提交一次 git commit：

| **Task** | **内容**                                                | **预估耗时** | **依赖**       |
| -------- | ------------------------------------------------------- | ------------ | -------------- |
| T-01     | 创建 Supabase migration 文件，运行 npx supabase db push | 15min        | -              |
| T-02     | 创建 src/data/materials.json（完整数据）                | 10min        | -              |
| T-03     | 创建 src/data/geo-cost-index.json（200+ ZIP）           | 30min        | BLS 数据       |
| T-04     | 实现 src/lib/calculator/pricing-engine.ts（含单元测试） | 45min        | T-02, T-03     |
| T-05     | 实现 API Route: /api/calculator/estimate                | 20min        | T-04           |
| T-06     | 实现 CalculatorForm.tsx 组件                            | 60min        | T-05           |
| T-07     | 实现 ResultCard.tsx + PriceBreakdown.tsx                | 30min        | -              |
| T-08     | 实现计算器主页面 /calculator/page.tsx                   | 20min        | T-06, T-07     |
| T-09     | 实现 LeadCTA.tsx + 接入 PostHog 追踪                    | 20min        | ENV 配置       |
| T-10     | 实现 QuoteSubmitForm.tsx + API Route /submit-quote      | 25min        | T-01           |
| T-11     | 实现 PDF 生成 API + Resend 邮件发送                     | 40min        | RESEND_API_KEY |
| T-12     | 实现 /roof-cost/\[state\]/\[city\] SEO 落地页           | 45min        | T-03, T-04     |
| T-13     | 实现 src/lib/calculator/schema-markup.ts + 注入各页面   | 25min        | T-12           |
| T-14     | 实现 app/sitemap.ts，验证可被爬取                       | 15min        | T-12           |
| T-15     | 首页增加计算器入口 CTA 组件                             | 15min        | T-08           |
| T-16     | 补充 messages/en.json 所有计算器文案                    | 20min        | -              |
| T-17     | 全局 E2E 测试：完整计算→结果→PDF→Lead 链路              | 30min        | 所有前序       |
| T-18     | Vercel 部署验证：Core Web Vitals + Schema 验证          | 20min        | T-17           |

# **12\. 上线前 Checklist**

所有 \[PLACEHOLDER\] 均需在上线前替换为真实值，逐项确认：

## **12.1 外部服务配置**

| **服务**              | **配置位置**                              | **状态** |
| --------------------- | ----------------------------------------- | -------- |
| Resend - 邮件         | RESEND_API_KEY + 域名 DNS SPF/DKIM        | ☐ 待配置 |
| PostHog - 分析        | NEXT_PUBLIC_POSTHOG_KEY + 创建漏斗        | ☐ 待配置 |
| Google AdSense        | ADSENSE_PUBLISHER_ID + 页面嵌入代码       | ☐ 待申请 |
| HomeAdvisor Affiliate | HOMEADVISOR_AFFILIATE_ID + 链接参数       | ☐ 待申请 |
| Google Search Console | 提交 sitemap.xml                          | ☐ 上线后 |
| Google Analytics 4    | GA4 Measurement ID（可复用 ShipAny 配置） | ☐ 确认   |

## **12.2 SEO 验证**

- 用 Google Rich Results Test 验证 FAQPage + WebApplication Schema
- 用 PageSpeed Insights 确认 LCP < 2.5s，CLS < 0.1
- 确认 robots.txt 不屏蔽 /calculator 和 /roof-cost
- 验证 sitemap.xml 可访问，包含所有城市页 URL

## **12.3 功能验收**

- 计算器：输入不同 ZIP，验证不同地区系数正确生效
- 计算器：极端值测试（面积 200 / 8000，所有材料类型）
- PDF：真实发送邮件，PDF 内容正确
- Lead CTA：点击后新标签打开正确 URL，UTM 参数完整
- Quote Submit：提交后数据写入 Supabase，is_verified=false
- 移动端：iOS Safari + Android Chrome 全流程测试

文档结束 · Roof Cost Calculator Dev Spec v1.0