import { Router } from 'express';

const router = Router();

// VAPID key endpoint
router.post('/vapid-key', (req, res) => {
  res.json({
    publicKey: process.env.VAPID_PUBLIC_KEY || 'BLKPQswCZ4UTJyjUaejIxf9e6VE5a6Bsit-yrggKGY3Bs0BMet4UatL-NFca37p0RRxORrS1cZ5o5I0WTfiiAic'
  });
});

export { router as pushRoutes };