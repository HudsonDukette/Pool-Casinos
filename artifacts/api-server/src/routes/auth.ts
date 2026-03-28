import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { db, usersTable } from '@workspace/db';
import { eq } from 'drizzle-orm';
import { LoginBody, RegisterBody } from '@workspace/api-zod';
import { generateReferralCode } from '../utils/referral.js';

const router = Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const body = RegisterBody.parse(req.body);
    const { username, password, email, referralCode } = body;

    // Check if username exists
    const existingUser = await db.select().from(usersTable).where(eq(usersTable.username, username)).limit(1);
    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Generate unique referral code
    const userReferralCode = await generateReferralCode();

    // Create user
    const [newUser] = await db.insert(usersTable).values({
      username,
      passwordHash,
      email: email || null,
      referralCode: userReferralCode,
      balance: referralCode ? '30000.00' : '10000.00' // Bonus for referred users
    }).returning();

    // Handle referral bonus
    if (referralCode) {
      const referrer = await db.select().from(usersTable).where(eq(usersTable.referralCode, referralCode)).limit(1);
      if (referrer.length > 0) {
        // Give referrer bonus
        await db.update(usersTable)
          .set({ balance: (parseFloat(referrer[0].balance) + 10000).toString() })
          .where(eq(usersTable.id, referrer[0].id));
      }
    }

    // Set session
    req.session.userId = newUser.id;

    const { passwordHash: _, ...userWithoutPassword } = newUser;
    res.json({
      user: {
        ...userWithoutPassword,
        balance: parseFloat(userWithoutPassword.balance),
        totalProfit: parseFloat(userWithoutPassword.totalProfit),
        biggestWin: parseFloat(userWithoutPassword.biggestWin),
        biggestBet: parseFloat(userWithoutPassword.biggestBet),
        gamesPlayed: parseInt(userWithoutPassword.gamesPlayed),
        winStreak: parseInt(userWithoutPassword.winStreak),
        currentStreak: parseInt(userWithoutPassword.currentStreak),
        totalWins: parseInt(userWithoutPassword.totalWins),
        totalLosses: parseInt(userWithoutPassword.totalLosses)
      },
      message: 'Registration successful'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const body = LoginBody.parse(req.body);
    const { username, password } = body;

    const [user] = await db.select().from(usersTable).where(eq(usersTable.username, username)).limit(1);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if user is banned
    if (user.permanentlyBanned) {
      return res.status(403).json({ error: 'Account permanently banned' });
    }

    if (user.bannedUntil && new Date(user.bannedUntil) > new Date()) {
      return res.status(403).json({ error: 'Account temporarily banned' });
    }

    req.session.userId = user.id;

    const { passwordHash: _, ...userWithoutPassword } = user;
    res.json({
      user: {
        ...userWithoutPassword,
        balance: parseFloat(userWithoutPassword.balance),
        totalProfit: parseFloat(userWithoutPassword.totalProfit),
        biggestWin: parseFloat(userWithoutPassword.biggestWin),
        biggestBet: parseFloat(userWithoutPassword.biggestBet),
        gamesPlayed: parseInt(userWithoutPassword.gamesPlayed),
        winStreak: parseInt(userWithoutPassword.winStreak),
        currentStreak: parseInt(userWithoutPassword.currentStreak),
        totalWins: parseInt(userWithoutPassword.totalWins),
        totalLosses: parseInt(userWithoutPassword.totalLosses)
      },
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ error: 'Login failed' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId)).limit(1);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const { passwordHash: _, ...userWithoutPassword } = user;
    res.json({
      ...userWithoutPassword,
      balance: parseFloat(userWithoutPassword.balance),
      totalProfit: parseFloat(userWithoutPassword.totalProfit),
      biggestWin: parseFloat(userWithoutPassword.biggestWin),
      biggestBet: parseFloat(userWithoutPassword.biggestBet),
      gamesPlayed: parseInt(userWithoutPassword.gamesPlayed),
      winStreak: parseInt(userWithoutPassword.winStreak),
      currentStreak: parseInt(userWithoutPassword.currentStreak),
      totalWins: parseInt(userWithoutPassword.totalWins),
      totalLosses: parseInt(userWithoutPassword.totalLosses)
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

export { router as authRoutes };