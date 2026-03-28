import { Request, Response } from 'express';
import { db, usersTable, poolTable, betsTable } from '@workspace/db';
import { eq } from 'drizzle-orm';
import { PlayPlinkoBody } from '@workspace/api-zod';

const MULTIPLIERS = {
  low: [0.5, 1, 1.5, 2, 2.5, 2, 1.5, 1, 0.5],
  medium: [0.3, 0.5, 1, 2, 5, 2, 1, 0.5, 0.3],
  high: [0.2, 0.3, 0.5, 2, 10, 2, 0.5, 0.3, 0.2]
};

export async function playPlinko(req: Request, res: Response) {
  try {
    const body = PlayPlinkoBody.parse(req.body);
    const { betAmount, risk } = body;
    const userId = req.session.userId!;

    // Validate bet amount
    if (betAmount < 0.01) {
      return res.status(400).json({ error: 'Minimum bet is $0.01' });
    }

    // Get user and pool
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    const [pool] = await db.select().from(poolTable).limit(1);

    if (!user || !pool) {
      return res.status(400).json({ error: 'User or pool not found' });
    }

    const userBalance = parseFloat(user.balance);
    const poolAmount = parseFloat(pool.totalAmount);

    if (betAmount > userBalance) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    const maxBet = Math.min(poolAmount * 0.1, 50000);
    if (betAmount > maxBet) {
      return res.status(400).json({ error: `Maximum bet is $${maxBet.toLocaleString()}` });
    }

    // Calculate win probability based on bet size
    const winChance = Math.max(0.0001, Math.min(0.9999, 1 - Math.pow(betAmount / poolAmount * 10, 0.4)));

    // Simulate plinko physics (simplified)
    const multipliers = MULTIPLIERS[risk];
    const slot = Math.floor(Math.random() * multipliers.length);
    const multiplier = multipliers[slot];

    // Generate simple path for animation
    const path = [];
    let x = 0;
    for (let y = 0; y < 10; y++) {
      x += (Math.random() - 0.5) * 2;
      path.push({ x: Math.max(-4, Math.min(4, x)), y });
    }

    const won = Math.random() < winChance;
    const actualMultiplier = won ? multiplier : Math.min(multiplier, 0.95); // Slight house edge
    const payout = betAmount * actualMultiplier;
    const profit = payout - betAmount;

    // Update balances
    const newUserBalance = userBalance + profit;
    const newPoolAmount = poolAmount - profit;

    await db.update(usersTable).set({
      balance: newUserBalance.toString(),
      totalProfit: (parseFloat(user.totalProfit) + profit).toString(),
      biggestWin: Math.max(parseFloat(user.biggestWin), payout).toString(),
      biggestBet: Math.max(parseFloat(user.biggestBet), betAmount).toString(),
      gamesPlayed: (parseInt(user.gamesPlayed) + 1).toString(),
      totalWins: profit > 0 ? (parseInt(user.totalWins) + 1).toString() : user.totalWins,
      totalLosses: profit > 0 ? user.totalLosses : (parseInt(user.totalLosses) + 1).toString(),
      currentStreak: profit > 0 ? (parseInt(user.currentStreak) + 1).toString() : '0',
      winStreak: profit > 0 ? Math.max(parseInt(user.winStreak), parseInt(user.currentStreak) + 1).toString() : user.winStreak,
      lastBetAt: new Date()
    }).where(eq(usersTable.id, userId));

    await db.update(poolTable).set({
      totalAmount: Math.max(0, newPoolAmount).toString(),
      biggestWin: Math.max(parseFloat(pool.biggestWin), payout).toString(),
      biggestBet: Math.max(parseFloat(pool.biggestBet), betAmount).toString()
    });

    // Log bet
    await db.insert(betsTable).values({
      userId,
      gameType: 'plinko',
      betAmount: betAmount.toString(),
      result: profit > 0 ? 'win' : 'loss',
      payout: payout.toString(),
      multiplier: actualMultiplier.toString()
    });

    res.json({
      won: profit > 0,
      multiplier: actualMultiplier,
      path,
      betAmount,
      payout,
      newBalance: newUserBalance,
      slot,
      winChance: Math.round(winChance * 10000) / 100
    });

  } catch (error) {
    console.error('Plinko error:', error);
    res.status(500).json({ error: 'Game error' });
  }
}