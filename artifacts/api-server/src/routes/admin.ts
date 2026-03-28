import { Router } from 'express';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

// Admin routes will be implemented as needed
router.get('/test', requireAdmin, (req, res) => {
  res.json({ message: 'Admin access granted' });
});

export { router as adminRoutes };