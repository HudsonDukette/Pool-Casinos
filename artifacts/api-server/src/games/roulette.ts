import { Request, Response } from 'express';
import { db, usersTable, poolTable, betsTable } from '@workspace/db';
import { eq } from 'drizzle-orm';
import { PlayRouletteBody } from '@workspace/api-zod';

export async function playRoulette(req: Request, res: Response) {
  try {
    const body = PlayRouletteBody.parse(req.body);
    const { betAmount, color } = body;
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

    // Generate result
    const random = Math.random();
    const won = random < winChance;

    // Roulette specific logic
    const resultNumber = Math.floor(Math.random() * 37); // 0-36
    let resultColor: string;
    
    if (resultNumber === 0) {
      resultColor = 'green';
    } else if ([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36].includes(resultNumber)) {
      resultColor = 'red';
    } else {
      resultColor = 'black';
    }

    // Determine if player won based on color choice
    const colorWon = (color === 'red' && resultColor === 'red') || 
                     (color === 'black' && resultColor === 'black') ||
                     (color === 'green' && resultColor === 'green');

    const actualWon = colorWon && won;
    const multiplier = color === 'green' ? 14 : 1.95; // Green pays more but is rarer
    const payout = actualWon ? betAmount * multiplier : 0;
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
      totalWins: actualWon ? (parseInt(user.totalWins) + 1).toString() : user.totalWins,
      totalLosses: actualWon ? user.totalLosses : (parseInt(user.totalLosses) + 1).toString(),
      currentStreak: actualWon ? (parseInt(user.currentStreak) + 1).toString() : '0',
      winStreak: actualWon ? Math.max(parseInt(user.winStreak), parseInt(user.currentStreak) + 1).toString() : user.winStreak,
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
      gameType: 'roulette',
      betAmount: betAmount.toString(),
      result: actualWon ? 'win' : 'loss',
      payout: payout.toString(),
      multiplier: multiplier.toString()
    });

    res.json({
      won: actualWon,
      resultColor,
      resultNumber,
      betAmount,
      payout,
      newBalance: newUserBalance,
      winChance: Math.round(winChance * 10000) / 100 // Convert to percentage with 2 decimals
    });

  } catch (error) {
    console.error('Roulette error:', error);
    res.status(500).json({ error: 'Game error' });
  }
}