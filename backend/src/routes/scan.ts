import { Router, Request, Response } from 'express';
import { scanWebsite } from '../services/scanService';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const { url, depth = 'quick' } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;
    const results = await scanWebsite(normalizedUrl);
    res.json({ success: true, data: results });
  } catch (error: any) {
    console.error('Scan error:', error);
    res.status(500).json({ error: 'Scan failed', message: error.message });
  }
});

export default router;
