const { Router } = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');
const { getData, setData, updateData, pushData } = require('../db/firebase');
const { getOnboardingStatus } = require('../onboarding/wizard');
const logger = require('../utils/logger');

const router = Router();

router.post('/signup', async (req, res) => {
  try {
    const { email, password, businessName, businessType } = req.body;

    if (!email || !password || !businessName) {
      return res.status(400).json({ error: 'Email, password, and business name are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const existing = await getData(`/users/${email.replace('.', ',')}`);
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const workspaceId = uuidv4();
    const userId = uuidv4();

    const workspace = {
      plan: 'starter',
      businessName,
      businessType: businessType || 'other',
      brandTone: 'friendly',
      primaryLanguage: 'both',
      billingStatus: 'inactive',
      createdAt: Date.now(),
      ownerEmail: email,
    };

    await setData(`/workspaces/${workspaceId}/config`, workspace);
    await setData(`/users/${email.replace('.', ',')}`, {
      userId,
      email,
      workspaceId,
      passwordHash: hashedPassword,
      role: 'owner',
      createdAt: Date.now(),
    });

    const token = jwt.sign(
      { workspaceId, userId, email, role: 'owner' },
      config.jwtSecret,
      { expiresIn: '30d' }
    );

    logger.info('User signed up', { workspaceId, userId, email, businessName });

    res.status(201).json({
      token,
      workspaceId,
      onboarding: await getOnboardingStatus(workspaceId),
    });
  } catch (err) {
    logger.error('Signup error', { error: err.message });
    res.status(500).json({ error: 'Signup failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await getData(`/users/${email.replace('.', ',')}`);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { workspaceId: user.workspaceId, userId: user.userId, email, role: user.role },
      config.jwtSecret,
      { expiresIn: '30d' }
    );

    res.json({
      token,
      workspaceId: user.workspaceId,
      onboarding: await getOnboardingStatus(user.workspaceId),
    });
  } catch (err) {
    logger.error('Login error', { error: err.message });
    res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router;
