import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import sendOTPEmail from './Mail.js';
import { Registration, Completion, PasswordReset } from '../data/Email-Data.js';

const router = express.Router();

// REGISTER USER
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, code } = req.body;

    if (!req.session.registrationCode) {
      console.log('Registration code expired for email:', email);
      return res.status(400).json({ message: 'Registration code expired.' });
    }

    if (req.session.registrationCode != code) {
      return res.status(400).json({ message: 'Invalid registration code' });
    }

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }else if (/\s/.test(password)) {
      return res.status(400).json({
        message: "Password cannot contain spaces."
      });
    }else if (!/[a-z]/.test(password)) {
      return res.status(400).json({
        message: "Password must contain at least one lowercase letter."
      });
    }else if (!/[A-Z]/.test(password)) {
      return res.status(400).json({
        message: "Password must contain at least one uppercase letter."
      });
    }else if (!/\d/.test(password)) {
      return res.status(400).json({
        message: "Password must contain at least one number."
      });
    }else if (!/[!@#$%^&*()_\-+=\[\]{};:'",.<>/?\\|`~]/.test(password)) {
      return res.status(400).json({
        message: "Password must contain at least one special character."
      });
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
    const subject = 'Your Registration for SmartLab is Completed';
    await sendOTPEmail(email, subject, Completion());
    console.log(`Registration completion email sent to ${email}`);
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
    await sendOTPEmail(user.email, subject, PasswordReset(code));
    setTimeout(async () => {
      user.resetCode = undefined;
      await user.save();
    }, 5 * 60 * 1000); // Clear the code after 10 minutes
    user.resetCode = code;
    await user.save();
    console.log(`Reset code sent to ${user.email}`);
    res.json({ message: 'Verification code sent to your email.' });
  } catch (error) {
    console.error('Send reset code error:', error);
    res.status(500).json({ message: 'Failed to send verification code.' });
  }
});

// LOGIN USER
router.post('/login', async (req, res) => {
  try {
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

router.post('/send-registration-code', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      console.log('Email is required');
      return res.status(400).json({ message: 'Email is required' });
    }

    if (!email.includes("@gmail.com")){
      console.log('Invalid email format:', email);
      return res.status(400).json({ message: 'Invalid email' });
    }

    // Generate a random 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const subject = 'Your Registration Code';
    await sendOTPEmail(email, subject, Registration(code));
    console.log(`Registration code sent to ${email}`);
    setTimeout(async () => {
      req.session.registrationCode = null;
    }, 10 * 60 * 1000); // Clear the code after 10 minutes
    req.session.registrationCode = code;
    res.json({ message: 'Registration code sent to your email.' });
  } catch (error) {
    console.error('Send registration code error:', error);
    res.status(500).json({ message: 'Failed to send registration code.' });
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
