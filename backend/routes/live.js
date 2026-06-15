import express from 'express';
import Printer from '../models/Printer.js';

const router = express.Router();

router.get('/:printerId', async (req, res) => {
  const printer = await Printer.findOne({ id: req.params.printerId });

  if (!printer) {
    return res.status(404).json({ message: 'Printer not found' });
  }

  res.json({ printer });
});

export default router;
