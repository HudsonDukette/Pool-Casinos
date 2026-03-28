import { Router } from 'express';
import { db, betsTable } from '@workspace/db';
import { eq, desc } from 'drizzle-orm';
import { requireAuth } from '../middleware/auth.js';
import { GetTransactionsQueryParams } from '@workspace/api-zod';

const router = Router();

// Get transaction history
router.get('/', requireAuth, async (req, res) => {
  try {
    const params = GetTransactionsQueryParams.parse(req.query);
    const { game, limit = 50, offset = 0 } = params;

    let query = db.select().from(betsTable).where(eq(betsTable.userId, req.session.userId!));

    if (game) {
      query = query.where(eq(betsTable.gameType, game));
    }

    const transactions = await query
      .orderBy(desc(betsTable.timestamp))
      .limit(limit)
      .offset(offset);

    const total = await db.select({ count: betsTable.id }).from(betsTable).where(eq(betsTable.userId, req.session.userId!));

    res.json({
      transactions: transactions.map(t => ({
        id: t.id,
        gameType: t.gameType,
        betAmount: parseFloat(t.betAmount),
        result: t.result,
        payout: parseFloat(t.payout),
        multiplier: t.multiplier ? parseFloat(t.multiplier) : null,
        timestamp: t.timestamp.toISOString()
      })),
      total: total.length
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Failed to get transactions' });
  }
});

export { router as transactionRoutes };