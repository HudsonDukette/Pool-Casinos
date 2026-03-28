import { Router } from 'express';
import { db, poolTable, betsTable, usersTable } from '@workspace/db';
import { desc, sql } from 'drizzle-orm';

const router = Router();

// Get pool info
router.get('/', async (req, res) => {
  try {
    // Get or create pool
    let [pool] = await db.select().from(poolTable).limit(1);
    if (!pool) {
      [pool] = await db.insert(poolTable).values({}).returning();
    }

    // Get recent big bets (>$100)
    const recentBigBets = await db
      .select({
        username: usersTable.username,
        betAmount: betsTable.betAmount,
        gameType: betsTable.gameType,
        result: betsTable.result,
        payout: betsTable.payout,
        timestamp: betsTable.timestamp
      })
      .from(betsTable)
      .innerJoin(usersTable, sql`${betsTable.userId} = ${usersTable.id}`)
      .where(sql`${betsTable.betAmount} >= 100`)
      .orderBy(desc(betsTable.timestamp))
      .limit(10);

    const maxBet = Math.min(parseFloat(pool.totalAmount) * 0.1, 50000);

    res.json({
      totalAmount: parseFloat(pool.totalAmount),
      biggestWin: parseFloat(pool.biggestWin),
      biggestBet: parseFloat(pool.biggestBet),
      maxBet,
      recentBigBets: recentBigBets.map(bet => ({
        ...bet,
        betAmount: parseFloat(bet.betAmount),
        payout: parseFloat(bet.payout),
        timestamp: bet.timestamp.toISOString()
      }))
    });
  } catch (error) {
    console.error('Get pool error:', error);
    res.status(500).json({ error: 'Failed to get pool info' });
  }
});

export { router as poolRoutes };