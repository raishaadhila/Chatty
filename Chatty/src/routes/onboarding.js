const { Router } = require('express');
const { requireWorkspace, loadWorkspace } = require('../middleware/workspace');
const { getOnboardingStatus, completeStep, getSampleMessages } = require('../onboarding/wizard');
const logger = require('../utils/logger');

const router = Router();

router.use(requireWorkspace, loadWorkspace);

router.get('/status', async (req, res) => {
  try {
    const status = await getOnboardingStatus(req.workspaceId);
    res.json(status);
  } catch (err) {
    logger.error('Onboarding status error', { workspaceId: req.workspaceId, error: err.message });
    res.status(500).json({ error: 'Failed to get onboarding status' });
  }
});

router.post('/step', async (req, res) => {
  try {
    const { step, data } = req.body;
    if (!step) {
      return res.status(400).json({ error: 'Step is required' });
    }

    const result = await completeStep(req.workspaceId, step, data);
    res.json(result);
  } catch (err) {
    logger.error('Onboarding step error', { workspaceId: req.workspaceId, error: err.message });
    res.status(400).json({ error: err.message });
  }
});

router.get('/samples', async (req, res) => {
  try {
    const businessType = req.workspace?.businessType || 'other';
    const samples = getSampleMessages(businessType);
    res.json({ samples, businessType });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get sample messages' });
  }
});

module.exports = router;
