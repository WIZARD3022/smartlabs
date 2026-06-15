import express from 'express';
import Printer from '../models/Printer.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const printers = await Printer.find();
  res.json({ printers });
});

router.get('/:printerId', async (req, res) => {
  const printer = await Printer.findOne({ id: req.params.printerId });
  if (!printer) {
    return res.status(404).json({ message: 'Printer not found' });
  }

  res.json({ printer });
});

router.post('/:printerId/control', async (req, res) => {
  const printer = await Printer.findOne({ id: req.params.printerId });
  const { action } = req.body;

  if (!printer) {
    return res.status(404).json({ message: 'Printer not found' });
  }

  if (!action) {
    return res.status(400).json({ message: 'Action is required' });
  }

  const updates = {};
  switch (action) {
    case 'start':
      updates.status = 'Printing';
      updates.progress = Math.max(printer.progress || 0, 8);
      updates.timeRemaining = printer.estimatedTime || '2h 10m';
      updates.statusMessage = 'Print started';
      updates.currentFile = printer.currentFile || 'Unknown print file';
      updates.fileInfo = printer.fileInfo || 'Layer 1 / TBD';
      break;
    case 'pause':
      updates.status = 'Paused';
      updates.statusMessage = 'Print paused';
      break;
    case 'stop':
      updates.status = 'Available';
      updates.progress = 0;
      updates.timeRemaining = '-';
      updates.currentFile = '-';
      updates.estimatedTime = '-';
      updates.statusMessage = 'Printer idle';
      updates.fileInfo = 'No active file';
      break;
    default:
      return res.status(400).json({ message: 'Invalid action' });
  }

  const updatedPrinter = await Printer.findOneAndUpdate({ id: req.params.printerId }, updates, {
    new: true,
  });

  res.json({ printer: updatedPrinter });
});

router.post('/add', async (req, res) => {
  try {
    const printer = await Printer.create(req.body);
    res.json(printer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const printer = await Printer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!printer) return res.status(404).json({ error: 'Printer not found' });
    res.json(printer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const printer = await Printer.findByIdAndDelete(req.params.id);
    if (!printer) return res.status(404).json({ error: 'Printer not found' });
    res.json({ message: 'Printer deleted', printer });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
