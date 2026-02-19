import { Router, Request, Response } from 'express';
import { scanWebsite } from '../services/scanService';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  // Allow up to 40s for browser-based scans
  req.socket.setTimeout(40000);

  try {
    const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;
    console.log(`[scan] Starting scan for: ${normalizedUrl}`);
    const results = await scanWebsite(normalizedUrl);
    console.log(`[scan] Completed — ${results.totalCount} elements found via ${results.scanMethod} scan`);
    res.json({ success: true, data: results });
  } catch (error: any) {
    console.error('[scan] Error:', error.message);
    res.status(500).json({
      error: 'Scan failed',
      message: error.message.includes('net::') || error.message.includes('ERR_')
        ? 'Could not reach the website. Check the URL and try again.'
        : error.message,
    });
  }
});

export default router;
