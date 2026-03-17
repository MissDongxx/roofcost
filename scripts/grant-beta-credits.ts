/**
 * 批量授予内测用户免费额度
 *
 * 使用方法：
 * 1. 确保 .env.development 中的数据库配置正确
 * 2. 修改下面的 BETA_TESTERS 列表
 * 3. 运行: pnpm tsx scripts/grant-beta-credits.ts
 */

import { drizzle } from 'drizzle-orm/postgres';
import postgres from 'postgres';
import { nanoid } from 'nanoid';
import { credit, user } from '@/config/db/schema.postgres';
import { envConfigs } from '@/config';

// 内测用户列表配置
interface BetaTester {
  email: string;
  credits: number;
  validDays?: number;
  description?: string;
}

const BETA_TESTERS: BetaTester[] = [
  // 添加你的内测用户邮箱
  // { email: 'tester1@example.com', credits: 5, validDays: 30, description: 'Early beta tester' },
  // { email: 'tester2@example.com', credits: 3, validDays: 30, description: 'Contractor beta test' },
];

// 数据库连接
const connectionString = envConfigs.db_url;
if (!connectionString) {
  throw new Error('DATABASE_URL not set');
}

const client = postgres(connectionString);
const db = drizzle(client);

/**
 * 授予用户额度
 */
async function grantCredits(
  userEmail: string,
  amount: number,
  validDays: number = 30,
  description: string = 'Beta tester grant'
) {
  // 查找用户
  const users = await client<{
    id: string;
    email: string;
    name: string | null;
  }[]>`
    SELECT id, email, name
    FROM "user"
    WHERE email = ${userEmail}
    LIMIT 1
  `;

  if (!users || users.length === 0) {
    console.log(`❌ User not found: ${userEmail}`);
    return false;
  }

  const user = users[0];

  // 计算过期时间
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + validDays);

  // 创建额度记录
  const creditId = nanoid();
  const transactionNo = `BETA-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

  await client.insert(credit).values({
    id: creditId,
    userId: user.id,
    userEmail: user.email,
    transactionNo,
    transactionType: 'grant',
    transactionScene: 'beta_tester',
    credits: amount,
    remainingCredits: amount,
    description,
    expiresAt: expiresAt.toISOString(),
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  console.log(`✅ Granted ${amount} credits to ${userEmail} (${user.name || 'No name'})`);
  console.log(`   Valid until: ${expiresAt.toISOString().split('T')[0]}`);
  console.log(`   Description: ${description}`);
  console.log('');

  return true;
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 Starting beta credits grant...\n');

  if (BETA_TESTERS.length === 0) {
    console.log('⚠️  No beta testers configured. Please edit the BETA_TESTERS array in this file.');
    return;
  }

  let successCount = 0;
  let failCount = 0;

  for (const tester of BETA_TESTERS) {
    const success = await grantCredits(
      tester.email,
      tester.credits,
      tester.validDays ?? 30,
      tester.description ?? `Beta tester grant: ${tester.credits} credits`
    );

    if (success) {
      successCount++;
    } else {
      failCount++;
    }
  }

  console.log('─────────────────────────────────────');
  console.log(`✅ Successfully granted: ${successCount} users`);
  console.log(`❌ Failed: ${failCount} users`);
  console.log('─────────────────────────────────────');

  await client.end();
}

// 运行
main().catch(console.error);
