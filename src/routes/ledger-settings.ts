import { Router, Request, Response } from 'express';
import { LedgerSettings } from '../models/LedgerSettings';

const router = Router();

// Get settings or initialize default
router.get('/', async (_req: Request, res: Response) => {
  try {
    let settings = await LedgerSettings.findOne();
    if (!settings) {
      settings = new LedgerSettings({
        cashOpeningBalance: 0,
        onlineOpeningBalance: 0,
        customCategories: [],
      });
      await settings.save();
    }
    res.json(settings);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch ledger settings' });
  }
});

// Update settings
router.put('/', async (req: Request, res: Response) => {
  try {
    let settings = await LedgerSettings.findOne();
    if (!settings) {
      settings = new LedgerSettings(req.body);
    } else {
      Object.assign(settings, req.body);
    }
    await settings.save();
    res.json(settings);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to update ledger settings' });
  }
});

export default router;
