import mongoose from 'mongoose';

const printerSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  status: { type: String, default: 'Available' },
  progress: { type: Number, default: 0 },
  eta: { type: String, default: '-' },
  nozzleTemp: { type: String, default: '25°C' },
  bedTemp: { type: String, default: '25°C' },
  lastJob: { type: String, default: 'Idle' },
  connection: { type: String, default: 'Local Network' },
  cameraStream: { type: String, default: 'https://via.placeholder.com/720x405?text=Live+Camera+Feed' },
  timeRemaining: { type: String, default: '-' },
  currentFile: { type: String, default: '-' },
  estimatedTime: { type: String, default: '-' },
  statusMessage: { type: String, default: 'Ready for new job' },
  fileInfo: { type: String, default: 'No active file' },
  user: { type: String, default: '' },
  inventoryCode: { type: String, default: '' },
  manufacturer: { type: String, default: '' },
  apiProvider: { type: String, default: 'manual' },
  ipAddress: { type: String, default: '' },
  serialNumber: { type: String, default: '' },
  accessCode: { type: String, default: '', select: false },
});

export default mongoose.model('Printer', printerSchema);
