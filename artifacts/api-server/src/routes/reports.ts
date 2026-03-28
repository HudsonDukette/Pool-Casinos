import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Report routes will be implemented as needed
router.get('/test', requireAuth, (req, res) => {
  res.json({ message: 'Reports endpoint' });
});

export { router as reportRoutes };