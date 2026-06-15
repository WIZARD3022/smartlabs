import { execFile } from 'child_process';
import path from 'path';
import process from 'process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

export async function getBambuStatus(printer) {
  if (!printer.ipAddress || !printer.serialNumber || !printer.accessCode) {
    throw new Error('Configure the printer IP, serial number, and access code before syncing');
  }

  const scriptPath = path.resolve('backend/scripts/bambu_status.py');
  const pythonCommand = process.env.PYTHON_COMMAND || 'python';
  const { stdout } = await execFileAsync(pythonCommand, [scriptPath], {
    env: {
      ...process.env,
      BAMBU_IP: printer.ipAddress,
      BAMBU_SERIAL: printer.serialNumber,
      BAMBU_ACCESS_CODE: printer.accessCode,
    },
    timeout: 15000,
  });

  return JSON.parse(stdout);
}
