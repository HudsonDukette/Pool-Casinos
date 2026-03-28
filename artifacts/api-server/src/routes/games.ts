import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { playRoulette } from '../games/roulette.js';
import { playPlinko } from '../games/plinko.js';

const router = Router();

// Roulette
router.post('/roulette', requireAuth, playRoulette);

// Plinko
router.post('/plinko', requireAuth, playPlinko);

export { router as gameRoutes };