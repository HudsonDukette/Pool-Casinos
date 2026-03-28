import { Router } from 'express';
import { db, usersTable, betsTable } from '@workspace/db';
import { desc, sql } from 'drizzle-orm';

const router = Router();

// Richest players
router.get('/richest', async (req, res) => {
  try {
    const richest = await db
      .select({
        username: usersTable.username,
        balance: usersTable.balance
      })
      .from(usersTable)
      .where(sql`${usersTable.permanentlyBanned} = false`)
      .orderBy(desc(usersTable.balance))
      .limit(10);

    res.json({
      entries: richest.map((player, index) => ({
        rank: index + 1,
        username: player.username,
        value: parseFloat(player.balance),
        label: `$${parseFloat(player.balance).toLocaleString()}`
      }))
    });
  } catch (error) {
    console.error('Get richest error:', error);
    res.status(500).json({ error: 'Failed to get richest players' });
  }
});

// Biggest winners
router.get('/biggest-winners', async (req, res) => {
  try {
    const winners = await db
      .select({
        username: usersTable.username,
        biggestWin: usersTable.biggestWin
      })
      .from(usersTable)
      .where(sql`${usersTable.permanentlyBanned} = false AND ${usersTable.biggestWin} > 0`)
      .orderBy(desc(usersTable.biggestWin))
      .limit(10);

    res.json({
      entries: winners.map((player, index) => ({
        rank: index + 1,
        username: player.username,
        value: parseFloat(player.biggestWin),
        label: `$${parseFloat(player.biggestWin).toLocaleString()}`
      }))
    });
  } catch (error) {
    console.error('Get biggest winners error:', error);
    res.status(500).json({ error: 'Failed to get biggest winners' });
  }
});

// Biggest bettors
router.get('/biggest-bettors', async (req, res) => {
  try {
    const bettors = await db
      .select({
        username: usersTable.username,
        biggestBet: usersTable.biggestBet
      })
      .from(usersTable)
      .where(sql`${usersTable.permanentlyBanned} = false AND ${usersTable.biggestBet} > 0`)
      .orderBy(desc(usersTable.biggestBet))
      .limit(10);

    res.json({
      entries: bettors.map((player, index) => ({
        rank: index + 1,
        username: player.username,
        value: parseFloat(player.biggestBet),
        label: `$${parseFloat(player.biggestBet).toLocaleString()}`
      }))
    });
  } catch (error) {
    console.error('Get biggest bettors error:', error);
    res.status(500).json({ error: 'Failed to get biggest bettors' });
  }
});

// Recent big wins
router.get('/recent-big-wins', async (req, res) => {
  try {
    const recentWins = await db
      .select({
        username: usersTable.username,
        payout: betsTable.payout,
        betAmount: betsTable.betAmount,
        gameType: betsTable.gameType,
        multiplier: betsTable.multiplier,
        timestamp: betsTable.timestamp
      })
      .from(betsTable)
      .innerJoin(usersTable, sql`${betsTable.userId} = ${usersTable.id}`)
      .where(sql`${betsTable.payout} > ${betsTable.betAmount} AND ${betsTable.payout} >= 1000`)
      .orderBy(desc(betsTable.timestamp))
      .limit(20);

    res.json({
      wins: recentWins.map(win => ({
        username: win.username,
        payout: parseFloat(win.payout),
        betAmount: parseFloat(win.betAmount),
        gameType: win.gameType,
        multiplier: win.multiplier ? parseFloat(win.multiplier) : null,
        timestamp: win.timestamp.toISOString()
      }))
    });
  } catch (error) {
    console.error('Get recent big wins error:', error);
    res.status(500).json({ error: 'Failed to get recent big wins' });
  }
});

export { router as leaderboardRoutes };