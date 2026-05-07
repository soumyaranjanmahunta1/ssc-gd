const express = require('express');
const router = express.Router();

// In-memory OTP store: email -> { otp, expiry }
const otpStore = new Map();

// Lazy-init Firebase Admin
let adminAuth = null;
function getAdminAuth() {
  if (adminAuth) return adminAuth;
  const admin = require('firebase-admin');
  if (!admin.apps.length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  }
  adminAuth = admin.auth();
  return adminAuth;
}

async function sendOtpEmail(to, subject, otp) {
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': process.env.BREVO_API_KEY,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: 'SSC GD App', email: process.env.BREVO_SENDER_EMAIL },
      to: [{ email: to }],
      subject,
      htmlContent: `
        <div style="font-family:Arial,sans-serif;max-width:420px;margin:auto;padding:24px;border:1px solid #eee;border-radius:12px;">
          <h2 style="color:#667eea;margin-bottom:8px;">SSC GD App</h2>
          <p style="color:#444;">Your OTP is:</p>
          <div style="font-size:36px;font-weight:700;letter-spacing:12px;color:#1a1d3b;margin:20px 0;">${otp}</div>
          <p style="color:#888;font-size:13px;">Valid for <strong>5 minutes</strong>. Do not share this with anyone.</p>
        </div>
      `,
    }),
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Brevo error: ${err}`);
  }
}

// POST /api/auth/send-otp
router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required.' });

    // Check user exists in Firebase
    try {
      await getAdminAuth().getUserByEmail(email.trim().toLowerCase());
    } catch {
      return res.status(404).json({ success: false, message: 'No account found with this email.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(email.trim().toLowerCase(), { otp, expiry: Date.now() + 5 * 60 * 1000 });

    await sendOtpEmail(email.trim(), 'Password Reset OTP - SSC GD', otp);

    res.json({ success: true, message: 'OTP sent to your email.' });
  } catch (err) {
    console.error('send-otp error:', err);
    res.status(500).json({ success: false, message: 'Failed to send OTP. Please try again.' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    const key = email.trim().toLowerCase();
    const record = otpStore.get(key);

    if (!record) return res.status(400).json({ success: false, message: 'OTP expired or not found. Please request a new one.' });
    if (Date.now() > record.expiry) {
      otpStore.delete(key);
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }
    if (record.otp !== otp.trim()) {
      return res.status(400).json({ success: false, message: 'Invalid OTP. Please check and try again.' });
    }

    const user = await getAdminAuth().getUserByEmail(key);
    await getAdminAuth().updateUser(user.uid, { password: newPassword });
    otpStore.delete(key);

    res.json({ success: true, message: 'Password reset successful. Please login with your new password.' });
  } catch (err) {
    console.error('reset-password error:', err);
    res.status(500).json({ success: false, message: 'Failed to reset password. Please try again.' });
  }
});

// POST /api/auth/send-signup-otp
router.post('/send-signup-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required.' });

    // Check email is NOT already registered
    try {
      await getAdminAuth().getUserByEmail(email.trim().toLowerCase());
      return res.status(409).json({ success: false, message: 'This email is already registered. Please login.' });
    } catch (e) {
      if (e.code !== 'auth/user-not-found') throw e;
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(`signup:${email.trim().toLowerCase()}`, { otp, expiry: Date.now() + 5 * 60 * 1000 });

    await sendOtpEmail(email.trim(), 'Verify Your Email - SSC GD', otp);

    res.json({ success: true, message: 'OTP sent to your email.' });
  } catch (err) {
    console.error('send-signup-otp error:', err);
    res.status(500).json({ success: false, message: 'Failed to send OTP. Please try again.' });
  }
});

// POST /api/auth/verify-signup-otp
router.post('/verify-signup-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ success: false, message: 'Email and OTP are required.' });

    const key = `signup:${email.trim().toLowerCase()}`;
    const record = otpStore.get(key);

    if (!record) return res.status(400).json({ success: false, message: 'OTP expired or not found. Please request a new one.' });
    if (Date.now() > record.expiry) {
      otpStore.delete(key);
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }
    if (record.otp !== otp.trim()) {
      return res.status(400).json({ success: false, message: 'Invalid OTP. Please check and try again.' });
    }

    otpStore.delete(key);
    res.json({ success: true, message: 'OTP verified.' });
  } catch (err) {
    console.error('verify-signup-otp error:', err);
    res.status(500).json({ success: false, message: 'Verification failed. Please try again.' });
  }
});

module.exports = router;
