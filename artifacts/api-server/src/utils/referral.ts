import { db, usersTable } from '@workspace/db';
import { eq } from 'drizzle-orm';

export async function generateReferralCode(): Promise<string> {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Check if code already exists
    const existing = await db.select().from(usersTable).where(eq(usersTable.referralCode, code)).limit(1);
    if (existing.length === 0) {
      return code;
    }

    attempts++;
  }

  throw new Error('Failed to generate unique referral code');
}