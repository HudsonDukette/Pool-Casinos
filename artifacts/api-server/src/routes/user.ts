import { Router } from 'express';
import { db, usersTable } from '@workspace/db';
import { eq } from 'drizzle-orm';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Get user stats
router.get('/stats', requireAuth, async (req, res) => {
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId!)).limit(1);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      totalProfit: parseFloat(user.totalProfit),
      biggestWin: parseFloat(user.biggestWin),
      biggestBet: parseFloat(user.biggestBet),
      gamesPlayed: parseInt(user.gamesPlayed),
      winStreak: parseInt(user.winStreak),
      currentStreak: parseInt(user.currentStreak),
      totalWins: parseInt(user.totalWins),
      totalLosses: parseInt(user.totalLosses),
      lastDailyClaim: user.lastDailyClaim?.toISOString() || null,
      balance: parseFloat(user.balance)
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

// Claim daily reward
router.post('/claim-daily', requireAuth, async (req, res) => {
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId!)).limit(1);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const now = new Date();
    const lastClaim = user.lastDailyClaim;

    // Check if already claimed today
    if (lastClaim) {
      const timeDiff = now.getTime() - lastClaim.getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      if (hoursDiff < 24) {
        return res.status(400).json({ error: 'Daily reward already claimed' });
      }
    }

    const reward = 500;
    const newBalance = parseFloat(user.balance) + reward;

    await db.update(usersTable)
      .set({
        balance: newBalance.toString(),
        lastDailyClaim: now
      })
      .where(eq(usersTable.id, req.session.userId!));

    res.json({
      reward,
      newBalance,
      message: 'Daily reward claimed!'
    });
  } catch (error) {
    console.error('Claim daily error:', error);
    res.status(500).json({ error: 'Failed to claim daily reward' });
  }
});

export { router as userRoutes };