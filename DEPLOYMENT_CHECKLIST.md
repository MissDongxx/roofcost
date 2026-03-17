# RoofCost AI - Production Deployment Checklist

## Phase 5.1: Vercel 部署准备

### 环境变量配置清单

在 Vercel Dashboard 中配置以下环境变量：

#### 必需变量（部署前必须配置）

```bash
# App Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_APP_NAME=RoofCostAI

# Database (从 Supabase Dashboard 获取)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres
DB_SCHEMA=roofcost
DATABASE_PROVIDER=postgresql
DB_MAX_CONNECTIONS=10  # Vercel Hobby 计划限制为 1

# Authentication
AUTH_SECRET=[生成命令: openssl rand -base64 32]

# AI Provider (从 https://open.bigmodel.cn/usercenter/apikeys 获取)
ZHIPU_API_KEY=your_api_key_here
ZHIPU_API_BASE=https://open.bigmodel.cn/api/paas/v4

# Payment (PayPal Sandbox 测试)
PAYPAL_ENABLED=true
PAYPAL_ENVIRONMENT=sandbox
PAYPAL_CLIENT_ID=your_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_sandbox_client_secret
```

#### 生产环境变量（正式上线后配置）

```bash
# Payment - Production
PAYPAL_ENVIRONMENT=production
PAYPAL_CLIENT_ID=your_production_client_id
PAYPAL_CLIENT_SECRET=your_production_client_secret
PAYPAL_WEBHOOK_ID=your_webhook_id

# Storage (可选，使用 Supabase Storage)
SUPABASE_STORAGE_URL=https://[PROJECT].supabase.co/storage/v1
SUPABASE_STORAGE_ANON_KEY=your_anon_key
SUPABASE_STORAGE_SERVICE_KEY=your_service_role_key
```

---

### 数据库准备

1. **Supabase 生产数据库确认**
   ```sql
   -- 确认表结构
   SELECT table_name FROM information_schema.tables
   WHERE table_schema = 'roofcost';

   -- 应该看到以下表:
   -- user, session, account, verification
   -- inspection, photo, observation, scope_item, report
   ```

2. **初始管理员用户创建**
   ```sql
   -- 在 user 表中创建管理员账户
   ```

---

### Vercel 部署步骤

1. **连接 Git 仓库**
   - Vercel Dashboard → Add New Project
   - 导入 GitHub 仓库
   - 选择 `rootDirectory`: `/`

2. **配置环境变量**
   - 在 Settings → Environment Variables 中添加上述所有必需变量

3. **部署配置确认** (vercel.json 已配置)
   ```json
   {
     "buildCommand": "pnpm build",
     "functions": {
       "src/app/api/ai/**/*.ts": { "maxDuration": 60 }
     }
   }
   ```

4. **执行部署**
   - 点击 "Deploy" 按钮
   - 等待构建完成（约 2-3 分钟）

5. **验证部署**
   - 访问分配的 Vercel URL
   - 测试用户登录功能
   - 测试新建 inspection 功能

---

### Stripe Webhook 配置（如使用）

1. **获取生产环境 Webhook Secret**
   ```
   Stripe Dashboard → Developers → Webhooks
   → Add endpoint: https://your-domain.com/api/payment/callback/stripe
   → 选择事件: checkout.session.completed, payment_intent.succeeded
   → 复制 webhook signing secret
   ```

2. **在 Vercel 中添加**
   ```
   STRIPE_WEBHOOK_SECRET=whsec_xxx
   ```

---

### 部署后验证清单

- [ ] 首页可正常访问
- [ ] 用户注册/登录功能正常
- [ ] 可创建新的 inspection
- [ ] 照片上传功能正常
- [ ] AI pipeline 可正常运行
- [ ] PDF 生成和下载功能正常
- [ ] 支付流程（沙盒环境）正常

---

### 回滚计划

如果部署出现问题：

```bash
# 回滚到上一个稳定版本
vercel rollback [deployment-url]

# 或者在 Vercel Dashboard 中:
# Deployments → 选择之前的版本 → Promote to Production
```

---

### 监控和日志

- **Vercel Analytics**: 已集成，自动收集页面访问数据
- **错误追踪**: 检查 Vercel Logs 标签页
- **数据库监控**: Supabase Dashboard → Database → Logs

---

### 性能优化建议

1. **图片优化**: 确保上传的图片经过 sharp 处理（最长边 2048px）
2. **API 超时**: vercel.json 中已配置 AI 相关 API 为 60s
3. **缓存策略**: 考虑为 PDF 报告添加 CDN 缓存
4. **数据库连接池**: 生产环境建议使用 Supabase 连接池模式

---

## 常见问题排查

### 问题 1: 构建失败
```bash
# 检查 package.json 中的 scripts
"build": "next build"  # 确保正确
```

### 问题 2: 数据库连接失败
```bash
# 检查 DATABASE_URL 格式
# 确认 IP 白名单（Supabase 不需要，但其他数据库可能需要）
```

### 问题 3: AI API 调用失败
```bash
# 检查 ZHIPU_API_KEY 是否正确设置
# 检查 API Base URL 是否可访问
```

---

## 下一步

完成部署后，继续执行：
- **Phase 5.2**: 错误处理和状态显示增强
- **Phase 5.3**: 内测用户准备
