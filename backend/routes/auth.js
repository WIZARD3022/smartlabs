import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import sendOTPEmail from './Mail.js';

const router = express.Router();

// REGISTER USER
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: 'client'
    });

    req.session.userId = user._id;
    req.session.userRole = user.role;

    res.status(201).json({
      message: 'Account created successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Register error:', error.message);
    res.status(500).json({ message: 'Unable to create account' });
  }
});

router.post('/send-reset-code', async (req, res) => {
  console.log('Send reset code route hit with body:', req.body.email);
  try {
    const { email } = req.body;

    if (!email) {

      console.log('Email is required');
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if (!user) {
      console.log('User not found for email:', email);
      return res.status(400).json({ message: 'User not found' });
    }
    // Generate a random 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const subject = 'Your Password Reset Code';
    const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Verification Code</title></head><body style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7fb;padding:40px 15px;"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 5px 20px rgba(0,0,0,.08);"><!-- Header --><tr><td align="center" style="background:#2563eb;padding:30px;"><h1 style="color:#ffffff;margin:0;font-size:28px;">SmartLabs</h1><p style="color:#dbeafe;margin:10px 0 0;">Email Verification</p></td></tr><!-- Body --><tr><td style="padding:40px 35px;"><h2 style="margin-top:0;color:#1e293b;">Verify Your Email</h2><p style="font-size:16px;line-height:26px;color:#475569;">Hello,</p><p style="font-size:16px;line-height:26px;color:#475569;">We received a request to verify your email address.Use the One-Time Password (OTP) below to continue.</p><!-- OTP --><table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:30px 0;"><div style="display:inline-block;background:#eff6ff;border:2px dashed #2563eb;color:#2563eb;font-size:36px;letter-spacing:10px;font-weight:bold;padding:18px 35px;border-radius:10px;">${code}</div></td></tr></table><p style="font-size:16px;color:#475569;line-height:26px;">This verification code is valid for<strong>10 minutes</strong>.</p><p style="font-size:16px;color:#475569;line-height:26px;">If you didn't request this verification, you can safely ignore this email.</p></td></tr><!-- Divider --><tr><td style="padding:0 35px;"><hr style="border:none;border-top:1px solid #e2e8f0;"></td></tr><!-- Footer --><tr><td align="center" style="padding:30px;color:#64748b;font-size:14px;line-height:24px;"><strong>SmartLabs Team</strong><br><br>This is an automated email. Please do not reply.<br><br>© 2026 SmartLabs. All rights reserved.</td></tr></table></td></tr></table></body></html>`;
    await sendOTPEmail(user.email, subject, html);
    setTimeout(async () => {
      user.resetCode = undefined;
      await user.save();
      console.log(`Reset code for ${user.email} cleared after 10 minutes`);
    }, 5 * 60 * 1000); // Clear the code after 10 minutes
    user.resetCode = code;
    await user.save();
    console.log(`Reset code sent to ${user.email}: ${code}`);
    res.json({ message: 'Verification code sent to your email.' });
  } catch (error) {
    console.error('Send reset code error:', error);
    res.status(500).json({ message: 'Failed to send verification code.' });
  }
});

// LOGIN USER
router.post('/login', async (req, res) => {
  try {
    console.log('Login route hit with body:', req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required'
      });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if (!user) {
      return res.status(400).json({
        message: 'User not found'
      });
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return res.status(400).json({
        message: 'Invalid password'
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role
      },
      'SECRET_KEY',
      {
        expiresIn: '7d'
      }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: error.message
    });
  }
});


router.post('/reset-password', async (req, res) => {
  try {
    const { email, code, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found for email:', email);
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.resetCode != code) {
      console.log('Invalid reset code for user:', email);
      return res.status(400).json({ message: 'Invalid reset code.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.resetCode = undefined;
    await user.save();
    console.log(`Password succesfully reset for user: ${email}`);
    res.json({ message: 'Password reset successfully.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Failed to reset password.' });
  }
});

export default router;
