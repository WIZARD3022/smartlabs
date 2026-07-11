import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import User from './models/User.js';
import session from "express-session";

import authRoutes from './routes/auth.js';
import materialRoutes from './routes/materials.js';
import bookingRoutes from './routes/bookings.js';
import uploadRoutes from './routes/upload.js';
import printerRoutes from './routes/printers.js';
import quoteRoutes from './routes/quote.js';
import liveRoutes from './routes/live.js';
import userRoutes from './routes/users.js';
import Printer from './models/Printer.js';
import Material from './models/Material.js';
import printerCatalog from './data/printerCatalog.js';
import CaptchaRoutes from './routes/Captcha.js';

const app = express();
const uploadsDirectory = path.resolve('uploads');

if (!fs.existsSync(uploadsDirectory)) {
  fs.mkdirSync(uploadsDirectory, { recursive: true });
}

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(uploadsDirectory));
app.use(
    session({
        secret: "mysecretkey",
        resave: false,
        saveUninitialized: true,
        cookie: {
            maxAge: 1000 * 60 * 10, // 10 minutes
        },
    })
);


// MongoDB Connection
mongoose
  .connect('mongodb://127.0.0.1:27017/smartlab')
  .then(async () => {
    console.log('✅ MongoDB Connected Successfully');
    await seedAdminUser();
    await seedPrinterData();
    await seedPrinterCatalog();
    await seedMaterialData();
  })
  .catch((err) => {
    console.log('❌ MongoDB Connection Error');
    console.error(err);
  });

async function seedAdminUser() {
  const adminEmail = 'admin@smartlab.com';
  const existingAdmin = await User.findOne({ email: adminEmail });
  const hashedPassword = await bcrypt.hash('admin123', 10);

  if (existingAdmin) {
    const storedPassword = existingAdmin.password || '';
    if (!storedPassword.startsWith('$2')) {
      existingAdmin.password = hashedPassword;
      await existingAdmin.save();
      console.log('✅ Existing admin password normalized to bcrypt hash');
    } else {
      console.log('✅ Admin user already exists');
    }
    return;
  }

  await User.create({
    name: 'Admin',
    email: adminEmail,
    password: hashedPassword,
    role: 'admin'
  });

  console.log(`✅ Default admin user created: ${adminEmail} / admin123`);
}

async function seedPrinterData() {
  const count = await Printer.countDocuments();
  if (count > 0) {
    console.log('✅ Printers already seeded');
    return;
  }

  const printers = [
    {
      id: 'x1-carbon',
      name: 'Bambu Lab X1 Carbon',
      status: 'Available',
      progress: 0,
      eta: '-',
      nozzleTemp: '26°C',
      bedTemp: '28°C',
      lastJob: 'Idle',
      connection: 'Local Network',
      cameraStream: 'https://via.placeholder.com/720x405?text=Live+Camera+Feed',
      timeRemaining: '-',
      currentFile: '-',
      estimatedTime: '-',
      statusMessage: 'Ready for new job',
      fileInfo: 'No active file',
      user: '',
    },
    {
      id: 'p1s-combo',
      name: 'Bambu Lab P1S Combo',
      status: 'Printing',
      progress: 47,
      eta: '1h 28m',
      nozzleTemp: '215°C',
      bedTemp: '60°C',
      lastJob: 'Enclosure revision',
      connection: 'Moonraker API',
      cameraStream: 'https://via.placeholder.com/720x405?text=Live+Camera+Feed',
      timeRemaining: '1h 28m',
      currentFile: 'Enclosure revision.stl',
      estimatedTime: '1h 28m',
      statusMessage: 'Print in progress',
      fileInfo: 'Layer 152 / 340',
      user: 'Research Team',
    },
    {
      id: 'a1-multi',
      name: 'Bambu Lab A1 Multi-Color',
      status: 'Paused',
      progress: 34,
      eta: '2h 56m',
      nozzleTemp: '185°C',
      bedTemp: '55°C',
      lastJob: 'Color test print',
      connection: 'Local Network',
      cameraStream: 'https://via.placeholder.com/720x405?text=Live+Camera+Feed',
      timeRemaining: '2h 56m',
      currentFile: 'Color test print.stl',
      estimatedTime: '2h 56m',
      statusMessage: 'Paused for filament swap',
      fileInfo: 'Layer 98 / 210',
      user: 'QA Team',
    },
  ];

  await Printer.insertMany(printers);
  console.log('✅ Default printers seeded');
}

async function seedPrinterCatalog() {
  await Promise.all(
    printerCatalog.map((printer) =>
      Printer.findOneAndUpdate(
        { id: printer.id },
        { $setOnInsert: { ...printer, status: 'Available' } },
        { upsert: true },
      ),
    ),
  );
  console.log('Printer catalog synchronized');
}

async function seedMaterialData() {
  const count = await Material.countDocuments();
  if (count > 0) {
    console.log('✅ Materials already seeded');
    return;
  }

  const materials = [
    { name: 'PLA+', color: 'White', stock: 12, pricePerKg: 1200 },
    { name: 'PETG', color: 'Black', stock: 8, pricePerKg: 1450 },
    { name: 'TPU', color: 'Red', stock: 4, pricePerKg: 2200 },
    { name: 'ABS', color: 'Grey', stock: 6, pricePerKg: 1700 },
  ];

  await Material.insertMany(materials);
  console.log('✅ Default materials seeded');
}

// Test Route
app.get('/', (req, res) => {
  res.send('Backend Running Successfully');
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/printers', printerRoutes);
app.use('/api/quote', quoteRoutes);
app.use('/api/live', liveRoutes);
app.use("/api/captcha", CaptchaRoutes);

// Start Server
app.listen(5000, () => {
  console.log('🚀 Server running on port 5000');
});
