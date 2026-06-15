import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import { hashToken } from '../utils/tokenHash.js';
import { PUBLIC_REGISTER_ROLES, ROLES } from '../constants/roles.js';
import { query } from '../config/db.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/api/auth',
};

const toPublicUser = (user) => ({
  id: user.id,
  email: user.email,
  role: user.role,
  first_name: user.first_name,
  last_name: user.last_name,
  phone: user.phone ?? null,
  profile_image: user.profile_image ?? null,
  created_at: user.created_at,
});

const generateTokens = (user) => {
  const payload = { id: user.id, role: user.role, email: user.email };
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  });
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });
  return { accessToken, refreshToken };
};

const persistRefreshToken = async (userId, refreshToken) => {
  const decoded = jwt.decode(refreshToken);
  const expiresAt = new Date(decoded.exp * 1000);
  await User.saveRefreshToken(userId, hashToken(refreshToken), expiresAt);
};

const setRefreshCookie = (res, refreshToken) => {
  res.cookie('refreshToken', refreshToken, cookieOptions);
};

const validateRegistration = ({ email, password, firstName, lastName }) => {
  if (!email?.trim() || !password) {
    return 'Email and password are required';
  }
  if (!EMAIL_REGEX.test(email.trim())) {
    return 'Invalid email address';
  }
  if (password.length < 8) {
    return 'Password must be at least 8 characters';
  }
  if (!firstName?.trim() || !lastName?.trim()) {
    return 'First name and last name are required';
  }
  return null;
};

export const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, accountType } = req.body;

    const validationError = validateRegistration({
      email,
      password,
      firstName,
      lastName,
    });
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const requestedRole =
      accountType === 'seller' ? ROLES.SELLER : ROLES.CUSTOMER;
    if (!PUBLIC_REGISTER_ROLES.includes(requestedRole)) {
      return res.status(400).json({ error: 'Invalid account type' });
    }

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const newUser = await User.create({
      email,
      password,
      firstName,
      lastName,
      role: requestedRole,
    });

    const { accessToken, refreshToken } = generateTokens(newUser);
    await persistRefreshToken(newUser.id, refreshToken);
    setRefreshCookie(res, refreshToken);

    res.status(201).json({ user: toPublicUser(newUser), accessToken });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const { accessToken, refreshToken } = generateTokens(user);
    await persistRefreshToken(user.id, refreshToken);
    setRefreshCookie(res, refreshToken);

    res.json({ user: toPublicUser(user), accessToken });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
};

export const logout = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (token) {
      await User.deleteRefreshToken(hashToken(token));
    }
    if (req.user?.id) {
      await User.deleteAllRefreshTokens(req.user.id);
    }
    res.clearCookie('refreshToken', { ...cookieOptions, maxAge: 0 });
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.clearCookie('refreshToken', { ...cookieOptions, maxAge: 0 });
    res.json({ message: 'Logged out successfully' });
  }
};

export const refreshTokenHandler = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) {
    return res.status(401).json({ error: 'Refresh token not found' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const stored = await User.findRefreshToken(hashToken(token));

    if (!stored || stored.user_id !== decoded.id) {
      res.clearCookie('refreshToken', { ...cookieOptions, maxAge: 0 });
      return res.status(403).json({ error: 'Invalid or expired refresh token' });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      res.clearCookie('refreshToken', { ...cookieOptions, maxAge: 0 });
      return res.status(403).json({ error: 'User not found' });
    }

    const payload = { id: user.id, role: user.role, email: user.email };
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    });

    res.json({ accessToken, user: toPublicUser(user) });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.clearCookie('refreshToken', { ...cookieOptions, maxAge: 0 });
    res.status(403).json({ error: 'Invalid or expired refresh token' });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(toPublicUser(user));
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone } = req.body;

    if (firstName !== undefined && !firstName?.trim()) {
      return res.status(400).json({ error: 'First name cannot be empty' });
    }
    if (lastName !== undefined && !lastName?.trim()) {
      return res.status(400).json({ error: 'Last name cannot be empty' });
    }

    const user = await User.updateProfile(req.user.id, {
      firstName,
      lastName,
      phone,
    });

    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(toPublicUser(user));
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone || !phone.trim()) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const trimmedPhone = phone.trim();
    // Generate 6 digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes TTL

    // Clear old OTPs for this phone
    await query('DELETE FROM otp_verifications WHERE phone = $1', [trimmedPhone]);

    // Insert new OTP
    await query('INSERT INTO otp_verifications (phone, code, expires_at) VALUES ($1, $2, $3)', [trimmedPhone, code, expiresAt]);

    // In a real application, call Twilio API here. For now, log and return code.
    console.log(`[MOCK OTP] Verification code for ${trimmedPhone}: ${code}`);

    const twilioConfigured = !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN);
    res.json({
      message: 'OTP sent successfully',
      phone: trimmedPhone,
      ...(twilioConfigured ? {} : { code }) // Return code for easy frontend testing when mock is active
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ error: 'Server error sending OTP' });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { phone, code } = req.body;
    if (!phone || !code) {
      return res.status(400).json({ error: 'Phone and code are required' });
    }

    const trimmedPhone = phone.trim();
    const trimmedCode = code.trim();

    // Verify OTP
    const otpRes = await query(
      'SELECT * FROM otp_verifications WHERE phone = $1 AND code = $2 AND expires_at > CURRENT_TIMESTAMP',
      [trimmedPhone, trimmedCode]
    );

    if (otpRes.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired OTP code' });
    }

    // Delete verification record
    await query('DELETE FROM otp_verifications WHERE phone = $1', [trimmedPhone]);

    // Check if user exists with this phone
    let user = await User.findByPhone(trimmedPhone);

    if (!user) {
      // If user does not exist, auto-register them
      const defaultEmail = `${trimmedPhone}@one8.com`;
      const tempPassword = Math.random().toString(36).substring(2, 10);
      
      user = await User.create({
        email: defaultEmail,
        password: tempPassword,
        firstName: 'OTP',
        lastName: 'User',
        role: 'CUSTOMER'
      });

      // Update phone field
      await User.updateProfile(user.id, { phone: trimmedPhone });
      user = await User.findById(user.id);
    }

    // Generate tokens and log in
    const { accessToken, refreshToken } = generateTokens(user);
    await persistRefreshToken(user.id, refreshToken);
    setRefreshCookie(res, refreshToken);

    res.json({ user: toPublicUser(user), accessToken });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: 'Server error verifying OTP' });
  }
};
